import { hasAdminAuthorization, response } from '../../../_shared/license.mjs';
interface Env { LICENSE_DB: D1Database; LICENSE_ADMIN_TOKEN: string }
interface Context { request: Request; env: Env }
function validLicenseId(value: string | null): value is string { return !!value && /^[0-9a-f-]{36}$/i.test(value); }
function validDeviceId(value: string | null): value is string { return !!value && /^[0-9a-f-]{36}$/i.test(value); }

export async function onRequestGet({ request, env }: Context) {
  if (!env.LICENSE_DB || !env.LICENSE_ADMIN_TOKEN) return response({ error: 'Admin access is not configured.' }, 503);
  if (!hasAdminAuthorization(request, env.LICENSE_ADMIN_TOKEN)) return response({ error: 'Unauthorized.' }, 401);
  const licenseId = new URL(request.url).searchParams.get('licenseId');
  if (!validLicenseId(licenseId)) return response({ error: 'A valid licenseId is required.' }, 400);
  try {
    const rows = await env.LICENSE_DB.prepare('SELECT device_id AS deviceId, activated_at AS activatedAt FROM license_devices WHERE license_id = ? ORDER BY activated_at ASC').bind(licenseId).all();
    return response({ devices: rows.results });
  } catch { return response({ error: 'Could not load device activations.' }, 503); }
}

export async function onRequestDelete({ request, env }: Context) {
  if (!env.LICENSE_DB || !env.LICENSE_ADMIN_TOKEN) return response({ error: 'Admin access is not configured.' }, 503);
  if (!hasAdminAuthorization(request, env.LICENSE_ADMIN_TOKEN)) return response({ error: 'Unauthorized.' }, 401);
  const params = new URL(request.url).searchParams;
  const licenseId = params.get('licenseId'), deviceId = params.get('deviceId');
  if (!validLicenseId(licenseId) || !validDeviceId(deviceId)) return response({ error: 'Valid licenseId and deviceId are required.' }, 400);
  try {
    const result = await env.LICENSE_DB.prepare('DELETE FROM license_devices WHERE license_id = ? AND device_id = ?').bind(licenseId, deviceId).run();
    return response({ released: (result.meta.changes || 0) === 1, note: 'This frees a server-side seat. It does not remotely invalidate a signed license already stored on that device.' });
  } catch { return response({ error: 'Could not release device seat.' }, 503); }
}