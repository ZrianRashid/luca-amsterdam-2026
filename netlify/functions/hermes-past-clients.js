// GET /.netlify/functions/hermes-past-clients
// Auth: Bearer <agent api key>
// Query: ?tag=imported-2025-05 &since=2025-01-01 &limit=200
// Returns: { customers: [...] }
const { preflight, ok, fail } = require('./_shared/http');
const { requireAgent } = require('./_shared/auth');
const { svc } = require('./_shared/supabase');

exports.handler = async (event) => {
  const pre = preflight(event); if (pre) return pre;
  if (event.httpMethod !== 'GET') return fail('GET only', 405);
  const a = await requireAgent(event, 'past_clients:read');
  if (a.error) return fail(a.error, a.status);

  const q = event.queryStringParameters || {};
  const limit = Math.min(parseInt(q.limit || '200', 10) || 200, 1000);
  const since = q.since;
  const tag   = q.tag;

  let query = svc().from('customers').select('id, email, full_name, phone, language, tags, source, last_seen_at, first_seen_at, marketing_consent').order('last_seen_at', { ascending: false }).limit(limit);
  if (since) query = query.gte('last_seen_at', new Date(since).toISOString());
  if (tag)   query = query.contains('tags', [tag]);

  const { data, error } = await query;
  if (error) return fail('DB error', 500);
  return ok({ customers: data, count: (data || []).length });
};
