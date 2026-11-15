/** Frosted overlay regression checks against the actual local static export. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function verifyGlassUi({cdp,evaluate,load,viewport,media,waitFor,pause,url,checks,output}) {
  const key=async(name,code)=>{await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:code,...(name==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:code});};
  const capture=async name=>{const png=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(output,'glass-'+name+'.png'),Buffer.from(png.data,'base64'));};
  const scrim=()=>evaluate('Number(getComputedStyle(document.querySelector(".site-header"),"::before").opacity)');
  const inside=selector=>evaluate('(()=>{const e=document.querySelector('+JSON.stringify(selector)+'),r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+.5&&r.top>=0&&r.bottom<=innerHeight+.5&&e.contains(document.elementFromPoint(r.left+r.width/2,r.top+32))})()');
  const firstLetter=selector=>evaluate('(()=>{const e=document.querySelector('+JSON.stringify(selector)+'),t=document.createElement("span");t.style.color="var(--accent)";document.body.append(t);const accent=getComputedStyle(t).color;t.remove();return {initial:getComputedStyle(e,"::first-letter").color,body:getComputedStyle(e).color,accent,text:e.textContent}})()');
  for(const theme of ['dark','light']) {
    await viewport(1440,1000);await media(theme);await load();await evaluate('window.scrollTo({top:0,behavior:"instant"})');
    assert.equal(await scrim(),0,'Closed navigation does not dim the page');
    for(const index of [0,1]) {
      await evaluate('document.querySelectorAll(".nav-disclosure summary")['+index+'].focus()');await key('Enter',13);
      await waitFor('document.querySelectorAll(".nav-disclosure[open]").length===1','Keyboard opens one disclosure');await pause(250);
      assert(await inside('.nav-disclosure[open] .nav-dropdown'),'Dropdown stays within viewport and above the hero');
      await waitFor('Number(getComputedStyle(document.querySelector(".site-header"),"::before").opacity)>.99','Background content is subdued while a menu is open');
      assert.equal(await evaluate('getComputedStyle(document.querySelector(".page-reveal-content")).filter'),'none','Foreground text is never blurred');
      const label=await firstLetter('.nav-disclosure[open] .menu-title');
      assert.equal(label.initial,label.accent,'Only the initial uses the theme accent');assert.notEqual(label.body,label.accent,'Remaining letters are readable neutral gray');
      assert(await evaluate('getComputedStyle(document.querySelector(".nav-disclosure[open] .nav-dropdown")).backdropFilter.includes("blur")'),'Menu has a frosted surface');
      await capture((index?'resources-':'products-')+theme);
      await key('Escape',27);await pause(220);
      assert.equal(await evaluate('document.querySelectorAll(".nav-disclosure[open]").length'),0,'Escape closes dropdown');
      assert.equal(await evaluate('document.activeElement.tagName'),'SUMMARY','Escape restores the trigger');
    }
    await evaluate('document.querySelector(".nav-disclosure summary").click()');await pause(100);
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:4,y:450,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:4,y:450,button:'left',clickCount:1});
    await waitFor('!document.querySelector(".nav-disclosure[open]")','Clicking outside closes the overlay');
    await evaluate('document.querySelector(".nav-disclosure summary").focus()');await key('Enter',13);await pause(80);await key('Tab',9);
    assert(await evaluate('document.querySelector(".nav-disclosure[open]")?.contains(document.activeElement)'),'Tab reaches dropdown links');
    await evaluate('document.querySelector(".header-download").focus()');
    assert.equal(await evaluate('!!document.querySelector(".nav-disclosure[open]")'),false,'Tabbing away closes the desktop disclosure');
    await evaluate('document.querySelector(".nav-disclosure summary").click()');await viewport(375,900);await pause(250);
    assert.equal(await evaluate('!!document.querySelector(".nav-disclosure[open]")'),false,'Desktop disclosure closes when switching to mobile');
  }
  checks.push('dark/light frosted desktop menus: accent initials, neutral labels, crisp foreground, dimmed background, stacking, keyboard/outside close and responsive cleanup');
  for(const width of [320,375,768,1024,1101]) {
    await viewport(width,800);await media(width===320?'dark':'light');await load();await evaluate('window.scrollTo({top:0,behavior:"instant"})');
    if(width<=1100) {
      await evaluate('document.querySelector(".mobile-menu summary").click()');await pause(250);
      assert(await inside('.mobile-panel'),'Mobile menu fits viewport at '+width);
      await waitFor('Number(getComputedStyle(document.querySelector(".site-header"),"::before").opacity)>.99','Mobile background is subdued');
      assert.equal(await evaluate('getComputedStyle(document.querySelector(".ambience-control")).visibility'),'hidden','Floating background control cannot cover mobile links');
      assert(await evaluate('(()=>{const p=document.querySelector(".mobile-panel"),r=p.getBoundingClientRect();return p.contains(document.elementFromPoint(r.left+44,r.bottom-24))})()'),'Bottom menu links remain above all page controls');
      assert(await evaluate('(()=>{const p=document.querySelector(".mobile-panel");return p.scrollHeight>p.clientHeight&&getComputedStyle(p).overflowY==="auto"})()'),'Long mobile menu remains scrollable');
      await capture('mobile-'+width);
      await key('Escape',27);await waitFor('Number(getComputedStyle(document.querySelector(".site-header"),"::before").opacity)===0','Backdrop clears after closing');
    } else {
      await evaluate('document.querySelectorAll(".nav-disclosure summary")[1].click()');await pause(250);
      assert(await inside('.nav-disclosure[open] .nav-dropdown'),'Resources menu fits compact desktop at 1101px');
      await key('Escape',27);
    }
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'No horizontal overflow at '+width);
  }
  checks.push('320/375/768/1024px touch menu viewport bounds and internal scroll; 1101px compact dropdown; clean backdrop removal');
  for(const [width,theme] of [[1440,'dark'],[375,'light']]) {
    await viewport(width,1000);await media(theme);await load();
    await evaluate('document.querySelector("#experience .screenshot-trigger").scrollIntoView({block:"center",behavior:"instant"})');await pause(600);
    await evaluate('document.querySelector("#experience .screenshot-trigger").click()');await pause(300);
    assert(await inside('dialog[open]'),'Native screenshot overlay remains in viewport and top layer');
    assert.equal(await evaluate('document.activeElement.getAttribute("aria-label")'),'Close screenshot','Initial focus stays on Close');
    assert.equal(await evaluate('document.body.style.overflow'),'hidden','Background scrolling stays locked');
    assert(await evaluate('getComputedStyle(document.querySelector("dialog[open]"),"::backdrop").backdropFilter.includes("blur")'),'Dialog backdrop diffuses the page');
    assert.equal(await evaluate('getComputedStyle(document.querySelector("dialog[open] .screenshot-pan")).backgroundColor'),await evaluate('getComputedStyle(document.body).backgroundColor'),'Screenshot rests on an opaque canvas');
    await capture('dialog-'+theme);
    await key('Escape',27);await waitFor('!document.querySelector("dialog[open]")','Native Escape still closes dialog');
    assert(await evaluate('document.activeElement.classList.contains("screenshot-trigger")'),'Dialog returns focus');
  }
  checks.push('dark desktop/light mobile native screenshot dialogs: frosted frame and backdrop, opaque original image canvas, focus/scroll restoration');
  await viewport(1440,1000);await media('dark');await load();
  await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'},{name:'prefers-reduced-motion',value:'no-preference'},{name:'prefers-reduced-transparency',value:'reduce'}]});
  await evaluate('document.querySelector(".nav-disclosure summary").click()');await pause(250);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".nav-disclosure[open] .nav-dropdown")).backdropFilter'),'none','Reduced transparency uses solid readable surfaces');
  assert.equal(await evaluate('document.documentElement.dataset.motion'),'full','Glass styling does not disable brand motion');
  await key('Escape',27);await media('dark');
  checks.push('reduced-transparency solid fallback; existing brand animation policy preserved');
  await cdp('Page.navigate',{url:url+'/products/lan-messenger/docs/'});
  await waitFor('location.pathname==="/products/lan-messenger/docs/"&&!!document.querySelector(".docs-nav")','Nested shared shell loads');await pause(300);
  await evaluate('document.querySelectorAll(".nav-disclosure summary")[1].click()');await pause(250);
  assert(await inside('.nav-disclosure[open] .nav-dropdown'),'The same polished navigation works on nested pages');
  checks.push('shared glossy navigation on nested documentation routes');
  await key('Escape',27);
  await verifyGlassMaterials({cdp,evaluate,load,viewport,media,waitFor,pause,url,checks,capture});
}

/** Verify translucent materials and resting text contrast on the actual rendered routes. */
async function verifyGlassMaterials({cdp,evaluate,load,viewport,media,waitFor,pause,url,checks,capture}){
 const routes=['/','/products/','/products/lan-messenger/','/products/lan-messenger/docs/','/downloads/','/privacy/','/about/','/products/lan-messenger/releases/'];
 const summaries=[];
 for(const theme of ['light','dark']){
  await viewport(1440,1000);await media(theme);
  for(const route of routes){
   await evaluate("document.documentElement.dataset.qaDeparting='true'");
   await cdp('Page.navigate',{url:url+route});
   await waitFor("document.readyState==='complete'&&!document.documentElement.dataset.qaDeparting&&!!document.querySelector('main')&&location.pathname==="+JSON.stringify(route),'Surface route '+route);
   await evaluate('document.fonts.ready');await pause(350);
   const material=await evaluate(`(()=>{
    const probe=document.createElement('canvas');probe.width=probe.height=1;
    const context=probe.getContext('2d',{willReadFrequently:true});
    const rgba=color=>{context.clearRect(0,0,1,1);context.fillStyle=color;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].map((v,i)=>i===3?v/255:v);};
    const lum=rgb=>rgb.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const composite=(color,base)=>color.slice(0,3).map((v,i)=>v*color[3]+base[i]*(1-color[3]));
    const background=rgba(getComputedStyle(document.body).backgroundColor);
    const panels=[...document.querySelectorAll('.site-shell :is(.glass-panel,.gloss-surface,.connection-bubble,.product-subnav,.download-integrity),.messenger-docs :is(.guide-check,.guide-callout,.docs-question,.docs-faq-search)')].filter(e=>!e.closest('.site-header')&&getComputedStyle(e).display!=='none');
    const cards=panels.map(panel=>{const style=getComputedStyle(panel),color=rgba(style.backgroundColor),base=composite(color,background);const copy=[...panel.querySelectorAll('p')].filter(p=>getComputedStyle(p).display!=='none').map(p=>{const ink=rgba(getComputedStyle(p).color);return (Math.max(lum(ink),lum(base))+.05)/(Math.min(lum(ink),lum(base))+.05);});return{alpha:color[3],blur:style.backdropFilter,copy};});
    const header=document.querySelector('.header-inner');const frost=getComputedStyle(header,'::before');
    return{cards,headerAlpha:rgba(frost.backgroundColor)[3],headerBlur:frost.backdropFilter,foregroundFilter:getComputedStyle(document.querySelector('.page-reveal-content')).filter,overflow:document.documentElement.scrollWidth>innerWidth};
   })()`);
   assert(!material.overflow,'No overflow on '+route+' '+theme);
   assert(material.headerAlpha>.5&&material.headerAlpha<.85,'Header is translucent with readable tint');
   assert(material.headerBlur.includes('blur'),'Header frost stays on its separate layer');
   assert.equal(material.foregroundFilter,'none','Content is never blurred');
   assert(material.cards.length>0,'Shared footer/card material is present');
   for(const card of material.cards){
    assert(card.alpha>.3&&card.alpha<.85,'Panels are translucent: '+route+' '+theme+' alpha '+card.alpha);
    assert(card.blur.includes('blur'),'Panels have a frosted backdrop');
    for(const ratio of card.copy)assert(ratio>=4.5,'Resting copy contrast against the composited base material: '+route+' '+theme+' '+ratio);
   }
   summaries.push({route,theme,panels:material.cards.length,minCopyContrast:Math.min(...material.cards.flatMap(c=>c.copy)).toFixed(2)});
   if(route==='/'){
    await waitFor("document.querySelector('.particle-backdrop').dataset.renderer==='webgl'",'Hero uses the real renderer');
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.particle-reading-veil')).display"),'none','No tint lies over the original 3D app preview');
    await capture('homepage-'+theme);
    await evaluate("document.querySelector('.usecase-card').scrollIntoView({block:'center',behavior:'instant'})");await pause(1100);await capture('cards-'+theme);
    await evaluate("document.querySelector('.footer-directory').scrollIntoView({block:'center',behavior:'instant'})");await pause(800);await capture('footer-'+theme);
   }else if(route==='/downloads/'){
    await evaluate("document.querySelector('.windows-download').scrollIntoView({block:'start',behavior:'instant'})");await pause(700);await capture('downloads-'+theme);
   }else if(route.includes('/docs/')){
    await evaluate("document.querySelector('.guide-conversations').scrollIntoView({block:'center',behavior:'instant'})");await pause(700);await capture('documentation-'+theme);
   }
  }
 }
 await viewport(375,900);await media('light');await load();
 await evaluate("document.querySelector('.usecase-card').scrollIntoView({block:'center',behavior:'instant'})");await pause(1100);
 assert(await evaluate("getComputedStyle(document.querySelector('.usecase-card')).backdropFilter.includes('blur')"),'Mobile cards keep lightweight frost');
 await capture('cards-mobile-light');
 checks.push({label:'shared glass materials across all eight routes and both themes; light/dark base text contrast; header frost isolation; no preview tint; mobile frost',surfaces:summaries});
}
