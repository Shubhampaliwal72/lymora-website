/** Race/timer checks use a deterministic clock; no browser/network or real wait. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const source=await fs.readFile('src/lib/navigation-feedback.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const api=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const saved={setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout,window:globalThis.window,location:globalThis.location};
let now=0,sequence=0;const timers=new Map();
const advance=ms=>{const end=now+ms;for(;;){const entry=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!entry)break;timers.delete(entry[0]);now=entry[1].at;entry[1].fn();}now=end;};
try {
 globalThis.window={location:new URL('https://lymora.test/about/')};globalThis.location=window.location;
 globalThis.setTimeout=(fn,ms)=>{const id=++sequence;timers.set(id,{fn,at:now+ms});return id;};
 globalThis.clearTimeout=id=>timers.delete(id);
 const state=()=>api.navigationSnapshot();
 api.beginNavigation('https://elsewhere.test/');assert.equal(state().phase,'idle');
 api.beginNavigation('/about/#details');assert.equal(state().phase,'idle','Same-page hash is skipped');
 api.beginNavigation('/about');assert.equal(state().phase,'idle','Canonical same route is skipped');
 let finish=api.beginNavigation('/privacy/');advance(99);assert.equal(state().visible,false);finish();advance(500);assert.equal(state().phase,'idle','Fast navigation never flashes');
 finish=api.beginNavigation('/privacy/');advance(100);assert.equal(state().visible,true);assert.equal(state().phase,'pending');
 const newer=api.beginNavigation('/downloads/');finish();assert.equal(state().phase,'pending','Stale cleanup cannot finish a newer click');
 api.completeNavigation('https://lymora.test/privacy/');assert.equal(state().phase,'pending','An older commit cannot finish the latest route');
 api.completeNavigation('https://lymora.test/downloads/');assert.equal(state().phase,'complete');advance(180);assert.equal(state().phase,'idle');newer();
 finish=api.beginNavigation('/privacy/');finish();advance(101);assert.equal(state().visible,false,'Cancellation clears the reveal timer');
 api.beginNavigation('/privacy/');advance(15000);assert.equal(state().phase,'idle','Stalled/failed transition cannot leave a stuck bar');
 finish=api.beginNavigation('/about/?view=files');advance(100);assert.equal(state().visible,true,'Query change is a genuine navigation');finish();advance(180);
 finish=api.beginNavigation(location.href,true);advance(100);assert.equal(state().visible,true,'Delayed history navigation can show feedback');finish();advance(180);
 api.resetNavigation();assert.equal(timers.size,0,'No pending timers after reset');
 console.log('Passed: fast/cancelled/same/hash/external/query/history navigation, latest-click races, matching completion and stalled recovery.');
} finally {Object.assign(globalThis,saved);}
