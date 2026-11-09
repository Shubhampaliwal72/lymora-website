/** Verify centralized download navigation and actual public release links. */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const release=JSON.parse(await readFile(new URL('../src/lib/releases/windows.json',import.meta.url),'utf8'));
export async function verifyWindowsDownload(evaluate, selector='') {
  assert.equal(await evaluate('document.querySelector('+JSON.stringify(selector+' .download-windows')+').href'),release.downloadUrl,'Windows points to the owner-approved installer');
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
    assert.equal(await evaluate('document.querySelector(".download-integrity code").textContent'),release.sha256,'Exact public SHA-256');
    assert.equal(await evaluate('document.querySelector(".download-integrity a").href'),release.checksumUrl,'Exact public checksum URL');
    assert((await evaluate('document.querySelector(".windows-release-facts").textContent')).includes('build '+release.build),'Build identity visible');
    assert((await evaluate('document.querySelector(".download-publisher-note").textContent')).includes('unsigned'),'Unsigned installer is disclosed');
    assert.equal(await evaluate('[...document.querySelectorAll("a")].filter(a=>a.protocol==="mailto:"||(a.hostname==="github.com"&&a.pathname.includes("/issues"))).length'),0,'No invented support channels');
    await evaluate('document.querySelector(".platform-downloads").scrollIntoView({block:"start",behavior:"instant"})');await waitFor('[...document.querySelectorAll("#windows-download-title .reveal-word")].every(e=>Number(getComputedStyle(e).opacity)===1)','Download heading reveal completes');await pause(200);
    const image=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(path.join(output,'downloads-'+width+'-'+theme+'.png'),Buffer.from(image.data,'base64'));
  }
  await viewport(1440,1000);await media('dark');
  for(const route of ['/','/products/lan-messenger/']) {
    await open(route);await verifyDownloadNavigation(evaluate, route==='/'?'#download':'main');
  }
  await open('/downloads/');
  assert.equal(await evaluate('document.querySelector(".download-release-notes a[href*=github]").href'),release.notesUrl,'Release notes point to the published build');
  assert((await evaluate('document.querySelector(".download-release-notes").textContent')).includes(release.channel+' channel'),'Original build channel disclosed');
  for(const issue of release.knownIssues) assert((await evaluate('document.querySelector(".download-release-notes").textContent')).includes(issue),'Current release limitation disclosed');
  await open('/products/lan-messenger/docs/');
  assert(!(await evaluate('document.querySelector("main").textContent')).includes('build 013'),'Build-specific facts are centralized');
  const routes=['/','/products/','/products/lan-messenger/','/products/lan-messenger/docs/','/products/lan-messenger/releases/','/downloads/','/about/','/privacy/'];
  for(const route of routes) {
    await open(route);
    const facts=await evaluate("({external:[...document.querySelectorAll('a')].filter(a=>a.href.includes('/releases/download/')||a.href.includes('/releases/tag/')).map(a=>a.href),future:/macOS|Linux|Made for Windows PCs|Windows downloads/.test(document.body.innerText),footer:document.querySelector('.footer-directory a[href=\"/downloads/\"]')?.textContent,nav:document.querySelector('.desktop-nav>a[href=\"/downloads/\"]')?.getAttribute('aria-current')})");
    assert.equal(facts.future,false,'No unconfirmed platform announcements or old footer labels: '+route);
    assert.equal(facts.footer,'Downloads','Footer uses the generic Downloads label');
    if(route==='/downloads/') {
      assert.deepEqual(facts.external.sort(),[release.downloadUrl,release.checksumUrl,release.notesUrl].sort(),'Only the three approved release destinations');
      assert.equal(facts.nav,'page','Downloads menu item is active');
    } else assert.deepEqual(facts.external,[],'No direct installer/checksum/release links outside Downloads: '+route);
  }
  await open('/products/lan-messenger/releases/');
  await evaluate("[...document.querySelectorAll(\"main a\")].find(a=>a.getAttribute(\"href\")===\"/downloads/#release-notes\").click()");
  await waitFor('location.pathname==="/downloads/"&&location.hash==="#release-notes"','Legacy release bookmark reaches centralized notes');
  for(const [route,selector] of [['/','#download .download-page-link'],['/products/lan-messenger/','main .download-page-link'],['/about/','.desktop-nav>a[href=\"/downloads/\"]']]) {
    await open(route);await evaluate('document.querySelector('+JSON.stringify(selector)+').click()');
    await waitFor('location.pathname==="/downloads/"&&!!document.querySelector(".download-windows")','CTA reaches working Downloads');
  }
  await viewport(375,1000);await open('/about/');
  await evaluate('document.querySelector(".mobile-menu summary").click()');
  assert.equal(await evaluate('document.querySelector(".mobile-download .menu-title").textContent'),'Downloads','Mobile menu uses Downloads');
  await evaluate('document.querySelector(".mobile-download").click()');
  await waitFor('location.pathname==="/downloads/"&&!document.querySelector(".mobile-menu").open','Mobile navigation opens Downloads and closes menu');
  checks.push('Centralized installer/checksum/release details; supported Windows only; generic desktop/mobile/footer Downloads navigation; working homepage/product CTAs and legacy release handoff; eight-route audit; 320/375/1440px in both themes; no invented support URLs');
}
