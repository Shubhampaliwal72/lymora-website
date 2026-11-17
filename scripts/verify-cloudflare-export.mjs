/** Verify the actual static artifact; no network, upload, DNS or deployment calls. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { isPublicBuild } from '../src/lib/indexing.mjs';
const root=path.resolve('out');
const origin='https://lymora.in';
const routes=['/','/products/','/products/lan-messenger/','/products/lan-messenger/docs/','/products/lan-messenger/releases/','/downloads/','/about/','/privacy/'];
const publicLaunch=isPublicBuild(process.env);
let assets=0,totalBytes=0,largest={path:'',bytes:0};
const htmlFiles=[];
async function walk(folder){for(const entry of await fs.readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())await walk(file);else{const stat=await fs.stat(file);assets++;totalBytes+=stat.size;assert(stat.size<=25*1024*1024,'Pages asset exceeds 25 MiB: '+path.relative(root,file));assert(!/\.(?:exe|msi|pem|key|env)$/i.test(file),'Installer or private configuration in export: '+file);assert(!entry.name.startsWith('.env'),'Environment file in export');if(file.endsWith('.html'))htmlFiles.push(file);if(stat.size>largest.bytes)largest={path:path.relative(root,file),bytes:stat.size};}}}
await walk(root);
assert(assets<=20000,'Pages free-plan file count');
const canonicalFor=route=>route==='/products/lan-messenger/releases/'?'/downloads/':route;
for(const route of routes){
  const html=await fs.readFile(path.join(root,route.slice(1),'index.html'),'utf8');
  assert(html.includes('rel="canonical" href="'+origin+canonicalFor(route)+'"'),'Correct canonical: '+route);
  const indexing=publicLaunch?(canonicalFor(route)===route?'index, follow':'noindex, follow'):'noindex, nofollow';
  assert(html.includes('name="robots" content="'+indexing+'"'),'Correct indexing policy: '+route);
  assert(html.includes('property="og:image"'),'Sharing image: '+route);
  assert(html.includes('name="twitter:card" content="summary_large_image"'),'Sharing card: '+route);
  assert(/<title>[^<]+<\/title>/.test(html),'Nonempty page title: '+route);
  assert(/<meta name="description" content="[^"]+"/.test(html),'Nonempty description: '+route);
}
const robots=await fs.readFile(path.join(root,'robots.txt'),'utf8'),sitemap=await fs.readFile(path.join(root,'sitemap.xml'),'utf8');
assert(robots.includes(publicLaunch?'Allow: /':'Disallow: /'),'Correct robots.txt');
if(publicLaunch)assert(!robots.includes('Disallow:'),'Public pages must not be blocked');
assert(robots.includes('Sitemap: '+origin+'/sitemap.xml'),'Canonical sitemap advertised');
assert(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'),'Standard sitemap namespace');
const locations=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
assert.equal(new Set(locations).size,locations.length,'No duplicate sitemap URLs');
const expected=publicLaunch?routes.filter(route=>canonicalFor(route)===route).map(route=>origin+route):[];
assert.deepEqual([...locations].sort(),expected.sort(),'Exact public route URLs in sitemap');
for(const location of locations){
  const url=new URL(location);
  assert.equal(url.origin,origin,'Canonical HTTPS sitemap origin');
  assert.equal(url.search+url.hash,'','No query strings or fragments in sitemap');
  await fs.access(path.join(root,url.pathname.slice(1),'index.html'));
}
// Check every exported HTML document, so newly added indexable pages cannot be silently omitted.
const indexableUrls=[],titles=new Set(),descriptions=new Set();
for(const file of htmlFiles){
  const html=await fs.readFile(file,'utf8');
  const directive=html.match(/<meta name="robots" content="([^"]+)"/);
  assert(directive,'Explicit robots metadata: '+path.relative(root,file));
  if(/\bnoindex\b/.test(directive[1]))continue;
  assert(publicLaunch,'Preview must not contain indexable HTML: '+file);
  const relative=path.relative(root,file).split(path.sep).join('/');
  assert(relative.endsWith('index.html'),'Only public page documents are indexable: '+relative);
  const route='/'+relative.slice(0,-'index.html'.length);
  const canonical=html.match(/<link rel="canonical" href="([^"]+)"/);
  assert.equal(canonical?.[1],origin+route,'Indexable pages must be self-canonical: '+route);
  indexableUrls.push(canonical[1]);
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert(title&&!titles.has(title),'Unique nonempty indexable title: '+route);
  assert(description&&!descriptions.has(description),'Unique nonempty indexable description: '+route);
  titles.add(title);descriptions.add(description);
}
assert.deepEqual(indexableUrls.sort(),[...locations].sort(),'Every indexable exported page appears in sitemap');
const png=await fs.readFile(path.join(root,'opengraph-image'));assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Sharing image is PNG');assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
assert.equal(await fs.readFile(path.join(root,'_headers'),'utf8'),await fs.readFile('public/_headers','utf8'),'Cloudflare headers copied unchanged');
assert(!(await fs.readdir(root)).includes('_redirects'),'Production redirects stay inactive until domain approval');
await fs.access(path.join(root,'404.html'));
console.log(JSON.stringify({passed:true,routes:routes.length,indexable:publicLaunch,sitemapUrls:locations,assets,totalBytes,largest,checks:['canonical URLs','titles and descriptions','sharing metadata and PNG','production and preview indexing policy','exact sitemap URLs match every indexable exported page','25 MiB asset and 20000 file limits','no installer or private config in export','headers copied','redirects inactive','404 present']},null,2));
