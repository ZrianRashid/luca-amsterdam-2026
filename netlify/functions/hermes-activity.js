// POST /.netlify/functions/hermes-activity
// Auth: Bearer <agent api key>
// Body: { kind, customer_id?, customer_email?, payload? }
// Returns: { id, created_at }
const { preflight, ok, fail, readJson } = require('./_shared/http');
const { requireAgent } = require('./_shared/auth');
const { svc } = require('./_shared/supabase');
const { isEmail, isString } = require('./_shared/validate');

const ALLOWED_KINDS = new Set([
  'campaign_started','campaign_finished',
  'message_sent','message_failed',
  'reply_received','meeting_booked',
  'booking_recovered','unsubscribed',
  'note',
]);

exports.handler = async (event) => {
  const pre = preflight(event); if (pre) return pre;
  if (event.httpMethod !== 'POST') return fail('POST only', 405);
  const a = await requireAgent(event, 'activity:write');
  if (a.error) return fail(a.error, a.status);

  const body = readJson(event);
  if (!body) return fail('Bad JSON');
  if (!ALLOWED_KINDS.has(body.kind)) return fail('Bad kind');
  if (body.customer_email && !isEmail(body.customer_email)) return fail('Bad customer_email');
  const payload = body.payload && typeof body.payload === 'object' ? body.payload : {};
  if (JSON.stringify(payload).length > 16_000) return fail('payload too big');

  // Resolve customer
  let customer_id = body.customer_id || null;
  if (!customer_id && body.customer_email) {
    const { data } = await svc().from('customers').select('id').eq('email', body.customer_email.toLowerCase()).maybeSingle();
    customer_id = data?.id || null;
  }

  const { data, error } = await svc()
    .from('hermes_activity')
    .insert({ agent_id: a.agent.id, kind: body.kind, customer_id, payload })
    .select('id, created_at')
    .single();
  if (error) return fail('Insert failed', 500);

  return ok(data);
};
