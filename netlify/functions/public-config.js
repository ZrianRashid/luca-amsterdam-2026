// GET /.netlify/functions/public-config — returns values safe to expose in the browser.
const { preflight, ok, fail } = require('./_shared/http');

exports.handler = async (event) => {
  const pre = preflight(event); if (pre) return pre;
  if (event.httpMethod !== 'GET') return fail('GET only', 405);
  return ok({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  });
};
