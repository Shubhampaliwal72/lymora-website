import { generateKeyPairSync } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const secrets = path.resolve('functions/.secrets');
const privateFile = path.join(secrets, 'license-ed25519-private.pem');
fs.mkdirSync(secrets, { recursive: true });
if (!fs.existsSync(privateFile)) {
  const pair = generateKeyPairSync('ed25519');
  fs.writeFileSync(privateFile, pair.privateKey.export({ type: 'pkcs8', format: 'pem' }), { flag: 'wx', mode: 0o600 });
}
const privateKey = fs.readFileSync(privateFile, 'utf8');
const { createPrivateKey, createPublicKey } = await import('node:crypto');
const publicKey = createPublicKey(createPrivateKey(privateKey)).export({ type: 'spki', format: 'pem' }).toString();
console.log(publicKey);
console.error(`Private signing key saved locally at ${privateFile}. It is gitignored; store a protected backup and add this exact PEM as Cloudflare secret LICENSE_SIGNING_PRIVATE_KEY.`);