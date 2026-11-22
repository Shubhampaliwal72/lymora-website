import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';

const sourceRoot = path.resolve('functions');
const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'lymora-pages-license-'));
const sharedUrl = pathToFileURL(path.join(sourceRoot, '_shared/license.mjs')).href;
async function loadFunction(source, name) {
  const input = await fs.readFile(path.join(sourceRoot, source), 'utf8');
  const transformed = input.replaceAll('../../../_shared/license.mjs', sharedUrl).replaceAll('../../_shared/license.mjs', sharedUrl);
  const output = ts.transpileModule(transformed, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  const file = path.join(tempRoot, name + '.mjs');
  await fs.writeFile(file, output);
  return import(pathToFileURL(file));
}
const activation = await loadFunction('api/license/activate.ts', 'activate');
const requestHandler = await loadFunction('api/license/request.ts', 'request');
const issueHandler = await loadFunction('api/license/admin/issue.ts', 'issue');
const requestsHandler = await loadFunction('api/license/admin/requests.ts', 'requests');
const licensesHandler = await loadFunction('api/license/admin/licenses.ts', 'licenses');
const devicesHandler = await loadFunction('api/license/admin/devices.ts', 'devices');
const keys = generateKeyPairSync('ed25519');
const privatePem = keys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const publicKey = keys.publicKey;
const adminToken = 'test-only-secret-token-not-for-production';

class MockD1 {
  licenses = [];
  devices = [];
  requests = [];
  limits = new Map();
  prepare(sql) {
    const db = () => this;
    return { values: [], bind(...values) { this.values = values; return this; },
      async first() {
        const v = this.values;
        if (sql.includes('license_rate_limits')) { const key = `${v[0]}:${v[1]}`; const attempts = (db().limits.get(key) || 0) + 1; db().limits.set(key, attempts); return { attempts }; }
        if (sql.includes('FROM licenses WHERE code_hash')) return db().licenses.find(row => row.code_hash === v[0]) || null;
        if (sql.includes('FROM license_devices WHERE license_id = ? AND device_id = ?')) return db().devices.some(row => row.license_id === v[0] && row.device_id === v[1]) ? { active: 1 } : null;
        return null;
      },
      async all() { if (sql.includes('FROM license_requests')) return { results: db().requests.filter(row => row.status === 'pending').map(({id, organization_name:organization, contact_email:email, created_at:createdAt, status}) => ({id, organization, email, createdAt, status})) }; if (sql.includes('FROM licenses l')) return {results: db().licenses.map(row => ({id:row.id, organizationId:row.organization_id, organization:row.organization_name, expiresAt:row.expires_at, seatLimit:row.max_devices, active:row.active, createdAt:row.created_at, activatedDevices:db().devices.filter(device=>device.license_id===row.id).length}))}; if (sql.includes('FROM license_devices WHERE license_id = ? ORDER')) return {results:db().devices.filter(row=>row.license_id===this.values[0]).map(({device_id:deviceId,activated_at:activatedAt})=>({deviceId,activatedAt}))}; return { results: [] }; },
      async run() {
        const v = this.values;
        if (sql.includes('INSERT INTO license_requests')) { db().requests.push({id:v[0], organization_name:v[1], contact_email:v[2], created_at:v[3], status:v[4]}); return { meta:{changes:1} }; }
        if (sql.includes('INSERT INTO licenses')) {
          if (v[7] && !db().requests.some(row => row.id === v[7] && row.status === 'pending')) return {meta:{changes:0}};
          db().licenses.push({id:v[0], code_hash:v[1], organization_id:v[2], organization_name:v[3], expires_at:v[4], max_devices:v[5], active:1, created_at:v[6]}); return {meta:{changes:1}};
        }
        if (sql.includes('INSERT INTO license_devices')) {
          const [licenseId, deviceId, activatedAt, countLicenseId, maxDevices, existingLicenseId, existingDeviceId] = v;
          if (!db().devices.some(row => row.license_id === existingLicenseId && row.device_id === existingDeviceId) && db().devices.filter(row => row.license_id === countLicenseId).length < maxDevices) db().devices.push({license_id:licenseId, device_id:deviceId, activated_at:activatedAt});
          return {meta:{changes:1}};
        }
        if (sql.includes('UPDATE license_requests')) { const row = db().requests.find(item => item.id === v[2] && item.status === v[3]); if (row) { row.status=v[0]; row.issued_license_id=v[1]; } return {meta:{changes:row?1:0}}; }
        if (sql.includes('UPDATE licenses SET active')) { const row=db().licenses.find(item=>item.id===v[1]); if(row)row.active=v[0]; return {meta:{changes:row?1:0}}; }
        if (sql.includes('DELETE FROM license_devices WHERE license_id = ? AND device_id = ?')) { const index=db().devices.findIndex(row=>row.license_id===v[0]&&row.device_id===v[1]); if(index>=0)db().devices.splice(index,1); return {meta:{changes:index>=0?1:0}}; }
        if (sql.includes('DELETE FROM license_requests')) { const index=db().requests.findIndex(row=>row.id===v[0]); if(index>=0)db().requests.splice(index,1); return {meta:{changes:index>=0?1:0}}; }
        return {meta:{changes:0}};
      }
    };
  }
  async batch(statements) { const snapshots = { licenses:[...this.licenses], requests:this.requests.map(item=>({...item})) }; const results=[]; for(const statement of statements){ const result=await statement.run(); results.push(result); } if(results[0]?.meta?.changes!==1){this.licenses=snapshots.licenses;this.requests=snapshots.requests;} return results; }
}
const env = () => ({ LICENSE_DB: new MockD1(), LICENSE_SIGNING_PRIVATE_KEY: privatePem, LICENSE_ADMIN_TOKEN: adminToken });
const jsonRequest = (url, body, headers = {}) => new Request(url, { method:'POST', headers:{'content-type':'application/json', ...headers}, body:JSON.stringify(body) });

test('admin issuance, signed activation, device binding and seat limit work end to end', async () => {
  const ctx = env();
  const issued = await issueHandler.onRequestPost({ request:jsonRequest('https://lymora.in/api/license/admin/issue', {organizationName:'Example Org', maxDevices:1, expiresAt:null},{authorization:`Bearer ${adminToken}`}), env:ctx });
  assert.equal(issued.status, 200);
  const {code, licenseId} = await issued.json();
  assert.match(code, /^LYM-[A-F0-9]{32}$/);
  const deviceId = 'b5c6a1fc-7da8-4b65-bb43-ae5d88fc99ef';
  const activate = () => activation.onRequestPost({request:jsonRequest('https://lymora.in/api/license/activate',{code,deviceId}),env:ctx});
  const first = await activate(); assert.equal(first.status,200);
  const token = (await first.json()).license;
  const [payload, signature] = token.split('.');
  assert.equal(verify(null, Buffer.from(payload,'base64url'), publicKey, Buffer.from(signature,'base64url')),true);
  const claims=JSON.parse(Buffer.from(payload,'base64url').toString());
  assert.deepEqual(claims,{version:1,product:'lymora-lan',licenseId,organizationId:ctx.LICENSE_DB.licenses[0].organization_id,organizationName:'Example Org',deviceId,issuedAt:claims.issuedAt,expiresAt:null});
  assert.equal((await activate()).status,200,'same device can safely reactivate without another seat');
  const other = await activation.onRequestPost({request:jsonRequest('https://lymora.in/api/license/activate',{code,deviceId:'e0f21db7-ffdd-4416-b536-ae3aa7901715'}),env:ctx});
  assert.equal(other.status,409,'seat exhaustion is rejected');
  assert(!ctx.LICENSE_DB.licenses[0].code_hash.includes(code),'raw code is not stored');
});

test('admin CLI refuses to send its bearer secret over HTTP', () => {
  const cli=path.resolve('scripts/license-admin.mjs');
  const result=spawnSync(process.execPath,[cli,'licenses'],{encoding:'utf8',env:{...process.env,LYMORA_LICENSE_ADMIN_URL:'http://example.test/api/license/admin',LYMORA_LICENSE_ADMIN_TOKEN:adminToken}});
  assert.equal(result.status,1);
  assert.match(result.stderr,/requires an HTTPS endpoint/);
});
test('every administrator operation rejects requests without the admin bearer token', async () => {
  const ctx=env(), request=new Request('https://lymora.in/api/license/admin/requests'), body=jsonRequest('https://lymora.in/api/license/admin/issue',{organizationName:'Test',maxDevices:1,expiresAt:null});
  assert.equal((await requestsHandler.onRequestGet({request,env:ctx})).status,401);
  assert.equal((await issueHandler.onRequestPost({request:body,env:ctx})).status,401);
  assert.equal((await licensesHandler.onRequestGet({request,env:ctx})).status,401);
  assert.equal((await licensesHandler.onRequestPatch({request:jsonRequest('https://lymora.in/api/license/admin/licenses',{licenseId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',active:false}),env:ctx})).status,401);
  assert.equal((await devicesHandler.onRequestGet({request:new Request('https://lymora.in/api/license/admin/devices?licenseId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),env:ctx})).status,401);
  assert.equal((await devicesHandler.onRequestDelete({request:new Request('https://lymora.in/api/license/admin/devices?licenseId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa&deviceId=b5c6a1fc-7da8-4b65-bb43-ae5d88fc99ef',{method:'DELETE'}),env:ctx})).status,401);
});
test('expired organization activation codes are rejected without creating a seat', async () => {
  const ctx=env(), code='LYM-11111111111111111111111111111111';
  ctx.LICENSE_DB.licenses.push({id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',code_hash:await (await import('../functions/_shared/license.mjs')).sha256(code),organization_id:'org_expired',organization_name:'Expired Org',expires_at:Date.now()-1,max_devices:3,active:1,created_at:Date.now()-86400000});
  const result=await activation.onRequestPost({request:jsonRequest('https://lymora.in/api/license/activate',{code,deviceId:'b5c6a1fc-7da8-4b65-bb43-ae5d88fc99ef'}),env:ctx});
  assert.equal(result.status,410);
  assert.equal(ctx.LICENSE_DB.devices.length,0);
});
test('admin license controls are authenticated, expose only safe metadata, and manage seat records', async () => {
  const ctx=env(), headers={authorization:`Bearer ${adminToken}`};
  const issued=await issueHandler.onRequestPost({request:jsonRequest('https://lymora.in/api/license/admin/issue',{organizationName:'Managed Org',maxDevices:2,expiresAt:null},headers),env:ctx});
  const {licenseId,code}=await issued.json();
  const deviceId='b5c6a1fc-7da8-4b65-bb43-ae5d88fc99ef';
  const activated=await activation.onRequestPost({request:jsonRequest('https://lymora.in/api/license/activate',{code,deviceId}),env:ctx});
  assert.equal(activated.status,200);
  const signedToken=(await activated.json()).license;
  const unauth=await licensesHandler.onRequestGet({request:new Request('https://lymora.in/api/license/admin/licenses'),env:ctx});
  assert.equal(unauth.status,401);
  const listed=await licensesHandler.onRequestGet({request:new Request('https://lymora.in/api/license/admin/licenses',{headers}),env:ctx});
  const listBody=await listed.json();
  assert.equal(listBody.licenses[0].activatedDevices,1);
  assert.equal(JSON.stringify(listBody).includes(code),false);
  assert.equal(JSON.stringify(listBody).includes('code_hash'),false);
  const disabled=await licensesHandler.onRequestPatch({request:jsonRequest('https://lymora.in/api/license/admin/licenses',{licenseId,active:false},headers),env:ctx});
  assert.equal(disabled.status,200);
  const rejected=await activation.onRequestPost({request:jsonRequest('https://lymora.in/api/license/activate',{code,deviceId:'e0f21db7-ffdd-4416-b536-ae3aa7901715'}),env:ctx});
  assert.equal(rejected.status,409,'disabled license blocks new activation');
  const [signedPayload,signedSignature]=signedToken.split('.');
  assert.equal(verify(null,Buffer.from(signedPayload,'base64url'),publicKey,Buffer.from(signedSignature,'base64url')),true,'disabling server state does not revoke the previously issued offline signature');
  const deviceList=await devicesHandler.onRequestGet({request:new Request(`https://lymora.in/api/license/admin/devices?licenseId=${licenseId}`,{headers}),env:ctx});
  assert.equal((await deviceList.json()).devices.length,1);
  const release=await devicesHandler.onRequestDelete({request:new Request(`https://lymora.in/api/license/admin/devices?licenseId=${licenseId}&deviceId=${deviceId}`,{method:'DELETE',headers}),env:ctx});
  assert.equal((await release.json()).released,true);
  assert.equal(ctx.LICENSE_DB.devices.length,0);
  await licensesHandler.onRequestPatch({request:jsonRequest('https://lymora.in/api/license/admin/licenses',{licenseId,active:true},headers),env:ctx});
  const replacementId='f3c3512d-e1dd-42b4-8847-81f98afc041a';
  assert.equal((await activation.onRequestPost({request:jsonRequest('https://lymora.in/api/license/activate',{code,deviceId:replacementId}),env:ctx})).status,200,'released seat can be used by a replacement installation while license is active');
  assert.equal(ctx.LICENSE_DB.devices.length,1);
  assert.equal(ctx.LICENSE_DB.devices[0].device_id,replacementId);
});
test('public license request promises manual review and does not imply an automated email or account', async () => {
  const page = await fs.readFile(path.resolve('src/app/license/page.tsx'), 'utf8');
  const form = await fs.readFile(path.resolve('src/components/site/LicenseRequestForm.tsx'), 'utf8');
  assert.match(page, /reviews each request manually/);
  assert.match(page, /does not create an account/);
  assert.match(form, /review it manually/);
  assert.match(form, /If approved/);
});
test('organization requests require consent and are visible only through admin auth', async () => {
  const ctx=env();
  const body={organization:'Example Org',email:'it@example.org',consent:true};
  const created=await requestHandler.onRequestPost({request:jsonRequest('https://lymora.in/api/license/request',body),env:ctx});
  assert.equal(created.status,201);
  const list=await requestsHandler.onRequestGet({request:new Request('https://lymora.in/api/license/admin/requests'),env:ctx});
  assert.equal(list.status,401);
  const authRequest=new Request('https://lymora.in/api/license/admin/requests',{headers:{authorization:`Bearer ${adminToken}`} });
  assert.equal((await requestsHandler.onRequestGet({request:authRequest,env:ctx})).status,200);
  assert.equal((await requestHandler.onRequestPost({request:jsonRequest('https://lymora.in/api/license/request',{...body,consent:false}),env:ctx})).status,400);
});

test('admin issues a request only once and can delete request contact data', async () => {
  const ctx=env(), headers={authorization:`Bearer ${adminToken}`};
  const created=await requestHandler.onRequestPost({request:jsonRequest('https://lymora.in/api/license/request',{organization:'Example Org',email:'it@example.org',consent:true}),env:ctx});
  const {requestId}=await created.json();
  const issue=()=>issueHandler.onRequestPost({request:jsonRequest('https://lymora.in/api/license/admin/issue',{organizationName:'Example Org',maxDevices:5,expiresAt:Date.now()+86400000,requestId},headers),env:ctx});
  assert.equal((await issue()).status,200);
  assert.equal((await issue()).status,409,'replayed admin request cannot issue a duplicate code');
  const remove=await requestsHandler.onRequestDelete({request:new Request(`https://lymora.in/api/license/admin/requests?id=${requestId}`,{method:'DELETE',headers}),env:ctx});
  assert.deepEqual(await remove.json(),{deleted:true});
  assert.equal(ctx.LICENSE_DB.requests.length,0);
});

test('failed activation rejects invalid identities and a foreign origin', async () => {
  const ctx=env();
  const origin=await activation.onRequestPost({request:jsonRequest('https://lymora.in/api/license/activate',{code:'LYM-00000000000000000000000000000000',deviceId:'invalid'},{origin:'https://attacker.example'}),env:ctx});
  assert.equal(origin.status,403);
  const invalid=await activation.onRequestPost({request:jsonRequest('https://lymora.in/api/license/activate',{code:'nope',deviceId:'invalid'}),env:ctx});
  assert.equal(invalid.status,400);
});

test('license request rate limit stops repeated submissions', async () => {
  const ctx=env(); let last;
  for(let i=0;i<5;i++) last=await requestHandler.onRequestPost({request:jsonRequest('https://lymora.in/api/license/request',{organization:'Example Org',email:`user${i}@example.org`,consent:true},{'cf-connecting-ip':'192.0.2.10'}),env:ctx});
  assert.equal(last.status,429);
});

await fs.rm(tempRoot, {recursive:true,force:true});
