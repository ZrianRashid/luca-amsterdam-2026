// Supabase clients for Netlify Functions.
// - svc: full server-role client (bypasses RLS) for trusted server operations.
// - anonFor(req): anon client bound to a user's bearer token, for RLS-enforced calls.
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY     = process.env.SUPABASE_ANON_KEY;

let _svc;
function svc() {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Supabase env not set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  if (!_svc) _svc = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  return _svc;
}

function anonFor(bearer) {
  if (!SUPABASE_URL || !ANON_KEY) throw new Error('Supabase env not set (SUPABASE_URL, SUPABASE_ANON_KEY)');
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
    global: bearer ? { headers: { Authorization: `Bearer ${bearer}` } } : {},
  });
}

module.exports = { svc, anonFor };
