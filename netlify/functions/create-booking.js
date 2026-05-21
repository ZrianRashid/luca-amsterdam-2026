// POST /.netlify/functions/create-booking
// Body: { serviceId, startAt (ISO), guests, addonIds[], totalCents, customer: { email, fullName, phone?, language, marketingConsent }, notes? }
// Returns: { reference, cancelUrl, booking }
const { preflight, ok, fail, readJson } = require('./_shared/http');
const { svc } = require('./_shared/supabase');
const { isEmail, isInt, isIso, isLang, normalizeEmail, normalizePhone, isString } = require('./_shared/validate');
const email = require('./_shared/email');

const ADDRESS = 'LUCA Amsterdam — Zeeburgerkade 1314-1316, 1019 VK Amsterdam';

exports.handler = async (event) => {
  const pre = preflight(event); if (pre) return pre;
  if (event.httpMethod !== 'POST') return fail('POST only', 405);

  const body = readJson(event);
  if (!body) return fail('Bad JSON');

  const serviceId = body.serviceId;
  const startAt   = body.startAt;
  const guests    = Number(body.guests || 1);
  const addonIds  = Array.isArray(body.addonIds) ? body.addonIds.slice(0, 10).filter(x => typeof x === 'string') : [];
  const cust      = body.customer || {};
  const notes     = body.notes || null;
  const language  = isLang(cust.language) ? cust.language : 'nl';
  const totalCents = Number(body.totalCents || 0);

  // Validate
  if (!serviceId || !isString(serviceId, 64)) return fail('serviceId required');
  if (!isIso(startAt)) return fail('startAt invalid');
  if (!isInt(guests, 1, 50)) return fail('guests invalid');
  if (!isInt(totalCents, 0, 1_000_000)) return fail('totalCents invalid');
  if (!isEmail(cust.email)) return fail('email invalid');
  if (cust.fullName && !isString(cust.fullName, 200)) return fail('fullName too long');
  if (notes && !isString(notes, 2000)) return fail('notes too long');

  // Service lookup
  const { data: service, error: svcErr } = await svc().from('services').select('*').eq('id', serviceId).eq('active', true).maybeSingle();
  if (svcErr) return fail('DB error', 500);
  if (!service) return fail('Service not available', 404);

  // Server-side total verification (use service price + addons)
  const { data: addonRows } = await svc().from('addons').select('id, price_cents').in('id', addonIds.length ? addonIds : ['__none__']);
  const addonMap = new Map((addonRows || []).map(r => [r.id, r.price_cents]));
  let serverTotal = service.price_cents * (service.requires_guests ? 1 : guests);
  for (const id of addonIds) {
    const p = addonMap.get(id);
    if (p == null) return fail('Unknown addon: ' + id);
    serverTotal += p * (service.requires_guests ? 1 : guests);
  }
  // Allow a small client/server rounding mismatch; otherwise trust the server total.
  const useTotal = Math.abs(serverTotal - totalCents) <= 50 ? totalCents : serverTotal;

  const start = new Date(startAt);
  if (start.getTime() < Date.now() - 60_000) return fail('Cannot book in the past');
  const end = new Date(start.getTime() + service.duration_min * 60_000);

  // Daily capacity check (soft)
  if (service.daily_capacity != null) {
    const dayStart = new Date(start); dayStart.setUTCHours(0,0,0,0);
    const dayEnd   = new Date(dayStart.getTime() + 86400000);
    const { count } = await svc()
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('service_id', serviceId)
      .in('status', ['pending','confirmed'])
      .gte('start_at', dayStart.toISOString())
      .lt('start_at', dayEnd.toISOString());
    if (typeof count === 'number' && count >= service.daily_capacity) {
      return fail('Capacity reached for this day', 409, { reason: 'capacity' });
    }
  }

  // Upsert customer
  const { data: customer, error: cErr } = await svc().rpc('upsert_customer', {
    p_email: normalizeEmail(cust.email),
    p_full_name: cust.fullName || null,
    p_phone: normalizePhone(cust.phone),
    p_language: language,
    p_consent: !!cust.marketingConsent,
    p_source: 'web',
  }).single();
  if (cErr || !customer) {
    console.error('upsert_customer', cErr);
    return fail('Customer save failed', 500);
  }

  // Insert booking
  const { data: booking, error: bErr } = await svc()
    .from('bookings')
    .insert({
      customer_id: customer.id,
      service_id: serviceId,
      start_at: start.toISOString(),
      end_at:   end.toISOString(),
      guests,
      total_cents: useTotal,
      addon_ids: addonIds,
      status: 'confirmed',
      source: 'web',
      notes,
    })
    .select('*')
    .single();
  if (bErr || !booking) {
    console.error('insert booking', bErr);
    return fail('Booking save failed', 500);
  }

  // Email
  const cancelUrl = `${event.headers['x-forwarded-proto'] || 'https'}://${event.headers.host}/cancel.html?ref=${encodeURIComponent(booking.reference)}&token=${encodeURIComponent(booking.cancel_token)}`;
  const serviceName = language === 'nl' ? service.name_nl : service.name_en;
  const dateLabel = formatDate(start, language);
  const time = formatTime(start);
  const totalEuros = formatEuros(booking.total_cents, language);
  const addonNames = [];
  if (addonIds.length) {
    const { data: aRows } = await svc().from('addons').select('id, name_nl, name_en').in('id', addonIds);
    for (const a of aRows || []) addonNames.push(language === 'nl' ? a.name_nl : a.name_en);
  }
  try {
    const msg = email.bookingConfirmation({
      language, customerName: customer.full_name, reference: booking.reference,
      serviceName, durationMin: service.duration_min, dateLabel, time, guests,
      addons: addonNames, totalEuros, cancelUrl, address: ADDRESS,
    });
    await email.send({ to: customer.email, ...msg });
  } catch (e) {
    console.error('email send failed', e);
    // Don't block the booking on email failure — log + continue.
  }

  return ok({
    reference: booking.reference,
    cancelUrl,
    booking: {
      reference: booking.reference,
      service_id: booking.service_id,
      start_at: booking.start_at,
      end_at: booking.end_at,
      guests: booking.guests,
      total_cents: booking.total_cents,
      status: booking.status,
    },
  });
};

function formatDate(d, lang) {
  return new Intl.DateTimeFormat(lang === 'nl' ? 'nl-NL' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(d);
}
function formatTime(d) {
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
function formatEuros(cents, lang) {
  const v = (cents / 100);
  if (Number.isInteger(v)) return String(v);
  const s = v.toFixed(2);
  return lang === 'nl' ? s.replace('.', ',') : s;
}
