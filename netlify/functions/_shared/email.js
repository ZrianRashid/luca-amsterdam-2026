// Transactional email via Resend. If no API key, logs and pretends to succeed —
// keeps the booking flow demoable in environments without a real Resend key.
const { Resend } = require('resend');

const FROM = process.env.LUCA_FROM_EMAIL || 'LUCA Amsterdam <reserveringen@luca-amsterdam.nl>';
const REPLY_TO = process.env.LUCA_REPLY_TO || null;

let _resend;
function client() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

async function send({ to, subject, html, text }) {
  const c = client();
  if (!c) {
    console.log('[email-stub]', { to, subject, text: text?.slice(0, 120) });
    return { id: 'stub-' + Date.now(), stub: true };
  }
  const res = await c.emails.send({
    from: FROM,
    to,
    subject,
    html,
    text,
    ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
  });
  if (res.error) {
    console.error('[resend-error]', res.error);
    throw new Error(res.error.message || 'Email send failed');
  }
  return res.data || res;
}

// ─── Templates ───
function bookingConfirmation({ language, customerName, reference, serviceName, durationMin, dateLabel, time, guests, addons, totalEuros, cancelUrl, address }) {
  const nl = language === 'nl';
  const subject = nl
    ? `Reservering bevestigd · ${reference} · LUCA Amsterdam`
    : `Reservation confirmed · ${reference} · LUCA Amsterdam`;

  const greeting = nl ? `Hi ${customerName || 'daar'},` : `Hi ${customerName || 'there'},`;
  const intro    = nl ? 'Bedankt voor je reservering bij LUCA Amsterdam. Hieronder de details.' : 'Thanks for booking with LUCA Amsterdam. Here are the details.';
  const lblService = nl ? 'Behandeling' : 'Service';
  const lblDate    = nl ? 'Datum'       : 'Date';
  const lblTime    = nl ? 'Tijd'        : 'Time';
  const lblGuests  = nl ? 'Gasten'      : 'Guests';
  const lblExtras  = nl ? 'Extra\'s'    : 'Add-ons';
  const lblTotal   = nl ? 'Totaal'      : 'Total';
  const lblAddress = nl ? 'Adres'       : 'Address';
  const lblRef     = nl ? 'Referentie'  : 'Reference';
  const cancelLbl  = nl ? 'Annuleren of wijzigen' : 'Cancel or change';
  const cancelLine = nl
    ? 'Wijzig of annuleer tot 24 uur van tevoren kosteloos.'
    : 'Change or cancel free of charge up to 24 hours in advance.';
  const closeLine  = nl ? 'Tot snel bij LUCA.' : 'See you soon at LUCA.';

  const text = [
    greeting, '',
    intro, '',
    `${lblRef}: ${reference}`,
    `${lblService}: ${serviceName} · ${durationMin} min`,
    `${lblDate}: ${dateLabel}`,
    `${lblTime}: ${time}`,
    `${lblGuests}: ${guests}`,
    addons?.length ? `${lblExtras}: ${addons.join(', ')}` : null,
    `${lblTotal}: €${totalEuros}`,
    '',
    `${lblAddress}: ${address}`,
    '',
    `${cancelLbl}: ${cancelUrl}`,
    cancelLine, '',
    closeLine, 'LUCA Amsterdam'
  ].filter(Boolean).join('\n');

  const html = `
<!doctype html><html><body style="margin:0;padding:0;background:#F6F3EC;font-family:Marcellus,Georgia,serif;color:#1A1714">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="font-family:'DM Sans',ui-sans-serif,system-ui;letter-spacing:0.18em;text-transform:uppercase;font-size:11px;color:#C9A86C;margin-bottom:8px">LUCA Amsterdam</div>
    <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:300;font-size:32px;letter-spacing:-0.01em;margin:0 0 8px;color:#1A1714">${nl ? 'Reservering bevestigd' : 'Reservation confirmed'}</h1>
    <p style="color:#6B635A;margin:0 0 28px;font-family:ui-sans-serif,system-ui;font-size:14px;line-height:1.6">${nl ? 'Referentie' : 'Reference'} <strong style="color:#1A1714;font-family:ui-monospace,Menlo,monospace">${reference}</strong></p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#fff;border:1px solid rgba(26,23,20,0.08);border-radius:12px;overflow:hidden">
      <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(26,23,20,0.06);font-family:ui-sans-serif,system-ui;font-size:13px;color:#6B635A;width:130px">${lblService}</td><td style="padding:14px 18px;border-bottom:1px solid rgba(26,23,20,0.06);font-family:'Cormorant Garamond',Georgia,serif;font-size:18px">${serviceName} · ${durationMin} min</td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(26,23,20,0.06);font-family:ui-sans-serif,system-ui;font-size:13px;color:#6B635A">${lblDate}</td><td style="padding:14px 18px;border-bottom:1px solid rgba(26,23,20,0.06);font-family:'Cormorant Garamond',Georgia,serif;font-size:18px">${dateLabel}</td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(26,23,20,0.06);font-family:ui-sans-serif,system-ui;font-size:13px;color:#6B635A">${lblTime}</td><td style="padding:14px 18px;border-bottom:1px solid rgba(26,23,20,0.06);font-family:'Cormorant Garamond',Georgia,serif;font-size:18px">${time}</td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(26,23,20,0.06);font-family:ui-sans-serif,system-ui;font-size:13px;color:#6B635A">${lblGuests}</td><td style="padding:14px 18px;border-bottom:1px solid rgba(26,23,20,0.06);font-family:'Cormorant Garamond',Georgia,serif;font-size:18px">${guests}</td></tr>
      ${addons?.length ? `<tr><td style="padding:14px 18px;border-bottom:1px solid rgba(26,23,20,0.06);font-family:ui-sans-serif,system-ui;font-size:13px;color:#6B635A">${lblExtras}</td><td style="padding:14px 18px;border-bottom:1px solid rgba(26,23,20,0.06);font-family:'Cormorant Garamond',Georgia,serif;font-size:16px">${addons.join(', ')}</td></tr>` : ''}
      <tr><td style="padding:14px 18px;font-family:ui-sans-serif,system-ui;font-size:13px;color:#6B635A">${lblTotal}</td><td style="padding:14px 18px;font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;color:#C9A86C">€${totalEuros}</td></tr>
    </table>

    <div style="margin-top:24px;padding:18px;border:1px solid rgba(26,23,20,0.08);border-radius:12px">
      <div style="font-family:ui-sans-serif,system-ui;font-size:13px;color:#6B635A;margin-bottom:4px">${lblAddress}</div>
      <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px">${address.replace(/\n/g, '<br>')}</div>
    </div>

    <div style="margin-top:28px;text-align:center">
      <a href="${cancelUrl}" style="display:inline-block;padding:13px 22px;background:#1A1714;color:#F6F3EC;text-decoration:none;border-radius:99px;font-family:'DM Sans',ui-sans-serif,system-ui;font-size:14px;letter-spacing:0.04em">${cancelLbl}</a>
      <p style="color:#6B635A;font-family:ui-sans-serif,system-ui;font-size:12px;margin:10px 0 0">${cancelLine}</p>
    </div>

    <p style="color:#6B635A;font-family:ui-sans-serif,system-ui;font-size:13px;margin:32px 0 0;text-align:center">${closeLine}<br>LUCA Amsterdam</p>
  </div>
</body></html>`;

  return { subject, text, html };
}

module.exports = { send, bookingConfirmation };
