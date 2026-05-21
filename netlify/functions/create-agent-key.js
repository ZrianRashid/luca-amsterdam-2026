// POST /.netlify/functions/create-agent-key   (admin only)
// Body: { name, description?, scopes? }
// Returns: { agent, apiKey }   — apiKey is the only time the raw key is returned.
const { preflight, ok, fail, readJson } = require('./_shared/http');
const { requireAdmin, newApiKey } = require('./_shared/auth');
const { svc } = require('./_shared/supabase');
const { isString } = require('./_shared/validate');

const DEFAULT_SCOPES = ['past_clients:read', 'activity:write'];

exports.handler = async (event) => {
  const pre = preflight(event); if (pre) return pre;
  if (event.httpMethod !== 'POST') return fail('POST only', 405);
  const adm = await requireAdmin(event);
  if (adm.error) return fail(adm.error, adm.status);

  const body = readJson(event);
  if (!body || !isString(body.name, 100) || !body.name.trim()) return fail('name required');
  const scopes = Array.isArray(body.scopes) && body.scopes.length ? body.scopes : DEFAULT_SCOPES;

  const { key, prefix, hash } = newApiKey();
  const { data: agent, error } = await svc()
    .from('hermes_agents')
    .insert({
      name: body.name.trim(),
      description: body.description || null,
      api_key_hash: hash,
      api_key_prefix: prefix,
      scopes,
      created_by: adm.user.id,
    })
    .select('id, name, description, status, scopes, api_key_prefix, created_at')
    .single();
  if (error) {
    console.error('create-agent-key', error);
    return fail('Could not create agent', 500);
  }
  return ok({ agent, apiKey: key });
};
