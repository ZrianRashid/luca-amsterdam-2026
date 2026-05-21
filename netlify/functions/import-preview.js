// POST /.netlify/functions/import-preview
// Body: { csv: <string>, filename?, mapping? }   (admin only)
// Returns: { jobId, header, mapping, rows: [{ index, customer, status }], counts }
// status: 'new' | 'duplicate' | 'invalid'
const { preflight, ok, fail, readJson } = require('./_shared/http');
const { requireAdmin } = require('./_shared/auth');
const { svc } = require('./_shared/supabase');
const { parseCSV, guessMapping, rowToCustomer } = require('./_shared/csv');
const { isEmail, normalizePhone } = require('./_shared/validate');

const MAX_ROWS = 5000;

exports.handler = async (event) => {
  const pre = preflight(event); if (pre) return pre;
  if (event.httpMethod !== 'POST') return fail('POST only', 405);
  const adm = await requireAdmin(event);
  if (adm.error) return fail(adm.error, adm.status);

  const body = readJson(event);
  if (!body || typeof body.csv !== 'string') return fail('csv required');
  if (body.csv.length > 10 * 1024 * 1024) return fail('csv too large (10MB max)');

  const { header, rows } = parseCSV(body.csv);
  if (!header.length || !rows.length) return fail('Empty CSV');
  if (rows.length > MAX_ROWS) return fail(`Too many rows (${rows.length} > ${MAX_ROWS})`);

  const mapping = (body.mapping && typeof body.mapping === 'object') ? body.mapping : guessMapping(header);

  // Normalize and classify
  const parsed = rows.map((r, i) => ({ index: i, customer: rowToCustomer(r, mapping) }));
  const validEmails = parsed.filter(p => p.customer.email && isEmail(p.customer.email)).map(p => p.customer.email);
  const validPhones = parsed.filter(p => !p.customer.email && p.customer.phone).map(p => p.customer.phone);

  // Existing customers (by email)
  const existing = new Set();
  if (validEmails.length) {
    const chunks = chunk(validEmails, 200);
    for (const c of chunks) {
      const { data } = await svc().from('customers').select('email').in('email', c);
      for (const row of data || []) existing.add(row.email);
    }
  }
  // Existing customers (by phone)
  const existingPhones = new Set();
  if (validPhones.length) {
    const chunks = chunk(validPhones, 200);
    for (const c of chunks) {
      const { data } = await svc().from('customers').select('phone').in('phone', c);
      for (const row of data || []) existingPhones.add(row.phone);
    }
  }

  let nNew = 0, nDup = 0, nInv = 0;
  const enriched = parsed.map(p => {
    const c = p.customer;
    if (!c.email && !c.phone)   { nInv++; return { ...p, status: 'invalid', reason: 'no email or phone' }; }
    if (c.email && !isEmail(c.email)) { nInv++; return { ...p, status: 'invalid', reason: 'bad email' }; }
    if (c.email && existing.has(c.email)) { nDup++; return { ...p, status: 'duplicate', reason: 'email exists' }; }
    if (!c.email && c.phone && existingPhones.has(c.phone)) { nDup++; return { ...p, status: 'duplicate', reason: 'phone exists' }; }
    nNew++; return { ...p, status: 'new' };
  });

  // Persist job (small preview only)
  const previewSlice = enriched.slice(0, 50);
  const { data: job, error: jobErr } = await svc()
    .from('import_jobs')
    .insert({
      filename: body.filename || null,
      status: 'previewed',
      row_count: parsed.length,
      insertable: nNew,
      duplicate_count: nDup,
      invalid_count: nInv,
      mapping,
      preview: { header, rows: enriched },
      tag: body.tag || null,
      created_by: adm.user.id,
    })
    .select('*')
    .single();
  if (jobErr) return fail('Could not save job', 500);

  return ok({
    jobId: job.id,
    header,
    mapping,
    counts: { total: parsed.length, new: nNew, duplicate: nDup, invalid: nInv },
    preview: previewSlice,
  });
};

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
