// Minimal RFC-4180-ish CSV parser. Handles quoted fields, doubled quotes, CRLF.
// Returns { header: string[], rows: string[][] }. No deps.

function parseCSV(text) {
  if (typeof text !== 'string' || !text.length) return { header: [], rows: [] };
  const out = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); out.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  // tail
  if (field.length || row.length) { row.push(field); out.push(row); }
  // strip trailing blank rows
  while (out.length && out[out.length - 1].every(v => v === '')) out.pop();
  const header = (out.shift() || []).map(h => h.trim());
  return { header, rows: out };
}

// Auto-map header tokens to canonical fields.
const FIELD_GUESSES = {
  email:      ['email','e-mail','e_mail','emailaddress','mail'],
  full_name:  ['name','full name','fullname','volledige naam','naam'],
  first_name: ['first name','firstname','voornaam','first'],
  last_name:  ['last name','lastname','achternaam','surname','last'],
  phone:      ['phone','phone number','telephone','telefoon','tel','mobile','mobiel','gsm'],
  language:   ['language','taal','lang','locale'],
  notes:      ['notes','note','opmerkingen','opmerking','comment','comments'],
  tags:       ['tags','tag','labels','label'],
  marketing_consent: ['consent','marketing','marketing consent','opt-in','optin','newsletter'],
};

function guessMapping(header) {
  const mapping = {};
  for (let i = 0; i < header.length; i++) {
    const h = (header[i] || '').toLowerCase().trim();
    if (!h) continue;
    for (const [field, options] of Object.entries(FIELD_GUESSES)) {
      if (mapping[field] !== undefined) continue;
      if (options.includes(h)) { mapping[field] = i; break; }
    }
  }
  return mapping;
}

function rowToCustomer(row, mapping) {
  const pick = (k) => mapping[k] !== undefined ? (row[mapping[k]] ?? '').trim() : '';
  let full_name = pick('full_name');
  const first = pick('first_name');
  const last  = pick('last_name');
  if (!full_name && (first || last)) full_name = [first, last].filter(Boolean).join(' ').trim();

  const email = pick('email').toLowerCase();
  const phoneRaw = pick('phone');
  const phone = phoneRaw ? phoneRaw.replace(/[\s().-]/g, '') : '';
  let language = pick('language').toLowerCase().slice(0, 2);
  if (language !== 'nl' && language !== 'en') language = 'nl';
  const consentRaw = pick('marketing_consent').toLowerCase();
  const marketing_consent = ['1','true','yes','y','ja'].includes(consentRaw);
  const tagsRaw = pick('tags');
  const tags = tagsRaw ? tagsRaw.split(/[,;|]/).map(t => t.trim()).filter(Boolean) : [];
  const notes = pick('notes');

  return { email, phone: phone || null, full_name: full_name || null, language, marketing_consent, tags, notes: notes || null };
}

module.exports = { parseCSV, guessMapping, rowToCustomer, FIELD_GUESSES };
