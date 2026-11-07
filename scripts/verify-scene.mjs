import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const source=await fs.readFile('src/components/living-network/scene.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {storyAt,connections,illustratedDevices,routeBetween,pointOnRoute,nextPair}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
assert.equal(storyAt(-1).phase,0);assert.equal(storyAt(2).phase,4);
assert.equal(storyAt(.36).packet,true);assert.equal(storyAt(.75).packet,false);
assert.equal(storyAt(.8).returning,true);assert.equal(storyAt(.96).returning,false);
assert.equal(connections.length,3);assert.equal(new Set(connections.flat()).size,3);
for(const [a,b] of connections)for(const fallback of [false,true]){
  const route=routeBetween(a,b,fallback),reverse=routeBetween(b,a,fallback);
  assert.deepEqual(route,[...reverse].reverse(),'Both directions use the same physical connection');
  assert.deepEqual(pointOnRoute(route,0),route[0]);assert.deepEqual(pointOnRoute(route,1),route[3]);
  for(let i=0;i<=100;i++)assert(pointOnRoute(route,i/100).every(Number.isFinite));
}
for(let i=0;i<illustratedDevices.length;i++){
  const a=illustratedDevices[i];assert(a.x-a.width/2>0&&a.x+a.width/2<1000&&a.y-a.height/2>0&&a.y+a.height/2<780,'Computers fit within scene');
  assert(a.label[0]>30&&a.label[0]<970&&a.label[1]>30&&a.label[1]<750,'Labels fit within scene');
  for(const b of illustratedDevices.slice(i+1))assert(Math.abs(a.x-b.x)>(a.width+b.width)/2||Math.abs(a.y-b.y)>(a.height+b.height)/2,'Screens never overlap');
}
let previous=['you','studio'];for(let i=0;i<100;i++){const pair=nextPair(previous);assert.notDeepEqual(pair,previous);assert.notEqual(pair[0],pair[1]);previous=pair;}
console.log('Passed: three-peer mesh, distinct screens, bounded labels, reversible paths, packet/receipt phases and nonrepeating directions.');
