const encoder = new TextEncoder();
export const PRODUCT = 'lymora-lan';
export const normalizeCode = value => typeof value === 'string' ? value.trim().toUpperCase() : '';
export const validCode = value => /^LYM-[A-F0-9]{32}$/.test(value);
export const validDeviceId = value => typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);
export const safeText = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max && !/[\x00-\x1f\x7f]/.test(value);
export const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
export const sha256 = async value => b64url(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
export function pemBytes(pem) {
  const body = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const raw = atob(body);
  return Uint8Array.from(raw, char => char.charCodeAt(0));
}
export async function issueToken(claims, pem) {
  const key = await crypto.subtle.importKey('pkcs8', pemBytes(pem), { name: 'Ed25519' }, false, ['sign']);
  const payload = encoder.encode(JSON.stringify(claims));
  const signature = await crypto.subtle.sign('Ed25519', key, payload);
  return `${b64url(payload)}.${b64url(signature)}`;
}
export async function readJson(request, limit = 4096) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > limit) throw new Error('Request is too large.');
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > limit) throw new Error('Request is too large.');
  try { return JSON.parse(text); } catch { throw new Error('Request body must be valid JSON.'); }
}
export const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
export function sameSecret(actual, expected) {
  if (!actual || !expected) return false;
  let diff = actual.length ^ expected.length;
  const length = Math.max(actual.length, expected.length);
  for (let i = 0; i < length; i++) diff |= (actual.charCodeAt(i % actual.length) || 0) ^ (expected.charCodeAt(i % expected.length) || 0);
  return diff === 0;
}
export const hasAdminAuthorization = (request, token) => sameSecret(request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '', token);
export function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return `LYM-${Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}
export async function createLicense(db, { organizationName, maxDevices, expiresAt, requestId = null }) {
  const code = newCode(), codeHash = await sha256(code), id = crypto.randomUUID();
  const organizationId = `org_${crypto.randomUUID().replace(/-/g, '')}`;
  const insert = db.prepare(`INSERT INTO licenses(id, code_hash, organization_id, organization_name, expires_at, max_devices, active, created_at)
    SELECT ?, ?, ?, ?, ?, ?, 1, ? WHERE ? IS NULL OR EXISTS(SELECT 1 FROM license_requests WHERE id = ? AND status = 'pending')`)
    .bind(id, codeHash, organizationId, organizationName, expiresAt, maxDevices, Date.now(), requestId, requestId);
  const update = db.prepare('UPDATE license_requests SET status = ?, issued_license_id = ? WHERE id = ? AND status = ?').bind('issued', id, requestId, 'pending');
  const results = requestId ? await db.batch([insert, update]) : [await insert.run()];
  if (results[0]?.meta?.changes !== 1) throw new Error('Request is no longer pending.');
  return { code, licenseId: id, maxDevices, expiresAt };
}
