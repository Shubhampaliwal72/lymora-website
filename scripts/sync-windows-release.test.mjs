import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { updateManifest } from './sync-windows-release.mjs';

function sha(file, algorithm = 'sha256', encoding = 'hex') { return crypto.createHash(algorithm).update(fs.readFileSync(file)).digest(encoding); }
function write(root, name, content) { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); return file; }
function fixture(t) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'lymora-site-release-')); t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const bundle=path.join(root,'assets'); fs.mkdirSync(bundle);
  const name='Lymora-LAN-Setup-1.0.2-build.015-x64.exe', exe=write(bundle,name,'verified fixture installer');
  write(bundle, name + '.blockmap', 'blockmap'); write(bundle, 'RELEASE_NOTES.md', '## Changes\n- Faster discovery.\n- Signed Windows installer.\n\n## Known issues\n- None\n');
  const notes=fs.readFileSync(path.join(bundle,'RELEASE_NOTES.md'),'utf8');
  const feed=`version: 1.0.2\nfiles:\n  - url: ${name}\n    sha512: ${sha(exe,'sha512','base64')}\n    size: ${fs.statSync(exe).size}\npath: ${name}\nsha512: ${sha(exe,'sha512','base64')}\n`;
  write(bundle,'latest.yml',feed);
  const files=[name,`${name}.blockmap`,'RELEASE_NOTES.md','latest.yml'];
  write(bundle,'SHA256SUMS.txt',files.map(f=>`${sha(path.join(bundle,f))}  ${f}`).join('\n')+'\n');
  write(bundle,'build-info.json',JSON.stringify({version:'1.0.2',buildLabel:'015',channel:'release',dirty:false,platform:'win',arch:'x64',target:'nsis',authenticodeSigned:true,windowsPublisher:'CN=Lymora',builtAt:'2026-11-24T00:00:00.000Z',artifacts:[{name,bytes:fs.statSync(exe).size,sha256:sha(exe)}]},null,2));
  const manifest=write(root,'windows.json',JSON.stringify({version:'1.0.1',build:'014',knownIssues:['old release issue']},null,2));
  return {root,bundle,manifest,name,notes};
}

test('only verified newer Windows release bytes update the central website manifest',t=>{
  const f=fixture(t); const result=updateManifest({manifestPath:f.manifest,bundlePath:f.bundle,tag:'v1.0.2',publishedAt:'2026-11-24T12:00:00Z'});
  const data=JSON.parse(fs.readFileSync(f.manifest,'utf8'));
  assert.equal(result.version,'1.0.2'); assert.equal(data.assetName,f.name); assert.equal(data.version,'1.0.2');
  assert.equal(data.available,true,'a verified release becomes visible on Downloads');
  assert.equal(data.bytes,fs.statSync(path.join(f.bundle,f.name)).size); assert.equal(data.sha256,sha(path.join(f.bundle,f.name)));
  assert.equal(data.signed,true); assert.equal(data.downloadUrl,`https://github.com/Shubhampaliwal72/lymora-website/releases/download/v1.0.2/${f.name}`);
  assert.deepEqual(data.changes,["Faster discovery.","Signed Windows installer."]); assert.deepEqual(data.knownIssues,[]); assert.equal(data.publishedAt,"2026-11-24");
});

test('same-version, dirty, unsigned, mismatched feed and corrupt checksums are rejected without edits',t=>{
  for (const mutate of [
    info=>{info.dirty=true}, info=>{info.authenticodeSigned=false},
    (info,bundle)=>fs.writeFileSync(path.join(bundle,'latest.yml'),'version: 9.9.9\n'),
    (info,bundle)=>fs.writeFileSync(path.join(bundle,'SHA256SUMS.txt'),'0'.repeat(64)+'  Lymora-LAN-Setup-1.0.2-build.015-x64.exe\\n'),
  ]) {
    const f=fixture(t); const before=fs.readFileSync(f.manifest,'utf8'); const infoPath=path.join(f.bundle,'build-info.json');
    const info=JSON.parse(fs.readFileSync(infoPath,'utf8')); mutate(info,f.bundle); if (mutate.length<2) fs.writeFileSync(infoPath,JSON.stringify(info));
    assert.throws(()=>updateManifest({manifestPath:f.manifest,bundlePath:f.bundle,tag:'v1.0.2',publishedAt:'2026-11-24T12:00:00Z'})); assert.equal(fs.readFileSync(f.manifest,'utf8'),before);
  }
  const f=fixture(t), before=fs.readFileSync(f.manifest,'utf8');
  assert.throws(()=>updateManifest({manifestPath:f.manifest,bundlePath:f.bundle,tag:'v1.0.1',publishedAt:'2026-11-24T12:00:00Z'}),/currently advertises/);
  assert.equal(fs.readFileSync(f.manifest,'utf8'),before);
});
