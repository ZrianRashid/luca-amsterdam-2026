// Input validation helpers. Keep them small and explicit.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(s)   { return typeof s === 'string' && EMAIL_RE.test(s.trim()); }
function isString(s, max = 500) { return typeof s === 'string' && s.length <= max; }
function isInt(n, min = -Infinity, max = Infinity) {
  return Number.isInteger(n) && n >= min && n <= max;
}
function isIso(s) {
  if (typeof s !== 'string') return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}
function isLang(s) { return s === 'nl' || s === 'en'; }

function normalizeEmail(s) {
  return typeof s === 'string' ? s.trim().toLowerCase() : '';
}
function normalizePhone(s) {
  if (typeof s !== 'string') return null;
  const t = s.replace(/[\s().-]/g, '');
  if (t.length < 6) return null;
  return t;
}

module.exports = { isEmail, isString, isInt, isIso, isLang, normalizeEmail, normalizePhone };
