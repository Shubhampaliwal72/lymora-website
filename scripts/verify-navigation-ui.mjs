/** Production static-export navigation checks. Faults exist only in the loopback server. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function verifyNavigationUi({cdp,evaluate,viewport,media,waitFor,pause,url,checks,requests,errors,faults,output}) {
 const direct=async route=>{
  await cdp('Page.navigate',{url:url+route});
  await waitFor('document.readyState==="complete"&&!!document.querySelector(".navigation-progress")&&!!document.querySelector("main h1")','Hydrated direct route '+route,250);
  await pause(250);
 };
 const click=route=>evaluate('[...document.querySelectorAll("a")].find(a=>a.getAttribute("href")==='+JSON.stringify(route)+').click()');
 const settled=route=>waitFor('location.pathname==='+JSON.stringify(route)+'&&document.querySelector(".navigation-progress")?.dataset.state==="idle"','Settled route '+route,250);
 const probe=()=>evaluate('(()=>{window.__navEvents=[];window.__navObserver?.disconnect();window.__navObserver=new MutationObserver(()=>{const e=document.querySelector(".navigation-progress");window.__navEvents.push({visible:e.dataset.visible,state:e.dataset.state,at:performance.now()})});window.__navObserver.observe(document.querySelector(".navigation-progress"),{attributes:true})})()');
 const liveBackground=async()=>{
  assert.equal(await evaluate('document.documentElement.dataset.motion'),'full','Route changes preserve brand motion');
  const frame=await evaluate('JSON.stringify([...document.querySelectorAll(".ambient-streaks path")].map(p=>p.getAttribute("stroke-dashoffset")))');
  await waitFor('JSON.stringify([...document.querySelectorAll(".ambient-streaks path")].map(p=>p.getAttribute("stroke-dashoffset")))!=='+JSON.stringify(frame),'Background clock keeps running across navigation');
 };
 const capture=async name=>{const png=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(output,'navigation-'+name+'.png'),Buffer.from(png.data,'base64'));};
 await viewport(375,900);await media('light');await direct('/about/');
 assert.equal(await evaluate('document.querySelector(".navigation-progress").dataset.visible'),'false','No initial-load route overlay');
 assert.equal(await evaluate('document.querySelectorAll("main h1 .reveal-word").length'),0,'Page title is immediately readable');
 assert.equal(await evaluate('getComputedStyle(document.querySelector(".route-arrival")).animationDuration'),'0.18s','Arrival stays within 150-250ms');
 await evaluate('document.documentElement.dataset.navigationDocument="preserved"');
 for(const route of ['/products/','/products/lan-messenger/','/products/lan-messenger/docs/','/downloads/','/privacy/','/about/','/']) {
  await click(route);await settled(route);
  assert.equal(await evaluate('document.documentElement.dataset.navigationDocument'),'preserved','Internal routes use client navigation: '+route);
  assert.equal(await evaluate('document.querySelectorAll("main h1").length'),1,'One readable title after '+route);
  await liveBackground();
 }
 checks.push('initial load; client navigation across all seven primary routes; readable titles; 180ms arrival');
 await probe();await click('/');await pause(250);
 await evaluate('document.querySelector(".chapter-navigation a").click()');await pause(350);
 assert.equal(await evaluate('window.__navEvents.some(e=>e.visible==="true")'),false,'Same-route and same-page hashes never flash progress');
 await direct('/about/');await click('/#experience');await settled('/');
 assert.equal(await evaluate('location.hash'),'#experience','Cross-page hash reaches the intended section');
 assert(await evaluate('scrollY>0'),'Cross-page hash restores its target scroll position');
 await direct('/about/');await click('/downloads/');await settled('/downloads/');
 await evaluate('history.back()');await settled('/about/');
 await evaluate('history.forward()');await settled('/downloads/');
 checks.push('same-route/hash exclusion; cross-page section links; cached browser back and forward; no stuck indicator');
 // Cold mobile menus avoid viewport prefetching of these routes before each direct load.
 await direct('/about/');await probe();faults.route='/privacy/';faults.delay=1000;
 await cdp('Network.emulateNetworkConditions',{offline:false,latency:350,downloadThroughput:65536,uploadThroughput:65536});
 const began=Date.now();await click('/privacy/');
 await waitFor('document.querySelector(".navigation-progress").dataset.visible==="true"','Pending feedback appears on delayed route');
 assert.equal(await evaluate('location.pathname'),'/about/','Feedback precedes the delayed route commit');
 assert(await evaluate('document.querySelector("[role=status]").textContent.includes("Loading page")'),'Pending state is announced');
 assert.equal(await evaluate('getComputedStyle(document.querySelector(".navigation-progress>span")).backgroundColor'),'rgb(194, 65, 12)','Requested scoped accent');
 await capture('pending-mobile');await settled('/privacy/');faults.delay=0;faults.route='';
 const slowElapsed=Date.now()-began;
 await cdp('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 assert(slowElapsed>=1000,'The test exercised a genuinely delayed static payload');
 await probe();await click('/about/');await settled('/about/');
 assert.equal(await evaluate('window.__navEvents.some(e=>e.visible==="true")'),false,'Cached return navigation skips visible progress');
 checks.push('delayed static payload shows feedback before commit; accessible status; requested accent; cached navigation avoids flashes ('+slowElapsed+'ms fault-injected route)');
 await direct('/about/');faults.route='/privacy/';faults.delay=1400;
 await click('/privacy/');await pause(40);await click('/downloads/');await settled('/downloads/');await pause(1500);
 assert.equal(await evaluate('location.pathname'),'/downloads/','Latest rapid click wins');
 assert.equal(await evaluate('document.querySelector(".navigation-progress").dataset.state'),'idle','Cancelled older route cannot leave feedback stuck');
 faults.route='';faults.delay=0;
 await direct('/about/');faults.route='/privacy/';faults.delay=650;
 await click('/privacy/');await click('/privacy/');await settled('/privacy/');faults.route='';faults.delay=0;
 checks.push('rapid different-link interruption and duplicate same-link clicks complete cleanly');
 await viewport(1440,1000);await media('dark',true);await direct('/');
 await liveBackground();
 assert.equal(await evaluate('getComputedStyle(document.documentElement).scrollBehavior'),'auto','Reduced-motion hash navigation does not smooth scroll');
 assert.equal(await evaluate('getComputedStyle(document.querySelector(".route-arrival")).animationName'),'none');
 faults.route='/privacy/';faults.delay=800;await click('/privacy/');
 await waitFor('document.querySelector(".navigation-progress").dataset.visible==="true"','Reduced-motion pending state is still communicated');
 assert.equal(await evaluate('getComputedStyle(document.querySelector(".navigation-progress>span")).animationName'),'none','Reduced-motion bar stays still');
 await capture('pending-desktop-reduced');await settled('/privacy/');faults.route='';faults.delay=0;
 await liveBackground();
 await evaluate('history.back()');await settled('/');await liveBackground();
 await evaluate('history.forward()');await settled('/privacy/');await liveBackground();
 checks.push('desktop/mobile feedback; reduced-motion static navigation bar/arrival; brand motion survives all routes and browser history');
 // Viewport prefetch remains enabled on real Next links.
 await media('dark');await direct('/about/');await pause(800);
 assert(requests.some(u=>u.includes('/downloads/')&&u.includes('_rsc=')),'Next route payload requests/prefetch remain active');
 const chunks=await fs.readdir(path.join(process.cwd(),'out/_next/static/chunks'));
 const sizes=await Promise.all(chunks.filter(n=>n.endsWith('.js')).map(async name=>({name,size:(await fs.stat(path.join(process.cwd(),'out/_next/static/chunks',name))).size})));
 const heavy=sizes.sort((a,b)=>b.size-a.size)[0].name;
 const before=requests.length;await direct('/#getting-started');await pause(700);
 assert.equal(requests.slice(before).some(u=>u.includes(heavy)),false,'Offscreen hero avoids the heavy scene chunk');
 faults.route='/_next/static/chunks/'+heavy;faults.delay=1200;
 await evaluate('window.scrollTo({top:0,behavior:"instant"})');
 await waitFor('document.querySelector(".living-network").dataset.mode==="illustrated"&&document.querySelector(".network-fallback").getBoundingClientRect().height>0','Useful SVG preview remains while 3D initializes');
 const height=await evaluate('document.querySelector(".network-world").getBoundingClientRect().height');
 await capture('scene-fallback');
 await waitFor('document.querySelector(".living-network").dataset.mode==="3d"','3D becomes ready without blocking page navigation',350);
 assert(Math.abs(await evaluate('document.querySelector(".network-world").getBoundingClientRect().height')-height)<.5,'Scene upgrade preserves layout dimensions');
 faults.route='';faults.delay=0;
 checks.push('prefetch retained; offscreen Three.js chunk deferred; useful SVG fallback during initialization; no scene layout shift');
 // Inject a single measurement failure in text animation setup, not in routing.
 const injection=await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'const originalBounds=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(...args){if(!window.__animationFailure&&this.matches?.("main h2")){window.__animationFailure=true;throw new Error("Intentional text animation initialization failure")}return originalBounds.call(this,...args)}'});
 await direct('/about/');await cdp('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier});
 assert(await evaluate('window.__animationFailure===true'),'Text animation failure was actually exercised');
 assert(await evaluate('!!document.querySelector("main h1")&&[...document.querySelectorAll("main h2")].every(e=>e.textContent.trim()&&getComputedStyle(e).opacity==="1")'),'Text remains readable when animation enhancement fails');
 assert.equal(await evaluate('document.querySelectorAll("main h2 .reveal-word").length'),0,'Failed text enhancement restores original headings');
 await click('/privacy/');await settled('/privacy/');
 checks.push('text-animation initialization failure restores readable static content and leaves navigation usable');
 // A failed RSC request should recover with Next native document navigation, not a permanent bar.
 await viewport(375,900);await direct('/about/');faults.route='/privacy/';faults.fail=true;
 const errorStart=errors.length;faults.hits=0;await click('/privacy/');await settled('/privacy/');faults.route='';faults.fail=false;
 assert(faults.hits>0,'Failed static payload was actually exercised');
 const expected=errors.splice(errorStart);
 assert(expected.every(e=>/Failed to fetch RSC payload.*privacy[\s\S]*Falling back to browser navigation/.test(e)),'Only the expected failed-RSC diagnostic is tolerated: '+expected.join(' | '));
 await click('/about/');await settled('/about/');
 checks.push('failed RSC fetch recovers through Next fallback and subsequent navigation works');
 await cdp('Emulation.setScriptExecutionDisabled',{value:true});await cdp('Page.navigate',{url:url+'/products/lan-messenger/docs/'});await pause(600);
 assert(await evaluate('!!document.querySelector("main h1")&&document.querySelector("main h1").getBoundingClientRect().height>0'),'Nested static content survives missing JavaScript');
 await cdp('Emulation.setScriptExecutionDisabled',{value:false});await direct('/products/lan-messenger/docs/');
 assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'Nested mobile route has no overflow');
 checks.push('direct nested route and JavaScript-disabled static content remain readable');
}
