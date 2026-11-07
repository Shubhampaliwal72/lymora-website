/** Check generated internal links and their anchors; never contacts the network. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('out'), pages=[];
async function walk(folder){for(const entry of await fs.readdir(folder,{withFileTypes:true})){const name=path.join(folder,entry.name);if(entry.isDirectory())await walk(name);else if(name.endsWith('.html'))pages.push(name);}}
await walk(root);
const problems=[],cache=new Map();let checked=0;
for(const page of pages){const html=await fs.readFile(page,'utf8');const relative=path.relative(root,page).split(path.sep).join('/'),base='http://local/'+relative.replace(/index\.html$/,'');
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const value=match[1].replaceAll('&amp;','&');if(!value||/^(?:https?:|mailto:|tel:|data:|blob:)/.test(value))continue;
  const url=new URL(value,base);let destination=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(destination!==root&&!destination.startsWith(root+path.sep)){problems.push(relative+': path escapes export');continue;}
  try{const stat=await fs.stat(destination);if(stat.isDirectory())destination=path.join(destination,'index.html');await fs.access(destination);checked++;
   if(url.hash&&destination.endsWith('.html')){let target=cache.get(destination);if(!target){target=await fs.readFile(destination,'utf8');cache.set(destination,target);}const id=decodeURIComponent(url.hash.slice(1));if(!target.includes('id="'+id+'"'))problems.push(relative+': missing anchor '+value);}
  }catch{problems.push(relative+': missing '+value);}
 }
}
assert.deepEqual(problems,[],'Every local navigation and asset reference must resolve');
console.log(JSON.stringify({passed:true,htmlPages:pages.length,checkedLocalReferences:checked}));
