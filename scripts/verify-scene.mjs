import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const source=await fs.readFile('src/components/living-network/scene.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {storyAt,routes,fallbackRoutes,pointOnRoute}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
assert.equal(storyAt(-1).phase,0);assert.equal(storyAt(2).phase,4);
assert.equal(storyAt(.36).packet,true);assert.equal(storyAt(.75).packet,false);
assert.equal(storyAt(.8).returning,true);assert.equal(storyAt(.96).returning,false);
for(const paths of [routes,fallbackRoutes])for(const route of Object.values(paths)){assert.deepEqual(pointOnRoute(route,0),route[0]);assert.deepEqual(pointOnRoute(route,1),route[3]);for(let i=0;i<=100;i++)assert(pointOnRoute(route,i/100).every(Number.isFinite));}
assert.equal(storyAt(1).packet,false);assert.equal(storyAt(1).returning,false);
console.log('Passed: bounded phases, packet/receipt boundaries, both route endpoints, finite coordinates and settled final frame.');
