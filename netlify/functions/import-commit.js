// POST /.netlify/functions/import-commit
// Body: { jobId, tag? }    (admin only)
// Inserts all rows from the saved preview that are status === 'new'.
const { preflight, ok, fail, readJson } = require('./_shared/http');
const { requireAdmin } = require('./_shared/auth');
const { svc } = require('./_shared/supabase');

exports.handler = async (event) => {
  const pre = preflight(event); if (pre) return pre;
  if (event.httpMethod !== 'POST') return fail('POST only', 405);
  const adm = await requireAdmin(event);
  if (adm.error) return fail(adm.error, adm.status);

  const body = readJson(event);
  if (!body || !body.jobId) return fail('jobId required');

  const { data: job, error: jobErr } = await svc().from('import_jobs').select('*').eq('id', body.jobId).maybeSingle();
  if (jobErr) return fail('DB error', 500);
  if (!job) return fail('Job not found', 404);
  if (job.status === 'committed') return ok({ alreadyCommitted: true, inserted: job.inserted_count });

  const rows = (job.preview?.rows || []).filter(r => r.status === 'new');
  const tag = body.tag || job.tag || ('imported-' + new Date().toISOString().slice(0, 10));
  if (!rows.length) {
    await svc().from('import_jobs').update({ status: 'committed', inserted_count: 0 }).eq('id', job.id);
    return ok({ inserted: 0 });
  }

  // Insert in batches; skip conflicts in case of races.
  let inserted = 0;
  for (const batch of chunk(rows, 200)) {
    const payload = batch.map(b => ({
      email: b.customer.email,
      phone: b.customer.phone || null,
      full_name: b.customer.full_name || null,
      language: b.customer.language || 'nl',
      marketing_consent: !!b.customer.marketing_consent,
      tags: Array.from(new Set([...(b.customer.tags || []), tag])),
      notes: b.customer.notes || null,
      source: 'import',
    }));
    const { data, error } = await svc().from('customers').upsert(payload, { onConflict: 'email', ignoreDuplicates: true }).select('id');
    if (error) {
      console.error('import insert', error);
      continue;
    }
    inserted += (data || []).length;
  }

  await svc().from('import_jobs').update({ status: 'committed', inserted_count: inserted, tag }).eq('id', job.id);
  return ok({ inserted, tag });
};

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
