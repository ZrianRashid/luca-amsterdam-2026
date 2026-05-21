// POST /.netlify/functions/cancel-booking
// Body: { ref, token, reason? }
const { preflight, ok, fail, readJson } = require('./_shared/http');
const { svc } = require('./_shared/supabase');

exports.handler = async (event) => {
  const pre = preflight(event); if (pre) return pre;
  if (event.httpMethod !== 'POST') return fail('POST only', 405);
  const body = readJson(event);
  if (!body) return fail('Bad JSON');
  const { ref, token, reason } = body;
  if (!ref || !token) return fail('ref + token required');

  const { data: existing, error: lookupErr } = await svc()
    .from('bookings')
    .select('id, status, cancel_token, start_at')
    .eq('reference', ref)
    .maybeSingle();
  if (lookupErr) return fail('DB error', 500);
  if (!existing) return fail('Booking not found', 404);
  if (existing.cancel_token !== token) return fail('Unauthorized', 403);
  if (existing.status === 'cancelled') return ok({ status: 'cancelled', alreadyCancelled: true });
  if (existing.status === 'completed') return fail('Cannot cancel a completed booking', 409);

  const { data: updated, error: updErr } = await svc()
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancelled_reason: reason || 'customer' })
    .eq('id', existing.id)
    .select('*')
    .single();
  if (updErr) return fail('Update failed', 500);

  return ok({ status: updated.status, reference: updated.reference });
};
