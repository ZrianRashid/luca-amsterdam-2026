// GET /.netlify/functions/get-availability?serviceId=sauna60&from=2026-05-21&to=2026-06-21
// Returns { days: { 'YYYY-MM-DD': 'low'|'med'|'high'|'full'|'past' }, slots: { 'YYYY-MM-DD': [{ time, status }] } }
const { preflight, ok, fail } = require('./_shared/http');
const { svc } = require('./_shared/supabase');

exports.handler = async (event) => {
  const pre = preflight(event); if (pre) return pre;
  if (event.httpMethod !== 'GET') return fail('GET only', 405);

  const params = new URLSearchParams(event.rawQuery || event.queryStringParameters && new URLSearchParams(event.queryStringParameters).toString() || '');
  // event.queryStringParameters is the source of truth on Netlify
  const q = event.queryStringParameters || {};
  const serviceId = q.serviceId;
  const fromStr   = q.from;
  const toStr     = q.to;
  if (!serviceId) return fail('serviceId required');

  // Bounds
  const today = new Date(); today.setUTCHours(0,0,0,0);
  const from = fromStr ? new Date(fromStr) : today;
  const to   = toStr   ? new Date(toStr)   : new Date(today.getTime() + 60 * 86400000);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return fail('Bad from/to');

  // Service
  const { data: service, error: svcErr } = await svc().from('services').select('*').eq('id', serviceId).maybeSingle();
  if (svcErr) return fail('DB error', 500);
  if (!service) return fail('Service not found', 404);

  // Existing bookings in range, this service
  const { data: bookings, error: bErr } = await svc()
    .from('bookings')
    .select('start_at, end_at, status')
    .eq('service_id', serviceId)
    .in('status', ['pending','confirmed'])
    .gte('start_at', from.toISOString())
    .lt('start_at', new Date(to.getTime() + 86400000).toISOString());
  if (bErr) return fail('DB error', 500);

  // Bucket by day
  const byDay = {};
  for (const b of bookings || []) {
    const d = b.start_at.slice(0, 10);
    byDay[d] = (byDay[d] || 0) + 1;
  }

  const capacity = service.daily_capacity || null;
  const days = {};
  for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    if (d < today) { days[iso] = 'past'; continue; }
    const used = byDay[iso] || 0;
    if (capacity == null) {
      // No cap → approximate band by raw count for visual cue
      if (used >= 8)      days[iso] = 'high';
      else if (used >= 3) days[iso] = 'med';
      else                days[iso] = 'low';
      continue;
    }
    const ratio = used / capacity;
    if (ratio >= 1)       days[iso] = 'full';
    else if (ratio >= .7) days[iso] = 'high';
    else if (ratio >= .35)days[iso] = 'med';
    else                  days[iso] = 'low';
  }

  return ok({ serviceId, capacity, days });
};
