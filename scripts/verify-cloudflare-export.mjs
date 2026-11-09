/** Verify the actual static artifact; no network, upload, DNS or deployment calls. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('out');
const routes=['/','/products/','/products/lan-messenger/','/products/lan-messenger/docs/','/products/lan-messenger/releases/','/downloads/','/about/','/privacy/'];
const publicLaunch=process.env.LYMORA_PUBLIC_LAUNCH==='true'&&(!process.env.CF_PAGES_BRANCH||process.env.CF_PAGES_BRANCH==='main');
let assets=0,totalBytes=0,largest={path:'',bytes:0};
async function walk(folder){for(const entry of await fs.readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())await walk(file);else{const stat=await fs.stat(file);assets++;totalBytes+=stat.size;assert(stat.size<=25*1024*1024,'Pages asset exceeds 25 MiB: '+path.relative(root,file));assert(!/\.(?:exe|msi|pem|key|env)$/i.test(file),'Installer or private configuration in export: '+file);assert(!entry.name.startsWith('.env'),'Environment file in export');if(stat.size>largest.bytes)largest={path:path.relative(root,file),bytes:stat.size};}}}
await walk(root);
assert(assets<=20000,'Pages free-plan file count');
const canonicalFor=route=>route==='/products/lan-messenger/releases/'?'/downloads/':route;
for(const route of routes){const html=await fs.readFile(path.join(root,route.slice(1),'index.html'),'utf8');assert(html.includes('rel="canonical" href="https://lymora.in'+canonicalFor(route)+'"'),'Correct canonical: '+route);assert(html.includes('name="robots" content="'+(publicLaunch?'index, follow':'noindex, nofollow')+'"'),'Correct indexing gate: '+route);assert(html.includes('property="og:image"'),'Sharing image: '+route);assert(html.includes('name="twitter:card" content="summary_large_image"'),'Sharing card: '+route);}
const robots=await fs.readFile(path.join(root,'robots.txt'),'utf8'),sitemap=await fs.readFile(path.join(root,'sitemap.xml'),'utf8');
assert(robots.includes(publicLaunch?'Allow: /':'Disallow: /'),'Correct robots.txt');
assert.equal((sitemap.match(/<loc>/g)||[]).length,publicLaunch?routes.length-1:0,'Only approved production builds list sitemap URLs');
const png=await fs.readFile(path.join(root,'opengraph-image'));assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Sharing image is PNG');assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
assert.equal(await fs.readFile(path.join(root,'_headers'),'utf8'),await fs.readFile('public/_headers','utf8'),'Cloudflare headers copied unchanged');
assert(!(await fs.readdir(root)).includes('_redirects'),'Production redirects stay inactive until domain approval');
await fs.access(path.join(root,'404.html'));
console.log(JSON.stringify({passed:true,routes:routes.length,indexable:publicLaunch,assets,totalBytes,largest,checks:['canonical URLs','sharing metadata and PNG','launch indexing gate','25 MiB asset and 20000 file limits','no installer or private config in export','headers copied','redirects inactive','404 present']},null,2));
