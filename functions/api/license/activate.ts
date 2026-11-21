import { PRODUCT, normalizeCode, validCode, validDeviceId, sha256, issueToken, readJson, response } from '../../_shared/license.mjs';
interface Env { LICENSE_DB: D1Database; LICENSE_SIGNING_PRIVATE_KEY: string }
interface Context { request: Request; env: Env }
interface ActivationBody { code?: unknown; deviceId?: unknown }
interface LicenseRow { id: string; organization_id: string; organization_name: string; expires_at: number | null; max_devices: number; active: number }
export async function onRequestPost({ request, env }: Context) {
  if (request.headers.get('origin') && request.headers.get('origin') !== 'https://lymora.in') return response({ error: 'Request origin is not allowed.' }, 403);
  if (!env.LICENSE_DB || !env.LICENSE_SIGNING_PRIVATE_KEY) return response({ error: 'License activation is not configured.' }, 503);
  let input: ActivationBody;
  try { input = await readJson<ActivationBody>(request); } catch (error) { return response({ error: (error as Error).message }, 400); }
  const code = normalizeCode(input?.code), deviceId = input?.deviceId;
  if (!validCode(code) || !validDeviceId(deviceId)) return response({ error: 'License code or installation identifier is invalid.' }, 400);
  const now = Date.now(), ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const windowStart = Math.floor(now / 900000) * 900000;
  const bucket = await sha256(`${ip}:${windowStart}`);
  try {
    await env.LICENSE_DB.prepare('DELETE FROM license_rate_limits WHERE window_start < ?').bind(now - 172800000).run();
    const limiter = await env.LICENSE_DB.prepare('INSERT INTO license_rate_limits(bucket_hash, window_start, attempts) VALUES(?, ?, 1) ON CONFLICT(bucket_hash, window_start) DO UPDATE SET attempts = attempts + 1 RETURNING attempts').bind(bucket, windowStart).first<{attempts:number}>();
    if (!limiter || limiter.attempts > 10) return response({ error: 'Too many activation attempts. Try again later.' }, 429);
    const codeHash = await sha256(code);
    const license = await env.LICENSE_DB.prepare('SELECT id, organization_id, organization_name, expires_at, max_devices, active FROM licenses WHERE code_hash = ?').bind(codeHash).first<LicenseRow>();
    if (!license || !license.active) return response({ error: 'License code is invalid or inactive.' }, 409);
    if (license.expires_at !== null && license.expires_at <= now) return response({ error: 'License code has expired.' }, 410);
    const licenseId = license.id;
    await env.LICENSE_DB.prepare(`INSERT INTO license_devices(license_id, device_id, activated_at)
      SELECT ?, ?, ? WHERE
      ((SELECT COUNT(*) FROM license_devices WHERE license_id = ?) < ? OR EXISTS(SELECT 1 FROM license_devices WHERE license_id = ? AND device_id = ?))
      ON CONFLICT(license_id, device_id) DO NOTHING`).bind(licenseId, deviceId, now, licenseId, license.max_devices, licenseId, deviceId).run();
    const seat = await env.LICENSE_DB.prepare('SELECT 1 AS active FROM license_devices WHERE license_id = ? AND device_id = ?').bind(licenseId, deviceId).first();
    if (!seat) return response({ error: 'License code has no available device seats.' }, 409);
    const claims = { version: 1, product: PRODUCT, licenseId, organizationId: license.organization_id, organizationName: license.organization_name, deviceId, issuedAt: now, expiresAt: license.expires_at };
    return response({ license: await issueToken(claims, env.LICENSE_SIGNING_PRIVATE_KEY) });
  } catch { return response({ error: 'License activation is temporarily unavailable.' }, 503); }
}
