/** Verify centralized download navigation and actual public release links. */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const manifest=JSON.parse(await readFile(new URL('../src/lib/releases/windows.json',import.meta.url),'utf8'));
const release=manifest.available===false?null:manifest;
export async function verifyWindowsDownload(evaluate, selector='') {
  if(release){assert.equal(await evaluate('document.querySelector('+JSON.stringify(selector+' .download-windows')+').href'),release.downloadUrl,'Windows points to the owner-approved installer');return;}
  assert.equal(await evaluate('document.querySelector('+JSON.stringify(selector+' .download-windows')+')'),null,'Unavailable release has no installer link');
  assert.equal(await evaluate('document.querySelector('+JSON.stringify(selector+' .download-coming-soon')+')?.disabled'),true,'Windows download is disabled while unavailable');
}
export async function verifyDownloadNavigation(evaluate, selector='') {
  assert.equal(await evaluate('document.querySelector('+JSON.stringify(selector+' .download-page-link')+').getAttribute("href")'),'/downloads/','Marketing CTA navigates to Downloads');
}
export async function verifyDownloadUi({cdp,evaluate,viewport,media,waitFor,pause,url,checks,output}) {
  const open=async route=>{
    await evaluate('document.documentElement.dataset.qaDeparting="true"');
    await cdp('Page.navigate',{url:url+route});
    await waitFor('document.readyState==="complete"&&!document.documentElement.dataset.qaDeparting&&location.pathname==='+JSON.stringify(route),'Open '+route);
    await evaluate('document.fonts.ready');await pause(350);
  };
  for(const [width,theme] of [[1440,'dark'],[1440,'light'],[375,'dark'],[320,'light']]) {
    await viewport(width,1000);await media(theme);await open('/downloads/');
    await verifyWindowsDownload(evaluate);
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Download layout fits '+width);
    assert.equal(await evaluate('document.querySelectorAll("[data-platform]").length'),1,'Only the supported Windows platform is presented');
    assert.equal(await evaluate('document.querySelector("[data-platform]").dataset.platform'),'windows','Windows support is explicit');
    assert.deepEqual(await evaluate('[...document.querySelectorAll("[data-upcoming-platform]")].map(e=>e.dataset.upcomingPlatform)'),['macos','linux'],'Both approved upcoming platforms are informational');
    assert.equal(await evaluate('document.querySelectorAll(".upcoming-platforms a,.upcoming-platforms button").length'),0,'No unavailable platform controls or placeholder URLs');
    assert.equal(await evaluate('[...document.querySelectorAll(".upcoming-platform-status")].every(e=>e.textContent.includes("Coming soon"))'),true,'Upcoming platforms have clear availability');
    if(release){
      assert.equal(await evaluate('document.querySelector(".download-integrity code").textContent'),release.sha256,'Exact public SHA-256');
      assert.equal(await evaluate('document.querySelector(".download-integrity a").href'),release.checksumUrl,'Exact public checksum URL');
      assert((await evaluate('document.querySelector(".windows-release-facts").textContent')).includes('build '+release.build),'Build identity visible');
      assert((await evaluate('document.querySelector(".download-publisher-note").textContent')).includes('unsigned'),'Unsigned installer is disclosed');
    }else{
      assert((await evaluate('document.querySelector(".platform-download-heading").textContent')).includes('Coming soon'),'Windows availability is clear');
      assert((await evaluate('document.querySelector(".download-details").textContent')).includes('next Windows release'),'Windows release status is explained');
    }
    assert.equal(await evaluate('[...document.querySelectorAll("a")].filter(a=>a.protocol==="mailto:"||(a.hostname==="github.com"&&a.pathname.includes("/issues"))).length'),0,'No invented support channels');
    await evaluate('document.querySelector(".platform-downloads").scrollIntoView({block:"start",behavior:"instant"})');await waitFor('[...document.querySelectorAll("#windows-download-title .reveal-word")].every(e=>Number(getComputedStyle(e).opacity)===1)','Download heading reveal completes');await pause(200);
    const image=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(path.join(output,'downloads-'+width+'-'+theme+'.png'),Buffer.from(image.data,'base64'));
    await evaluate('document.querySelector(".upcoming-platforms").scrollIntoView({block:"center",behavior:"instant"})');await pause(500);
    const upcoming=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(path.join(output,'upcoming-platforms-'+width+'-'+theme+'.png'),Buffer.from(upcoming.data,'base64'));
  }
  await viewport(1440,1000);await media('dark');
  for(const route of ['/','/products/lan-messenger/']) {
    await open(route);await verifyDownloadNavigation(evaluate, route==='/'?'#download':'main');
  }
  await open('/downloads/');
  if(release){
    assert.equal(await evaluate('document.querySelector(".download-release-notes a[href*=github]").href'),release.notesUrl,'Release notes point to the published build');
    assert((await evaluate('document.querySelector(".download-release-notes").textContent')).includes(release.channel+' channel'),'Original build channel disclosed');
    for(const issue of release.knownIssues) assert((await evaluate('document.querySelector(".download-release-notes").textContent')).includes(issue),'Current release limitation disclosed');
  }else assert((await evaluate('document.querySelector(".download-release-notes").textContent')).includes('after an installer is approved'),'Unavailable release notes do not advertise stale release details');
  await open('/products/lan-messenger/docs/');
  assert(!(await evaluate('document.querySelector("main").textContent')).includes('build 013'),'Build-specific facts are centralized');
  const routes=['/','/products/','/products/lan-messenger/','/products/lan-messenger/docs/','/products/lan-messenger/releases/','/downloads/','/about/','/privacy/'];
  for(const route of routes) {
    await open(route);
    const facts=await evaluate("({external:[...document.querySelectorAll('a')].filter(a=>a.href.includes('/releases/download/')||a.href.includes('/releases/tag/')).map(a=>a.href),future:/macOS|Linux/.test(document.body.innerText),oldLabels:/Made for Windows PCs|Windows downloads/.test(document.body.innerText),footer:document.querySelector('.footer-directory a[href=\"/downloads/\"]')?.textContent,nav:document.querySelector('.desktop-nav>a[href=\"/downloads/\"]')?.getAttribute('aria-current')})");
    assert.equal(facts.future,route==='/downloads/','Approved upcoming platforms appear only on Downloads: '+route);
    assert.equal(facts.oldLabels,false,'Old footer labels remain removed: '+route);
    assert.equal(facts.footer,'Downloads','Footer uses the generic Downloads label');
    if(route==='/downloads/') {
      assert.deepEqual(facts.external.sort(),release?[release.downloadUrl,release.checksumUrl,release.notesUrl].sort():[],'Only verified release destinations are linked');
      assert.equal(facts.nav,'page','Downloads menu item is active');
    } else assert.deepEqual(facts.external,[],'No direct installer/checksum/release links outside Downloads: '+route);
  }
  await open('/products/lan-messenger/releases/');
  await evaluate("[...document.querySelectorAll(\"main a\")].find(a=>a.getAttribute(\"href\")===\"/downloads/#release-notes\").click()");
  await waitFor('location.pathname==="/downloads/"&&location.hash==="#release-notes"','Legacy release bookmark reaches centralized notes');
  for(const [route,selector] of [['/','#download .download-page-link'],['/products/lan-messenger/','main .download-page-link'],['/about/','.desktop-nav>a[href=\"/downloads/\"]']]) {
    await open(route);await evaluate('document.querySelector('+JSON.stringify(selector)+').click()');
    await waitFor('location.pathname==="/downloads/"&&!!document.querySelector(".download-windows,.download-coming-soon")','CTA reaches Downloads and shows its availability state');
  }
  await viewport(375,1000);await open('/about/');
  await evaluate('document.querySelector(".mobile-menu summary").click()');
  assert.equal(await evaluate('document.querySelector(".mobile-download .menu-title").textContent'),'Downloads','Mobile menu uses Downloads');
  await evaluate('document.querySelector(".mobile-download").click()');
  await waitFor('location.pathname==="/downloads/"&&!document.querySelector(".mobile-menu").open','Mobile navigation opens Downloads and closes menu');
  checks.push(release?'Centralized verified installer/checksum/release details; informational macOS/Linux plans; generic Downloads navigation and route audit':'Windows Coming soon state with no stale installer links; informational macOS/Linux plans; generic Downloads navigation and route audit');
}
