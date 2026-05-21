// GET /.netlify/functions/get-booking?ref=LUC-XXXXXX&token=...
// Returns the booking + service if reference + cancel_token match. Used by cancel.html.
const { preflight, ok, fail } = require('./_shared/http');
const { svc } = require('./_shared/supabase');

exports.handler = async (event) => {
  const pre = preflight(event); if (pre) return pre;
  if (event.httpMethod !== 'GET') return fail('GET only', 405);
  const q = event.queryStringParameters || {};
  const ref = q.ref;
  const token = q.token;
  if (!ref || !token) return fail('ref + token required');

  const { data, error } = await svc()
    .from('bookings')
    .select('id, reference, status, start_at, end_at, guests, total_cents, addon_ids, service_id, customer_id, cancel_token')
    .eq('reference', ref)
    .maybeSingle();
  if (error) return fail('DB error', 500);
  if (!data) return fail('Booking not found', 404);
  if (data.cancel_token !== token) return fail('Unauthorized', 403);

  const [{ data: service }, { data: customer }] = await Promise.all([
    svc().from('services').select('id, name_nl, name_en, duration_min, category').eq('id', data.service_id).maybeSingle(),
    svc().from('customers').select('email, full_name, language').eq('id', data.customer_id).maybeSingle(),
  ]);

  return ok({
    booking: {
      reference: data.reference,
      status: data.status,
      start_at: data.start_at,
      end_at: data.end_at,
      guests: data.guests,
      total_cents: data.total_cents,
      addon_ids: data.addon_ids,
    },
    service,
    customer,
  });
};
