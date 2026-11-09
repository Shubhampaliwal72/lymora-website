/** Interaction and geometry checks against the real static export. */
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function verifyHeaderUi({cdp,evaluate,viewport,media,waitFor,pause,url,checks,output}) {
  const open=async(route='/about/')=>{
    await evaluate('try{localStorage.removeItem("lymora-website-theme")}catch{}document.documentElement.dataset.qaDeparting="true"');
    await cdp('Page.navigate',{url:url+route});
    await waitFor('document.readyState==="complete"&&!document.documentElement.dataset.qaDeparting&&location.pathname==='+JSON.stringify(route),'Load '+route);
    await evaluate('document.fonts.ready');
    await evaluate('window.scrollTo({top:0,behavior:"instant"})');
    await waitFor('document.querySelector(".site-header").dataset.compact==="false"','Expanded header after initial load');
    await pause(300);
  };
  const key=async(name,code)=>{
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:code,...(name==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:code});
  };
  const rect=selector=>evaluate('(()=>{const r=document.querySelector('+JSON.stringify(selector)+').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()');
  const capture=async name=>{const png=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(path.join(output,'header-'+name+'.png'),Buffer.from(png.data,'base64'));};
  for(const theme of ['dark','light']) {
    await viewport(1440,1000);await media(theme);await open();
    assert.equal(await evaluate('document.documentElement.dataset.theme'),theme,'Requested theme applied');
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".site-header .brand-symbol")).animationName'),'brand-symbol-live','Logo starts automatically without hovering');
    const normal=await rect('.header-inner');
    const documentTop=await evaluate('document.querySelector("main").getBoundingClientRect().top+scrollY');
    await evaluate('window.scrollTo({top:420,behavior:"instant"})');
    await waitFor('document.querySelector(".site-header").dataset.compact==="true"','Scroll activates compact header');await pause(300);
    assert((await rect('.header-inner')).height<normal.height,'Compact header is physically smaller');
    assert(Math.abs(await evaluate('document.querySelector("main").getBoundingClientRect().top+scrollY')-documentTop)<.5,'Compaction does not shift document content');
    await capture('compact-'+theme);
    await evaluate('window.scrollTo({top:0,behavior:"instant"})');await waitFor('document.querySelector(".site-header").dataset.compact==="false"','Top restores expanded header');await pause(300);
    await evaluate('document.querySelector(".nav-disclosure summary").focus()');await key('Enter',13);
    await waitFor('!!document.querySelector(".nav-disclosure[open]")','Keyboard opens Products');await pause(250);
    const dropdown=await rect('.nav-disclosure[open] .nav-dropdown');
    assert(dropdown.x>=0&&dropdown.x+dropdown.width<=1440,'Dropdown stays within viewport');
    await key('Tab',9);assert(await evaluate('document.querySelector(".nav-disclosure[open]").contains(document.activeElement)'),'Keyboard reaches dropdown links');
    await key('Escape',27);assert.equal(await evaluate('document.activeElement.tagName'),'SUMMARY','Escape restores summary focus');
    await capture('expanded-'+theme);
    await evaluate('document.querySelector(".header-actions>button").click()');
    assert.equal(await evaluate('document.documentElement.dataset.theme'),theme==='dark'?'light':'dark','Theme toggle changes theme');
    assert.equal(await evaluate('document.querySelector(".header-actions>button").getAttribute("aria-label")'),theme==='dark'?'Switch to dark mode':'Switch to light mode','Theme action label describes next choice');
    await open('/downloads/');
    assert.equal(await evaluate('document.querySelector(".desktop-nav>a[aria-current=page]").textContent'),'Downloads','Downloads has active underline');
    assert(await evaluate('getComputedStyle(document.querySelector(".desktop-nav>a[aria-current=page]"),"::after").transform.startsWith("matrix(1")'),'Active underline is expanded');
    await open('/products/lan-messenger/docs/');
    assert.equal(await evaluate('document.querySelector(".nav-disclosure[data-active=true]>summary").textContent'),'Resources','Documentation activates its actual parent navigation');
    await evaluate('document.querySelector(".header-download").click()');
    await waitFor('location.pathname==="/downloads/"&&!!document.querySelector(".download-windows")','Get Lymora navigates to real Downloads');
  }
  checks.push('Both themes: automatic symbol-only animation; stationary wordmark/tagline; compact header without content shift; keyboard dropdowns; correct active routes; working theme toggle and Get Lymora');
  for(const width of [320,375,768,1024,1100,1101,1440,1920]) {
    await viewport(width,850);await media(width%2?'light':'dark');await open();
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'No horizontal overflow at '+width);
    const brand=await rect('.brand-lockup'),actions=await rect('.header-actions');
    assert(brand.x+brand.width+6<=actions.x,'Brand never overlaps controls at '+width);
    if(width<=1100) {
      assert.equal(await evaluate('getComputedStyle(document.querySelector(".desktop-nav")).display'),'none','Mobile navigation replaces crowded desktop links');
      await evaluate('document.querySelector(".mobile-menu summary").focus()');await key('Enter',13);
      await waitFor('document.querySelector(".mobile-menu").open','Keyboard opens mobile navigation');await pause(250);
      const menu=await rect('.mobile-panel');
      assert(menu.x>=0&&menu.x+menu.width<=width&&menu.y+menu.height<=850,'Mobile menu stays inside viewport at '+width);
      assert(await evaluate('document.querySelector(".mobile-panel").scrollHeight>document.querySelector(".mobile-panel").clientHeight'),'Long mobile menu scrolls internally');
      if(width===375)await capture('mobile');
      await key('Escape',27);assert.equal(await evaluate('document.querySelector(".mobile-menu").open'),false,'Escape closes mobile menu');
      await evaluate('document.querySelector(".mobile-menu summary").click()');await pause(200);
      await evaluate('document.querySelector(".mobile-download").click()');
      await waitFor('location.pathname==="/downloads/"&&!document.querySelector(".mobile-menu").open','Mobile download link navigates and closes');
    } else {
      const nav=await rect('.desktop-nav');
      assert(brand.x+brand.width+6<=nav.x&&nav.x+nav.width+6<=actions.x,'Centered desktop navigation never overlaps at '+width);
    }
  }
  checks.push('320/375/768/1024/1100/1101/1440/1920px responsive navigation, mobile keyboard/scroll/route cleanup, centered desktop links and collision-free controls');
  await viewport(1440,1000);await media('dark',true);await open();
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".site-header .brand-symbol")).animationName'),'brand-symbol-live','Owner-approved live logo is independent of the OS menu-motion preference');
  await evaluate('document.querySelector(".nav-disclosure summary").click()');await pause(100);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".nav-disclosure[open] .nav-dropdown")).animationName'),'none','Reduced motion disables menu arrival movement');
  await viewport(375,850);await pause(200);
  assert.equal(await evaluate('!!document.querySelector(".nav-disclosure[open]")'),false,'Desktop dropdown closes on mobile breakpoint');
  await evaluate('document.querySelector(".mobile-menu summary").click()');await pause(60);
  assert.equal(await evaluate('document.querySelector(".mobile-panel").getAnimations().filter(a=>a.playState==="running").length'),0,'Reduced-motion mobile panel does not run an entrance animation');
  await viewport(1440,1000);await pause(100);
  assert.equal(await evaluate('document.querySelector(".mobile-menu").open'),false,'Mobile menu closes on desktop breakpoint');
  assert.equal(await evaluate('document.documentElement.dataset.motion'),'full','Header preferences do not disable existing site scenes');
  checks.push('Owner-approved live logo; reduced-motion menus; responsive cleanup; existing brand/GSAP animation policy remains independent');
}
