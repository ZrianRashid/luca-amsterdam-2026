// HTTP helpers for Netlify Functions.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function preflight(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  return null;
}

function ok(body, statusCode = 200) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body ?? {}) };
}

function fail(message, statusCode = 400, extra = {}) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: message, ...extra }),
  };
}

function methodNotAllowed(method) {
  return fail(`Method ${method} not allowed`, 405);
}

function readJson(event) {
  if (!event.body) return {};
  try {
    if (event.isBase64Encoded) {
      return JSON.parse(Buffer.from(event.body, 'base64').toString('utf-8'));
    }
    return JSON.parse(event.body);
  } catch (e) {
    return null;
  }
}

function bearer(event) {
  const h = event.headers?.authorization || event.headers?.Authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

module.exports = { CORS_HEADERS, preflight, ok, fail, methodNotAllowed, readJson, bearer };
