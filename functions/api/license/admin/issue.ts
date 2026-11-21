import { safeText, sameSecret, createLicense, readJson, response } from '../../../_shared/license.mjs';

interface Env { LICENSE_DB: D1Database; LICENSE_ADMIN_TOKEN: string }
interface Context { request: Request; env: Env }
interface IssueBody { organizationName?: unknown; maxDevices?: unknown; expiresAt?: unknown; requestId?: unknown }

export async function onRequestPost({ request, env }: Context) {
  if (!env.LICENSE_DB || !env.LICENSE_ADMIN_TOKEN) return response({ error: 'Admin issuance is not configured.' }, 503);
  if (!sameSecret(request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '', env.LICENSE_ADMIN_TOKEN)) return response({ error: 'Unauthorized.' }, 401);
  let input: IssueBody;
  try { input = await readJson<IssueBody>(request); } catch (error) { return response({ error: (error as Error).message }, 400); }
  const organizationName = typeof input?.organizationName === 'string' ? input.organizationName.trim() : '';
  const maxDevices = input?.maxDevices;
  const expiresAt = input?.expiresAt === null ? null : input?.expiresAt;
  const requestId = typeof input?.requestId === 'string' ? input.requestId : null;
  if (!safeText(organizationName, 120) || typeof maxDevices !== 'number' || !Number.isInteger(maxDevices) || maxDevices < 1 || maxDevices > 500 || (expiresAt !== null && (typeof expiresAt !== 'number' || !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()))) return response({ error: 'Organization, seat count, or expiry is invalid.' }, 400);
  try { return response(await createLicense(env.LICENSE_DB, { organizationName, maxDevices, expiresAt, requestId })); }
  catch (error) { return response({ error: (error as Error).message === 'Request is no longer pending.' ? 'Request is no longer pending.' : 'Could not issue the license.' }, (error as Error).message === 'Request is no longer pending.' ? 409 : 503); }
}
