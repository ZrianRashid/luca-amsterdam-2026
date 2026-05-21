// Auth helpers: admin verification + Hermes API key verification.
const crypto = require('crypto');
const { svc, anonFor } = require('./supabase');

async function requireAdmin(event) {
  const auth = event.headers?.authorization || event.headers?.Authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return { error: 'Missing bearer token', status: 401 };
  const token = m[1];
  const sb = anonFor(token);
  const { data: userData, error } = await sb.auth.getUser();
  if (error || !userData?.user) return { error: 'Invalid token', status: 401 };
  const userId = userData.user.id;
  const { data: profile, error: pErr } = await svc().from('admin_profiles').select('id, role').eq('id', userId).maybeSingle();
  if (pErr) return { error: 'Lookup failed', status: 500 };
  if (!profile) return { error: 'Forbidden', status: 403 };
  return { user: userData.user, profile };
}

function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function newApiKey() {
  const raw = crypto.randomBytes(24).toString('base64url');
  const key = `luca_${raw}`;
  return { key, prefix: key.slice(0, 12), hash: hashApiKey(key) };
}

async function requireAgent(event, requiredScope) {
  const auth = event.headers?.authorization || event.headers?.Authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return { error: 'Missing bearer token', status: 401 };
  const hash = hashApiKey(m[1].trim());
  const { data: agent, error } = await svc()
    .from('hermes_agents')
    .select('*')
    .eq('api_key_hash', hash)
    .maybeSingle();
  if (error) return { error: 'Lookup failed', status: 500 };
  if (!agent) return { error: 'Invalid API key', status: 401 };
  if (agent.status !== 'active') return { error: `Agent ${agent.status}`, status: 403 };
  if (requiredScope && !(agent.scopes || []).includes(requiredScope)) {
    return { error: `Missing scope: ${requiredScope}`, status: 403 };
  }
  // touch last_seen_at (best-effort; ignore errors)
  svc().from('hermes_agents').update({ last_seen_at: new Date().toISOString() }).eq('id', agent.id).then(() => {});
  return { agent };
}

module.exports = { requireAdmin, requireAgent, newApiKey, hashApiKey };
