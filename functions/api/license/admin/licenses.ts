import { hasAdminAuthorization, readJson, response } from '../../../_shared/license.mjs';
interface Env { LICENSE_DB: D1Database; LICENSE_ADMIN_TOKEN: string }
interface Context { request: Request; env: Env }
const validId = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);

export async function onRequestGet({ request, env }: Context) {
  if (!env.LICENSE_DB || !env.LICENSE_ADMIN_TOKEN) return response({ error: 'Admin access is not configured.' }, 503);
  if (!hasAdminAuthorization(request, env.LICENSE_ADMIN_TOKEN)) return response({ error: 'Unauthorized.' }, 401);
  try {
    const rows = await env.LICENSE_DB.prepare(`SELECT l.id, l.organization_id AS organizationId, l.organization_name AS organization, l.expires_at AS expiresAt, l.max_devices AS seatLimit, l.active, l.created_at AS createdAt, COUNT(d.device_id) AS activatedDevices FROM licenses l LEFT JOIN license_devices d ON d.license_id = l.id GROUP BY l.id ORDER BY l.created_at DESC LIMIT 500`).all();
    return response({ licenses: rows.results });
  } catch { return response({ error: 'Could not load licenses.' }, 503); }
}

export async function onRequestPatch({ request, env }: Context) {
  if (!env.LICENSE_DB || !env.LICENSE_ADMIN_TOKEN) return response({ error: 'Admin access is not configured.' }, 503);
  if (!hasAdminAuthorization(request, env.LICENSE_ADMIN_TOKEN)) return response({ error: 'Unauthorized.' }, 401);
  let input: { licenseId?: unknown; active?: unknown };
  try { input = await readJson(request); } catch (error) { return response({ error: (error as Error).message }, 400); }
  if (!validId(input?.licenseId) || typeof input?.active !== 'boolean') return response({ error: 'A valid license ID and active state are required.' }, 400);
  try {
    const result = await env.LICENSE_DB.prepare('UPDATE licenses SET active = ? WHERE id = ?').bind(input.active ? 1 : 0, input.licenseId).run();
    if ((result.meta.changes || 0) !== 1) return response({ error: 'License not found.' }, 404);
    return response({ licenseId: input.licenseId, active: input.active });
  } catch { return response({ error: 'Could not update license state.' }, 503); }
}