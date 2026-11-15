import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { verifyWindowsDownload } from './verify-download-ui.mjs';

/** Visible wayfinding behavior on real exported routes, including interruptions. */
export async function verifySectionMenus({cdp,evaluate,viewport,media,waitFor,pause,url,checks,output}) {
 const open=async route=>{await cdp('Page.navigate',{url:url+route});await waitFor('location.pathname==='+JSON.stringify(route)+'&&document.readyState==="complete"&&!!document.querySelector("main")','Open content route');await evaluate('document.fonts.ready');await pause(400);};
 const click=async hash=>evaluate('[...document.querySelectorAll(".section-navigation a")].find(e=>e.hash==='+JSON.stringify(hash)+').click()');
 const current=hash=>'document.querySelector(".section-navigation a[aria-current=location]")?.hash==='+JSON.stringify(hash);
 const aligned=async()=>{await waitFor('(()=>{const n=document.querySelector(".section-navigation"),a=n.querySelector("a[aria-current]"),i=n.querySelector(".section-nav-indicator").getBoundingClientRect(),r=a.getBoundingClientRect();return Math.abs(i.left-r.left)<1&&Math.abs(i.top-r.top)<1&&Math.abs(i.width-r.width)<1&&Math.abs(i.height-r.height)<1})()','Selection settles within one pixel of its link',30);return true;};
 const capture=async name=>{const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(output,'content-'+name+'.png'),Buffer.from(shot.data,'base64'));};
 await viewport(1440,1000);await media('dark');await open('/products/lan-messenger/docs/');
 await waitFor('!!document.querySelector(".docs-nav[data-nav-ready]")','Measured guide menu initializes');
 assert(await evaluate('(()=>{const n=document.querySelector(".docs-nav").getBoundingClientRect(),l=document.querySelector(".docs-sidebar-label").getBoundingClientRect();return n.top-l.bottom>=8&&n.top-l.bottom<=30})()'),'Guide panel stays close to its sidebar label');
 await click('#files');await pause(60);
 assert(await evaluate('document.querySelector(".section-nav-indicator").getAnimations().some(a=>a.playState==="running")'),'Selection visibly glides instead of snapping');
 await waitFor(current('#files'),'Files selected');await pause(1100);assert(await aligned(),'Guide highlight lands on its actual link');
 await click('#network');await click('#messaging');await click('#files');await pause(1200);
 assert(await evaluate(current('#files')),'Rapid clicks retain the latest section');assert(await aligned(),'Rapid highlight reversal settles accurately');
 await evaluate('history.back()');await waitFor('location.hash==="#messaging"','Back restores native anchor history');await pause(1200);
 assert(await evaluate(current('#messaging')),'Back synchronizes section selection');await capture('guide-selection-dark');
 await viewport(320,900);await pause(500);assert(await aligned(),'Highlight adapts to two-column mobile guide');
 await click('#network');await pause(1100);assert(await aligned(),'Mobile highlight matches its link');assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Guide fits 320px');
 await media('light',true);await pause(250);
 assert.equal(await evaluate('getComputedStyle(document.querySelector(".section-nav-indicator")).transitionDuration'),'0s','Reduced motion removes sliding selection');
 await click('#setup');await pause(350);assert(await aligned(),'Static selection remains accurate');await capture('guide-mobile-light');
 await viewport(1440,1000);await media('dark');await open('/downloads/');await waitFor('!!document.querySelector(".downloads-nav[data-nav-ready]")','Downloads wayfinding initializes');
 assert.equal(await evaluate('document.querySelectorAll(".downloads-nav a").length'),5,'Five real download sections');
 await click('#installation');await pause(1200);assert(await aligned(),'Downloads selection aligns');
 assert(await evaluate('(()=>{const s=document.querySelector("#installation h2").getBoundingClientRect(),n=document.querySelector(".downloads-nav").getBoundingClientRect();return s.top>=n.bottom&&s.top<innerHeight*.6})()'),'Installation heading clears both sticky menus');
 await capture('installation-dark');await verifyWindowsDownload(evaluate);
 await click('#windows');await pause(1200);await capture('downloads-dark');
 await viewport(375,900);await media('light');await open('/downloads/');await click('#installation');await pause(1100);
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Downloads menu and content fit mobile');assert(await aligned(),'Mobile Downloads highlight aligns');await capture('downloads-mobile-light');
 for(const route of ['/about/','/products/','/privacy/','/products/lan-messenger/','/products/lan-messenger/releases/']){
  await viewport(1440,1000);await media('dark');await open(route);
  assert.equal(await evaluate('document.querySelectorAll("main h1").length'),1,'One real title on '+route);
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Content fits '+route);
  await capture(route.split('/').filter(Boolean).join('-'));
 }
 checks.push('sliding guide selection; native hash and Back; rapid repeated clicks; 320px grid resize; reduced-motion static selection; five real Downloads anchors and sticky-menu clearance; unchanged verified installer; shared secondary-page captures');
}
