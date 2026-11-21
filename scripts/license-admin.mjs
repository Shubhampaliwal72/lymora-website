const [,, action, ...args] = process.argv;
const base = process.env.LYMORA_LICENSE_ADMIN_URL || 'https://lymora.in/api/license/admin';
const token = process.env.LYMORA_LICENSE_ADMIN_TOKEN;
if (!token) throw new Error('Set LYMORA_LICENSE_ADMIN_TOKEN in the current shell.');
const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
let response;
if (action === 'requests') response = await fetch(`${base}/requests`, { headers });
else if (action === 'delete-request') {
  const [id] = args;
  if (!/^[0-9a-f-]{36}$/i.test(id || '')) throw new Error('Usage: node scripts/license-admin.mjs delete-request <request-id>');
  response = await fetch(`${base}/requests?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers });
}
else if (action === 'issue') {
  const [organizationName, seats, days, requestId] = args;
  if (!organizationName || !/^\d+$/.test(seats || '') || (days !== 'never' && !/^\d+$/.test(days || ''))) throw new Error('Usage: node scripts/license-admin.mjs issue "Organization" <seats> <days|never> [request-id]');
  response = await fetch(`${base}/issue`, { method: 'POST', headers, body: JSON.stringify({ organizationName, maxDevices: Number(seats), expiresAt: days === 'never' ? null : Date.now() + Number(days) * 86400000, requestId: requestId || null }) });
} else throw new Error('Usage: node scripts/license-admin.mjs requests | delete-request <request-id> | issue ...');
const body = await response.json();
if (!response.ok) throw new Error(body.error || `Admin API failed (${response.status})`);
console.log(JSON.stringify(body, null, 2));
