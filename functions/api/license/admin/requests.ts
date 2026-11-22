import { hasAdminAuthorization, response } from '../../../_shared/license.mjs';
interface Env { LICENSE_DB: D1Database; LICENSE_ADMIN_TOKEN: string }
interface Context { request: Request; env: Env }
export async function onRequestGet({ request, env }: Context) {
  if (!env.LICENSE_DB || !env.LICENSE_ADMIN_TOKEN) return response({ error: 'Admin access is not configured.' }, 503);
  if (!hasAdminAuthorization(request, env.LICENSE_ADMIN_TOKEN)) return response({ error: 'Unauthorized.' }, 401);
  try { const rows = await env.LICENSE_DB.prepare('SELECT id, organization_name AS organization, contact_email AS email, created_at AS createdAt, status FROM license_requests WHERE status = ? ORDER BY created_at ASC LIMIT 100').bind('pending').all(); return response({ requests: rows.results }); }
  catch { return response({ error: 'Could not load requests.' }, 503); }
}
export async function onRequestDelete({ request, env }: Context) {
  if (!env.LICENSE_DB || !env.LICENSE_ADMIN_TOKEN) return response({ error: 'Admin access is not configured.' }, 503);
  if (!hasAdminAuthorization(request, env.LICENSE_ADMIN_TOKEN)) return response({ error: 'Unauthorized.' }, 401);
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) return response({ error: 'A valid request ID is required.' }, 400);
  try { const result = await env.LICENSE_DB.prepare('DELETE FROM license_requests WHERE id = ?').bind(id).run(); return response({ deleted: (result.meta.changes || 0) === 1 }); }
  catch { return response({ error: 'Could not delete the request.' }, 503); }
}
