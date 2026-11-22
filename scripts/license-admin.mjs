const [,, action, ...args] = process.argv;
const base = (process.env.LYMORA_LICENSE_ADMIN_URL || 'https://lymora.in/api/license/admin').replace(/\/$/, '');
const token = process.env.LYMORA_LICENSE_ADMIN_TOKEN;
const adminOrigin = new URL(base);
if (adminOrigin.protocol !== 'https:') throw new Error('The license admin CLI requires an HTTPS endpoint.');
if (!token) throw new Error('Set LYMORA_LICENSE_ADMIN_TOKEN in the current shell.');
const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
const idPattern = /^[0-9a-f-]{36}$/i;
let response;
if (action === 'requests') response = await fetch(`${base}/requests`, { headers });
else if (action === 'licenses') response = await fetch(`${base}/licenses`, { headers });
else if (action === 'devices') {
  const [licenseId] = args;
  if (!idPattern.test(licenseId || '')) throw new Error('Usage: node scripts/license-admin.mjs devices <license-id>');
  response = await fetch(`${base}/devices?licenseId=${encodeURIComponent(licenseId)}`, { headers });
} else if (action === 'release-device') {
  const [licenseId, deviceId] = args;
  if (!idPattern.test(licenseId || '') || !idPattern.test(deviceId || '')) throw new Error('Usage: node scripts/license-admin.mjs release-device <license-id> <device-id>');
  response = await fetch(`${base}/devices?licenseId=${encodeURIComponent(licenseId)}&deviceId=${encodeURIComponent(deviceId)}`, { method: 'DELETE', headers });
} else if (action === 'disable-license' || action === 'enable-license') {
  const [licenseId] = args;
  if (!idPattern.test(licenseId || '')) throw new Error(`Usage: node scripts/license-admin.mjs ${action} <license-id>`);
  response = await fetch(`${base}/licenses`, { method: 'PATCH', headers, body: JSON.stringify({ licenseId, active: action === 'enable-license' }) });
} else if (action === 'delete-request') {
  const [id] = args;
  if (!idPattern.test(id || '')) throw new Error('Usage: node scripts/license-admin.mjs delete-request <request-id>');
  response = await fetch(`${base}/requests?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers });
} else if (action === 'issue') {
  const [organizationName, seats, days, requestId] = args;
  if (!organizationName || !/^\d+$/.test(seats || '') || Number(seats) < 1 || Number(seats) > 500 || (days !== 'never' && (!/^\d+$/.test(days || '') || Number(days) < 1)) || (requestId && !idPattern.test(requestId))) throw new Error('Usage: node scripts/license-admin.mjs issue "Organization" <seats:1-500> <days>=1|never [request-id]');
  response = await fetch(`${base}/issue`, { method: 'POST', headers, body: JSON.stringify({ organizationName, maxDevices: Number(seats), expiresAt: days === 'never' ? null : Date.now() + Number(days) * 86400000, requestId: requestId || null }) });
} else throw new Error('Usage: node scripts/license-admin.mjs requests | licenses | devices <license-id> | issue ... | enable-license <license-id> | disable-license <license-id> | release-device <license-id> <device-id> | delete-request <request-id>');
const text = await response.text();
let body;
try { body = JSON.parse(text); } catch { throw new Error(`Admin API returned a non-JSON response (${response.status}).`); }
if (!response.ok) throw new Error(body.error || `Admin API failed (${response.status})`);
console.log(JSON.stringify(body, null, 2));