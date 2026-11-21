import { safeText, readJson, response } from '../../_shared/license.mjs';
import { sha256 } from '../../_shared/license.mjs';
interface Env { LICENSE_DB: D1Database }
interface Context { request: Request; env: Env }
interface RequestBody { organization?: unknown; email?: unknown; consent?: unknown }
export async function onRequestPost({ request, env }: Context) {
  if (request.headers.get('origin') && request.headers.get('origin') !== 'https://lymora.in') return response({ error: 'Request origin is not allowed.' }, 403);
  if (!env.LICENSE_DB) return response({ error: 'Organization requests are temporarily unavailable.' }, 503);
  let input: RequestBody;
  try { input = await readJson<RequestBody>(request); } catch (error) { return response({ error: (error as Error).message }, 400); }
  const organization = typeof input?.organization === 'string' ? input.organization.trim() : '';
  const email = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (!safeText(organization, 120) || !/^[^\s@]{1,64}@[^\s@.]{1,190}(?:\.[^\s@.]{2,})+$/.test(email) || email.length > 254 || input?.consent !== true) return response({ error: 'Enter a valid organization and email, and agree to the privacy notice.' }, 400);
  const now = Date.now(), ip = request.headers.get('cf-connecting-ip') || 'unknown', windowStart = Math.floor(now / 3600000) * 3600000;
  try {
    const bucket = await sha256(`request:${ip}:${windowStart}`);
    await env.LICENSE_DB.prepare('DELETE FROM license_rate_limits WHERE window_start < ?').bind(now - 172800000).run();
    const row = await env.LICENSE_DB.prepare('INSERT INTO license_rate_limits(bucket_hash, window_start, attempts) VALUES(?, ?, 1) ON CONFLICT(bucket_hash, window_start) DO UPDATE SET attempts = attempts + 1 RETURNING attempts').bind(bucket, windowStart).first<{attempts:number}>();
    if (!row || row.attempts > 4) return response({ error: 'Too many requests. Try again later.' }, 429);
    const id = crypto.randomUUID();
    await env.LICENSE_DB.prepare('INSERT INTO license_requests(id, organization_name, contact_email, created_at, status) VALUES(?, ?, ?, ?, ?)').bind(id, organization, email, now, 'pending').run();
    return response({ received: true, requestId: id }, 201);
  } catch { return response({ error: 'Could not save the request. Please try again later.' }, 503); }
}
