/** Verify the approved UI changes against the actual static site, not source strings. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function verifyPremiumUi({cdp,evaluate,load,viewport,media,waitFor,pause,url,checks,report,output}) {
  const scrollTo = async selector => {
    await evaluate('document.querySelector('+JSON.stringify(selector)+').scrollIntoView({block:"center",behavior:"instant"})');
    await pause(1000);
  };
  const open = async route => {
    await evaluate('document.documentElement.dataset.qaDeparting="true"');
    await cdp('Page.navigate',{url:url+route});
    await waitFor('document.readyState==="complete" && !document.documentElement.dataset.qaDeparting && location.pathname==='+JSON.stringify(route),'Open '+route);
    await evaluate('document.fonts.ready');await pause(1000);
  };
  const capture = async name => {
    const image=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    const file=path.join(output,'premium-'+name+'.png');
    await fs.writeFile(file,Buffer.from(image.data,'base64'));
    report.push({file:path.relative(process.cwd(),file)});
  };
  const verifyConnection = async theme => {
    const bounds = await evaluate('(()=>{const e=document.querySelector(".connection-diagram"),r=e.getBoundingClientRect();return {start:r.top+scrollY-innerHeight*.82,end:r.top+scrollY-innerHeight*.42}})()');
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".connection-route")).position'),'static','Connection bar stays in normal document flow');
    await evaluate('window.scrollTo({top:'+bounds.start+',behavior:"instant"})');await pause(100);
    const beforeScroll=await evaluate('({y:document.querySelector(".connection-route").getBoundingClientRect().top,scroll:scrollY})');
    await evaluate('window.scrollBy({top:160,behavior:"instant"})');await pause(150);
    const afterScroll=await evaluate('({y:document.querySelector(".connection-route").getBoundingClientRect().top,scroll:scrollY})');
    assert(Math.abs((beforeScroll.y-afterScroll.y)-(afterScroll.scroll-beforeScroll.scroll))<1,'Connection bar scrolls naturally before the lines finish filling');
    for(const progress of [0,.25,.75,1,0]) {
      const position=bounds.start+(bounds.end-bounds.start)*progress;
      await evaluate('window.scrollTo({top:'+position+',behavior:"instant"})');
      const expectedLeft=Math.min(1,progress*2),expectedRight=Math.max(0,progress*2-1);
      await waitFor('(()=>{const s=getComputedStyle(document.querySelector(".connection-diagram"));return Math.abs(parseFloat(s.getPropertyValue("--connection-left"))-'+expectedLeft+')<.025&&Math.abs(parseFloat(s.getPropertyValue("--connection-right"))-'+expectedRight+')<.025})()','Dashed route fills and reverses at '+progress);
    }
    await evaluate('window.scrollTo({top:'+bounds.end+',behavior:"instant"})');
    await waitFor('(()=>{const d=document.querySelector(".connection-diagram"),s=getComputedStyle(d);return parseFloat(s.getPropertyValue("--connection-left"))>.995&&parseFloat(s.getPropertyValue("--connection-right"))>.995})()','Both wires complete in their own visible scroll range');
    assert(await evaluate('(()=>{const d=document.querySelector(".connection-diagram").getBoundingClientRect(),h=document.querySelector(".header-inner").getBoundingClientRect();return d.top>h.bottom+24&&d.bottom<innerHeight-24})()'),'Complete connection stays fully visible below the header');
    assert(await evaluate('(()=>{const d=document.querySelector(".connection-diagram").getBoundingClientRect(),w=document.querySelector(".connection-walkthrough"),r=w.getBoundingClientRect(),s=getComputedStyle(w),l=w.querySelector("ol").getBoundingClientRect();return r.top-d.bottom>=39&&parseFloat(s.borderTopWidth)>=1&&l.top-r.top>=31})()'),'Diagram and setup steps have a distinct divider and breathing room');
    await capture('connection-complete-'+theme);
    assert((await evaluate('getComputedStyle(document.querySelector(".route-wire")).backgroundImage')).includes('repeating-linear-gradient'),'Unfilled route retains a dashed base');
    for(const index of [0,1,2,1,0]) {
      await evaluate('(()=>{const e=document.querySelectorAll(".connection-step")['+index+'],r=e.getBoundingClientRect();window.scrollTo({top:scrollY+r.top+r.height/2-innerHeight*.6,behavior:"instant"})})()');
      await waitFor('document.querySelector(".setup-connection-story").dataset.activeStep==="'+index+'"','Current setup step follows reading position');
      assert.equal(await evaluate('document.querySelectorAll(".connection-step[aria-current=step]").length'),1,'Exactly one accessible current step');
      assert.equal(await evaluate('document.querySelectorAll(".connection-step[data-state=active]").length'),1,'Exactly one visual highlight');
      await pause(600);
      if(index===1)await capture('setup-connection-story-'+theme);
    }
  };
  const statementAt = async (index, name) => {
    const positions=[.08,.51,.94];
    const top=await evaluate('(()=>{const e=document.querySelector(".scroll-statement"),y=e.getBoundingClientRect().top+scrollY;return y-innerHeight*.82+innerHeight*.56*'+positions[index]+'})()');
    await evaluate('window.scrollTo({top:'+top+',behavior:"instant"})');
    await waitFor('(()=>{const e=document.querySelector(".scroll-statement"),w=e.querySelector(".statement-window").getBoundingClientRect(),r=e.querySelectorAll(".statement-phrase")['+index+'].getBoundingClientRect();return e.dataset.active==="'+index+'"&&r.top>=w.top-.75&&r.bottom<=w.bottom+.75&&r.top>=0&&r.bottom<=innerHeight})()','Slider phrase '+(index+1)+' has a complete reading hold');
    if(name)await capture(name);
  };
  for(const theme of ['dark','light']) {
    await viewport(1440,1000);await media(theme);await load();
    assert.deepEqual(await evaluate('[...document.querySelectorAll("main .chapter-number")].map(e=>e.textContent)'),['01','02','03','04','05'],'Five continuous homepage chapters');
    assert.equal(await evaluate('document.querySelectorAll(".chapter-index").length'),5,'All five chapters use the restored editorial number layout');
    assert(await evaluate('parseFloat(getComputedStyle(document.querySelector(".chapter-number")).fontSize)>=150'),'Desktop chapter numbers retain the large original style');
    assert.equal(await evaluate('document.querySelectorAll(".ambient-routes path").length'),6,'Only perimeter ring paths are drawn');
    assert.equal(await evaluate('document.querySelector(".network-wallpaper").dataset.topology'),'perimeter-ring','Background is structured around the reading area');
    assert(await evaluate('[...document.querySelectorAll(".chapter-navigation a")].every(a=>!!document.querySelector(a.getAttribute("href")))'),'Every chapter navigates to a real section');
    assert.equal(await evaluate('document.querySelectorAll("#experience [role=tab]").length'),4,'Four real product views');
    assert(await evaluate('document.querySelector("#download .download-coming-soon").disabled'),'Homepage download remains honestly unavailable');
    const before=await evaluate('JSON.stringify([...document.querySelectorAll(".ambient-streaks path")].map(p=>p.getAttribute("stroke-dashoffset")))');
    await pause(450);
    assert.notEqual(await evaluate('JSON.stringify([...document.querySelectorAll(".ambient-streaks path")].map(p=>p.getAttribute("stroke-dashoffset")))'),before,'Packet paths animate independently of scroll');
    await evaluate('document.querySelector(".ambience-control").click()');await pause(200);
    const held=await evaluate('JSON.stringify([...document.querySelectorAll(".ambient-streaks path")].map(p=>p.getAttribute("stroke-dashoffset")))');
    await pause(250);assert.equal(await evaluate('JSON.stringify([...document.querySelectorAll(".ambient-streaks path")].map(p=>p.getAttribute("stroke-dashoffset")))'),held,'Background can pause');
    await evaluate('document.querySelector(".ambience-control").click()');
    const nav=await evaluate('(()=>{const b=document.querySelector(".desktop-nav>a").getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2}})()');
    const background=await evaluate('getComputedStyle(document.querySelector(".desktop-nav>a")).backgroundColor');
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...nav});await pause(250);
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".desktop-nav>a")).backgroundColor'),background,'Text-only navigation hover');
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:110});
    assert.equal(await evaluate('document.querySelector(".header-edge")'),null,'Header beam is removed');
    await evaluate('document.querySelector(".nav-disclosure summary").click()');
    assert(await evaluate('(()=>{const e=document.querySelector(".nav-disclosure[open] .nav-dropdown"),r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.left+r.width/2,r.top+32))})()'),'Navigation dropdown remains unclipped');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    assert.equal(await evaluate('document.querySelectorAll(".nav-disclosure[open]").length'),0,'Header dropdown closes with Escape');
    assert.equal(await evaluate('document.querySelectorAll(".footer-brand-link img").length'),2,'Footer uses original theme-aware brand artwork');
    await capture('hero-'+theme);
    await scrollTo('#experience h2');
    await waitFor('[...document.querySelectorAll("#experience h2 .reveal-word")].every(e=>Number(getComputedStyle(e).opacity)===1)','Heading words finish their smooth reveal');
    await capture('showcase-'+theme);
    await scrollTo('#getting-started');await scrollTo('#experience h2');
    await waitFor('[...document.querySelectorAll("#experience h2 .reveal-word")].every(e=>Number(getComputedStyle(e).opacity)===1)','Heading replay completes after re-entry');
    await evaluate('document.querySelectorAll(".chapter-navigation a")[1].click()');await pause(1400);
    assert(await evaluate('(()=>{const h=document.querySelector(".header-inner").getBoundingClientRect(),s=document.querySelector("#how-it-works").getBoundingClientRect();return s.top>=h.bottom&&s.top<innerHeight*.4})()'),'Chapter anchor clears sticky header');
    await capture('connection-'+theme);
    await verifyConnection(theme);
    assert.deepEqual(await evaluate('[...document.querySelectorAll(".statement-phrase")].map(e=>e.textContent)'),['Work nearby.','Think together.','Keep it local.'],'All three phrases are preserved');
    for(let index=0;index<3;index++)await statementAt(index,'statement-'+index+'-'+theme);
    await statementAt(0);
    await scrollTo('#experience .chapter-heading-copy > p');
    await waitFor('[...document.querySelectorAll("#experience .chapter-heading-copy > p .reveal-copy-line")].length>0 && [...document.querySelectorAll("#experience .chapter-heading-copy > p .reveal-copy-line")].every(e=>Number(getComputedStyle(e).opacity)===1)','Important paragraph lines finish revealing');
    assert(await evaluate('!!document.querySelector("#experience .chapter-heading-copy > p").getAttribute("aria-label")'),'Paragraph remains labeled for screen readers');
    const height=await evaluate('document.documentElement.scrollHeight');
    for(let top=0;top<height;top+=650){await evaluate('window.scrollTo({top:'+top+',behavior:"instant"})');await pause(100);}
    await pause(1000);
    await evaluate('window.scrollTo({top:0,behavior:"instant"})');await pause(300);
    const metrics=await cdp('Page.getLayoutMetrics');
    const full=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:metrics.cssContentSize.width,height:metrics.cssContentSize.height,scale:1}});
    await fs.writeFile(path.join(output,'premium-home-'+theme+'-full.png'),Buffer.from(full.data,'base64'));
  }
  checks.push('five linked chapters; clear availability; live packets and pause; text-only hover; smooth headings and selective paragraph line reveals; anchors clear header; full dark/light captures');
  for(const width of [320,375,768,901,1024,1440,1920,3840]) {
    await viewport(width,1000);await media(width%2?'light':'dark');await load();
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'No horizontal page overflow at '+width);
    assert(await evaluate('(()=>{const b=document.querySelector(".statement-window").getBoundingClientRect();return [...document.querySelectorAll(".statement-phrase")].every(e=>{const range=document.createRange();range.selectNodeContents(e);const r=range.getBoundingClientRect();return r.left>=b.left-.5&&r.right<=b.right+.5})})()'),'Every slider phrase fits horizontally at '+width);
    if(width===320||width===375){await verifyConnection('mobile-'+width);await statementAt(0);await statementAt(1);await statementAt(2);}
    assert(await evaluate('(()=>{const b=document.querySelector(".network-world").getBoundingClientRect();return [...document.querySelectorAll(".network-device-label")].every(e=>{const r=e.getBoundingClientRect();return r.left>=b.left-.5&&r.right<=b.right+.5&&r.top>=b.top-.5&&r.bottom<=b.bottom+.5})})()'),'PC labels remain inside scene at '+width);
    if(width>900)assert(await evaluate('(()=>{const n=document.querySelector(".desktop-nav").getBoundingClientRect(),b=document.querySelector(".brand-lockup").getBoundingClientRect(),a=document.querySelector(".header-actions").getBoundingClientRect();return b.right+4<=n.left&&n.right+4<=a.left})()'),'Header navigation does not collide at '+width);
    else assert.equal(await evaluate('!!document.querySelector("canvas")'),false,'Small screens avoid WebGL');
    if(width===375){
      await evaluate('document.querySelector(".mobile-menu summary").click()');
      assert(await evaluate('document.querySelector(".mobile-menu").open'),'Mobile menu opens');
      await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      assert.equal(await evaluate('document.querySelector(".mobile-menu").open'),false,'Mobile menu closes with Escape');
      await capture('mobile-light');
    }
  }
  checks.push('320-3840px layout containment; vertical slider holds and complete text; header collision checks; lightweight mobile scene; keyboard mobile menu');
  await viewport(1440,1000);await media('dark',true);await load();
  assert.equal(await evaluate('document.documentElement.dataset.motion'),'full','Brand motion remains enabled independently of OS preference');
  assert.equal(await evaluate('document.querySelector(".network-wallpaper").dataset.animated'),'true','Background is live with OS reduced motion');
  assert(await evaluate('document.querySelectorAll(".reveal-word").length>0'),'Marketing word reveals stay enabled');
  const reducedBefore=await evaluate('JSON.stringify([...document.querySelectorAll(".ambient-streaks path")].map(p=>p.getAttribute("stroke-dashoffset")))');
  await waitFor('JSON.stringify([...document.querySelectorAll(".ambient-streaks path")].map(p=>p.getAttribute("stroke-dashoffset")))!=='+JSON.stringify(reducedBefore),'Brand packets keep moving with OS reduced motion');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".route-arrival")).animationName'),'none','Reduced motion disables route arrival animation');
  for(let index=0;index<3;index++)await statementAt(index);
  await verifyConnection('os-reduced');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".statement-window")).overflow'),'hidden','Slider retains its single-phrase mask');
  await capture('reduced-motion');
  await media('dark');
  await viewport(375,1000);await load();
  assert.equal(await evaluate('!!document.querySelector("canvas")'),false,'Mobile still skips WebGL');
  const mobileBefore=await evaluate('JSON.stringify([...document.querySelectorAll(".ambient-streaks path")].map(p=>p.getAttribute("stroke-dashoffset")))');
  await pause(450);
  assert.notEqual(await evaluate('JSON.stringify([...document.querySelectorAll(".ambient-streaks path")].map(p=>p.getAttribute("stroke-dashoffset")))'),mobileBefore,'Lightweight background keeps moving on mobile');
  checks.push('continuous brand motion under both OS preferences; reduced navigation effects; live mobile SVG background without WebGL when motion is enabled');
  const routes=['/products/','/products/lan-messenger/','/products/lan-messenger/docs/','/privacy/','/downloads/','/products/lan-messenger/releases/','/about/'];
  for(const width of [375,1440]) {
    await viewport(width,1000);await media(width===375?'light':'dark');
    for(const route of routes) {
      await open(route);
      assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'No overflow: '+route+' at '+width);
      assert.equal(await evaluate('document.querySelectorAll("main h1").length'),1,'One page title: '+route);
      assert.equal(await evaluate('document.querySelectorAll(".breadcrumb [aria-current=page]").length'),1,'Menu page has a clear current breadcrumb');
      if(route.includes('/docs/')||route==='/privacy/') {
        assert.equal(await evaluate('document.querySelectorAll(".reveal-word").length'),0,'Reading pages stay still');
        assert(Number(await evaluate('getComputedStyle(document.querySelector(".network-wallpaper")).opacity'))<=.2,'Reading background is quiet');
      }
      if(route==='/products/lan-messenger/')assert.equal(await evaluate('document.querySelectorAll("main .screenshot-trigger").length'),1,'Product page has one reusable screenshot showcase');
      if(route==='/downloads/')assert(await evaluate('document.querySelector(".download-coming-soon").disabled'),'Downloads remain unavailable');
    }
  }
  await open('/products/lan-messenger/docs/');
  await evaluate('document.querySelectorAll(".docs-nav a")[3].click()');await pause(1300);
  assert(await evaluate('(()=>{const s=document.querySelector("#files").getBoundingClientRect(),h=document.querySelector(".header-inner").getBoundingClientRect();return s.top>=h.bottom&&s.top<innerHeight*.4})()'),'Documentation anchors clear header');
  await waitFor('document.querySelector(".docs-nav a[aria-current=location]")?.hash==="#files"','Documentation navigation tracks the current section');
  await capture('documentation-dark');
  await open('/products/lan-messenger/');
  await evaluate('document.querySelectorAll(".product-subnav a")[1].click()');await pause(1500);
  await waitFor('document.querySelector(".product-subnav a[aria-current=location]")?.hash==="#everyday"','Product navigation tracks the current section');
  await scrollTo('.footer-directory');await capture('footer-dark');
  checks.push('reversible dashed-to-orange route; sequential forward/reverse setup highlights in both themes and 320/375px; non-sticky connection bar; wires complete while fully visible; separated setup walkthrough; header beam removed; unclipped keyboard dropdown; branded footer; shared breadcrumbs and current-section navigation');
  checks.push('all seven secondary routes at mobile/desktop; quiet documentation/privacy; one product showcase; documentation anchors');
}
