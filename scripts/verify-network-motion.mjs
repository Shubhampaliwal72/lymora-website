/** Homepage motion checks and full-page review PNGs. Loopback only; no uploads. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const root = process.cwd();
const output = path.join(root, '.verification');
await fs.mkdir(output, {recursive: true});
const browserPath = process.env.LYMORA_BROWSER_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
await fs.access(browserPath);
await fs.access(path.join(root, 'out/index.html'));
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.ico':'image/x-icon', '.woff2':'font/woff2', '.svg':'image/svg+xml', '.txt':'text/plain'};
const missing = [];
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    const staticRoot = path.join(root, 'out');
    let file = path.resolve(staticRoot, '.' + decodeURIComponent(url.pathname));
    if (file !== staticRoot && !file.startsWith(staticRoot + path.sep)) throw Error('Invalid path');
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    response.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream');
    response.end(await fs.readFile(file));
  } catch {
    missing.push(request.url); response.writeHead(404); response.end('Not found');
  }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const url = process.env.LYMORA_TEST_URL ?? 'http://127.0.0.1:' + server.address().port;
assert(new URL(url).hostname === '127.0.0.1', 'Browser checks only target a loopback website');
const profile = path.join(output, 'browser-' + Date.now());
const browser = spawn(browserPath, ['--headless=new', '--hide-scrollbars', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--enable-unsafe-swiftshader', 'about:blank'], {windowsHide:true, stdio:'ignore'});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
const pending = new Map();
let id = 0;
const errors = [], external = [], report = [], requests = [];
let target;
try {
  let port;
  for (let attempt=0; attempt<100; attempt++) {
    try { port = Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); if(port) break; } catch {}
    await pause(100);
  }
  assert(port, 'Browser debugging port started');
  const version = await (await fetch('http://127.0.0.1:' + port + '/json/version')).json();
  socket = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve,reject) => {socket.onopen=resolve;socket.onerror=reject;});
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const promise = pending.get(message.id);
      if(promise){pending.delete(message.id); clearTimeout(promise.timeout); if(message.error)promise.reject(Error(JSON.stringify(message.error)));else promise.resolve(message.result);}
    } else if(message.method === 'Runtime.exceptionThrown') {
      errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
    } else if(message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      errors.push(message.params.args.map(arg => arg.value ?? arg.description).join(' '));
    } else if(message.method === 'Network.requestWillBeSent') {
      const requestUrl=message.params.request.url;requests.push(requestUrl);
      if (/^https?:/.test(requestUrl) && !requestUrl.startsWith(url)) external.push(requestUrl);
    }
  };
  function send(method, params={}, sessionId) {
    return new Promise((resolve,reject) => {
      const messageId=++id;
      const timeout=setTimeout(()=>{pending.delete(messageId);reject(Error('CDP timeout: '+method));},15000);
      pending.set(messageId,{resolve,reject,timeout});socket.send(JSON.stringify({id:messageId,method,params,...(sessionId?{sessionId}:{})}));
    });
  }
  target=await send('Target.createTarget',{url:'about:blank'});
  const {sessionId}=await send('Target.attachToTarget',{targetId:target.targetId,flatten:true});
  const cdp=(method,params={})=>send(method,params,sessionId);
  const evaluate=async expression => {
    const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});
    if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description ?? 'Evaluation failed');
    return r.result.value;
  };
  await cdp('Page.bringToFront');await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:
    "window.__webVitals={cls:0,lcp:0};new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__webVitals.cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())window.__webVitals.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});"
  });
  const load=async () => {
    await evaluate("document.documentElement.dataset.qaDeparting='true'");
    await cdp('Page.navigate',{url});
    let loaded=false;
    for(let i=0;i<150;i++){
      if(await evaluate("document.readyState==='complete' && !document.documentElement.dataset.qaDeparting && !!document.querySelector('.living-network')")){loaded=true;break;}
      await pause(100);
    }
    assert(loaded,'Living Network page loaded successfully');
    await evaluate('document.fonts.ready'); await pause(1200);
    // Isolate the finite product preview from independently controllable ambience.

  };
  const media=async (theme, reduce=false)=>cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme},{name:'prefers-reduced-motion',value:reduce?'reduce':'no-preference'}]});
  const viewport=async (width,height=1000)=>cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});

  const waitFor=async (expression,message,attempts=120) => {
    for(let i=0;i<attempts;i++){if(await evaluate(expression))return;await pause(100);}
    throw Error(message+': '+JSON.stringify(await evaluate("({mode:document.querySelector('.living-network')?.dataset.mode,canvas:!!document.querySelector('canvas'),hardware:navigator.hardwareConcurrency,memory:navigator.deviceMemory,fine:matchMedia('(pointer:fine)').matches})")));
  };


  const exportDir=path.join(root,'design/glass-network/captures');await fs.mkdir(exportDir,{recursive:true});
  const checks=[];
  const go=async top=>{await evaluate('window.scrollTo({top:'+top+',behavior:"instant"})');await pause(1250);};
  const bounds=async selector=>evaluate('(()=>{const r=document.querySelector('+JSON.stringify(selector)+').getBoundingClientRect();return{top:r.top+scrollY,height:r.height}})()');
  const transform=selector=>evaluate('getComputedStyle(document.querySelector('+JSON.stringify(selector)+')).transform');
  const checkRibbon=async()=>{
    const ribbon=await bounds('.network-ribbon'),height=await evaluate('innerHeight');
    await go(ribbon.top-height*.82);
    const start=await transform('[data-scroll-ribbon]');
    assert(await evaluate("(()=>{const box=document.querySelector('.network-ribbon').getBoundingClientRect(),first=document.querySelector('[data-scroll-ribbon] > :first-child').getBoundingClientRect();return first.left>=box.left-.75&&first.right<=box.right+.75&&first.top>=0&&first.bottom<=innerHeight})()"),'First ribbon phrase is fully visible during its reading hold');
    await go(ribbon.top-height*.4);
    assert(await evaluate("(()=>{const box=document.querySelector('.network-ribbon').getBoundingClientRect(),last=document.querySelector('[data-scroll-ribbon] > :last-child').getBoundingClientRect();return last.left>=box.left-.75&&last.right<=box.right+.75&&last.top>=0&&last.bottom<=innerHeight})()"),'Last ribbon phrase is fully visible before leaving the viewport');
    if(await evaluate("document.querySelector('[data-scroll-ribbon]').scrollWidth>document.querySelector('.network-ribbon').clientWidth+2"))assert.notEqual(await transform('[data-scroll-ribbon]'),start,'Ribbon moves only when content overflows');
    const finish=await transform('[data-scroll-ribbon]');await go(ribbon.top-height*.3);assert.equal(await transform('[data-scroll-ribbon]'),finish,'Last phrase holds instead of drifting out');
  };
  const checkHeader=async()=>{
    assert(await evaluate("!!document.querySelector('.desktop-nav > a[href=\"/\"]') && !!document.querySelector('#mobile-navigation > a[href=\"/\"]')"),'Desktop and mobile have Home navigation');
    if(await evaluate('innerWidth>900'))assert(await evaluate("(()=>{const h=document.querySelector('.header-inner').getBoundingClientRect(),n=document.querySelector('.desktop-nav').getBoundingClientRect(),b=document.querySelector('.brand-lockup').getBoundingClientRect(),a=document.querySelector('.header-actions').getBoundingClientRect();return Math.abs((n.left+n.right-h.left-h.right)/2)<1&&b.right+6<=n.left&&n.right+6<=a.left})()"),'Header menu is centered and does not collide with branding or actions');
  };

  await viewport(1440,1000);await media('dark',true);await load();
  await waitFor("document.querySelectorAll('.reveal-word').length>0 && document.querySelector('.living-network').dataset.mode==='3d'",'Motion starts without opt-in even with system reduction');
  assert.equal(await evaluate("document.documentElement.dataset.motion"),'full','Owner-requested motion defaults on');
  assert.equal(await evaluate("!!document.querySelector('.motion-toggle')"),false,'No public motion switch');
  checks.push('always-on motion without opt-in or header switch');
  await viewport(1440,1000);await media('dark');await load();await waitFor("document.querySelector('.living-network').dataset.mode==='3d'",'Desktop scene loads');
  const offset=()=>evaluate("JSON.stringify([...document.querySelectorAll('.ambient-streaks path')].map(path=>path.getAttribute('stroke-dashoffset')))");
  const before=await offset();await pause(450);assert.notEqual(await offset(),before,'Orange light moves without scrolling');
  const colour=await evaluate("getComputedStyle(document.querySelector('.ambient-routes path')).stroke");assert.match(colour,/rgb/);const rgb=colour.match(/\d+/g).map(Number);assert(rgb[0]>rgb[1]&&rgb[1]>rgb[2],'Wire colour is orange');
  await evaluate("document.querySelector('.ambience-control').click()");await pause(250);const held=await offset();await pause(450);assert.equal(await offset(),held,'Pause ambience freezes the light');await evaluate("document.querySelector('.ambience-control').click()");
  checks.push('orange wires and independently moving light trails','pause/resume ambience');
  const hoverTarget=await evaluate("(()=>{const r=document.querySelector('.hero-actions .button').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()");
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...hoverTarget});await pause(350);
  assert.notEqual(await evaluate("getComputedStyle(document.querySelector('.hero-actions .button')).translate"),'none','Primary action has visible hover motion');
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:120});
  await checkHeader();
  const homeBefore=await evaluate("getComputedStyle(document.querySelector('.desktop-nav > a[href=\"/\"]')).backgroundColor");
  const navPoint=await evaluate("(()=>{const r=document.querySelector('.desktop-nav > a[href=\"/\"]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()");
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...navPoint});await pause(280);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.desktop-nav > a[href=\"/\"]')).backgroundColor"),homeBefore,'Navigation hover adds no background');
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:120});
  checks.push('real pointer hover feedback','Home navigation, centered header and text-only menu hover');

  await waitFor("[...document.querySelectorAll('.ambient-computers > g')].some(pc=>Number(pc.style.getPropertyValue('--arrival'))>.1)",'Packet reaches and lights a computer');
  assert(await evaluate("[...document.querySelectorAll('.ambient-computers > g')].some(pc=>Number(pc.style.getPropertyValue('--arrival'))>.05)"),'Receiving computer glows');
  const initialPair=await evaluate("document.querySelector('.living-network').dataset.source+'-'+document.querySelector('.living-network').dataset.endpoint");
  await waitFor("document.querySelector('.living-network').dataset.source+'-'+document.querySelector('.living-network').dataset.endpoint!=="+JSON.stringify(initialPair),'Automatic route changes after delivery');
  assert(await evaluate("(()=>{const world=document.querySelector('.network-world'),controls=document.querySelector('.network-interaction'),a=world.getBoundingClientRect(),b=controls.getBoundingClientRect();return getComputedStyle(world).overflow==='hidden'&&a.bottom<=b.top})()"),'3D scene is contained above controls');
  assert(await evaluate("parseFloat(getComputedStyle(document.querySelector('.header-inner')).borderTopLeftRadius)>100"),'Header has fully rounded ends');
  checks.push('arrival glow and automatic PC-to-PC route changes','contained scene and fully rounded header');
  assert.equal(await evaluate("document.querySelectorAll('.ambient-routes path[data-static=\"true\"]').length"),9,'Mesh has a stable ring and cross-links');
  assert.equal(await evaluate("document.querySelector('.ambient-case').getAttribute('width')"),'84','Background PCs are larger');
  assert(await evaluate(`(()=>{const cases=[...document.querySelectorAll('.ambient-case')].map(pc=>{const b=pc.getBBox(),m=pc.parentElement.transform.baseVal.consolidate().matrix;return{x:b.x+m.e,y:b.y+m.f,w:b.width,h:b.height}});return [...document.querySelectorAll('.ambient-routes path')].every(path=>[path.getPointAtLength(0),path.getPointAtLength(path.getTotalLength())].every(p=>cases.some(b=>p.x>=b.x-.1&&p.x<=b.x+b.w+.1&&p.y>=b.y-.1&&p.y<=b.y+b.h+.1&&Math.min(Math.abs(p.x-b.x),Math.abs(p.x-b.x-b.w),Math.abs(p.y-b.y),Math.abs(p.y-b.y-b.h))<.1)))})()`),'Every line ends on a computer bezel');
  checks.push('structured nine-link mesh and exact PC connection endpoints');


  const firstHorizontal=await transform('.ecosystem-copy'),eco=await bounds('.ecosystem-copy');await go(eco.top-280);assert.notEqual(await transform('.ecosystem-copy'),firstHorizontal,'Horizontal reveal responds to scroll');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.ecosystem-copy .reveal-word')).opacity"),'1','Heading words finish revealing after scrolling into view');
  await go(0);
  assert(Number(await evaluate("getComputedStyle(document.querySelector('.ecosystem-copy .reveal-word')).opacity"))<.2,'Heading reveal resets when leaving above its trigger');
  await go(eco.top-280);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.ecosystem-copy .reveal-word')).opacity"),'1','Heading reveal replays when revisiting');

  await checkRibbon();
  assert(await evaluate("document.querySelectorAll('.reveal-word').length>10"),'Headings have word reveal animation');
  assert(await evaluate("(()=>{const h=document.querySelector('#ecosystem-title'),first=h.querySelector(':scope > .reveal-word'),second=h.querySelector(':scope > span:not(.reveal-word)');return getComputedStyle(first).color===getComputedStyle(h).color&&getComputedStyle(first).color!==getComputedStyle(second).color})()"),'Word animation preserves the primary and secondary heading colors');
  checks.push('horizontal content reveal responds to scroll','horizontal ribbon follows vertical scroll','word-by-word scroll reveals','heading contrast survives word splitting');
  for(const theme of ['dark','light']){
    await media(theme);await load();await waitFor("document.querySelector('.living-network').dataset.mode==='3d'",'Desktop 3D ready');
    await waitFor("document.querySelector('.living-network').dataset.phase==='4'",'Capture arrival state');
    await evaluate("document.querySelector('[aria-label=\"Pause network preview\"]').click()");
    const height=await evaluate('document.documentElement.scrollHeight');
    for(let top=0;top<height;top+=750){await evaluate('window.scrollTo({top:'+top+',behavior:"instant"})');await pause(160);}
    await pause(1200);await go(0);
    await waitFor("[...document.querySelectorAll('.theme-screenshot img')].filter(i=>getComputedStyle(i).display!=='none').every(i=>i.complete&&i.naturalWidth>0)",'Original screenshot assets load');
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'No desktop overflow');
    const metrics=await cdp('Page.getLayoutMetrics'),clip={x:0,y:0,width:metrics.cssContentSize.width,height:metrics.cssContentSize.height,scale:1};
    const full=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});
    await fs.writeFile(path.join(exportDir,'Lymora-Homepage-'+theme+'-Full.png'),Buffer.from(full.data,'base64'));
    const hero=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(exportDir,'Lymora-Homepage-'+theme+'-Hero.png'),Buffer.from(hero.data,'base64'));
    report.push({theme,width:clip.width,height:clip.height,file:'design/glass-network/captures/Lymora-Homepage-'+theme+'-Full.png'});
    for(const [name,selector]of [['showcase','#experience'],['connection','#how-it-works'],['spaces','.usecase-section'],['footer','.glass-footer']]){const rect=await bounds(selector);await go(rect.top-120);const shot=await cdp('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(output,'motion-'+theme+'-'+name+'.png'),Buffer.from(shot.data,'base64'));}
    await go(0);
  }
  for(const width of [320,375,768,901,1024,1920,3840]){await viewport(width,900);await load();assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'No overflow at '+width);if(width<=900)assert.equal(await evaluate("!!document.querySelector('canvas')"),false,'Mobile is lightweight');await checkHeader();await checkRibbon();}
  checks.push('320 through 3840px layouts without horizontal overflow','mobile skips WebGL','first and last ribbon phrases remain visible at every tested width');
  for(const theme of ['dark','light']){
    await viewport(3840,2160);await media(theme,true);await load();
    await waitFor("document.querySelector('.living-network').dataset.mode==='3d'",'4K scene ready');
    await waitFor("document.querySelector('.living-network').dataset.phase==='4'",'4K arrival capture');
    await evaluate("document.querySelector('[aria-label=\"Pause network preview\"]').click()");
    const image=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    const file='Lymora-Homepage-'+theme+'-4K.png';await fs.writeFile(path.join(exportDir,file),Buffer.from(image.data,'base64'));
    report.push({theme:theme+'/4K',width:3840,height:2160,file:'design/glass-network/captures/'+file});
  }
  checks.push('native 3840x2160 dark/light browser captures');

  await viewport(375,900);await media('dark');await load();let mobileHeight=await evaluate('document.documentElement.scrollHeight');for(let top=0;top<mobileHeight;top+=750){await evaluate('window.scrollTo({top:'+top+',behavior:"instant"})');await pause(180);}await go(0);
  const mobileMetrics=await cdp('Page.getLayoutMetrics'),mobileClip={x:0,y:0,width:mobileMetrics.cssContentSize.width,height:mobileMetrics.cssContentSize.height,scale:1};const mobileShot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:mobileClip});await fs.writeFile(path.join(exportDir,'Lymora-Homepage-mobile-Full.png'),Buffer.from(mobileShot.data,'base64'));report.push({theme:'dark/mobile',width:mobileClip.width,height:mobileClip.height,file:'design/glass-network/captures/Lymora-Homepage-mobile-Full.png'});
  await viewport(1440,1000);await media('dark',true);await load();assert.equal(await evaluate("document.documentElement.dataset.motion"),'full');assert.notEqual(await evaluate("getComputedStyle(document.querySelector('.ambient-streaks')).display"),'none');
  checks.push('always-on behavior is independent of system reduced-motion settings');
  await media("dark",false);
  await evaluate(`document.querySelector('a[href="/about/"]').click()`);
  await waitFor('location.pathname==="/about/" && document.querySelector("h1")?.textContent.includes("Good technology")','Static-export client navigation works');
  assert(await evaluate("document.querySelectorAll('.reveal-word').length>0"),'Other pages receive text reveals');
  await media('dark',true);await pause(300);
  assert(await evaluate("document.querySelectorAll('.reveal-word').length>0"),'Owner-requested reveals remain active');
  checks.push('client navigation resolves static-export segment data','other-page reveals remain active without a motion switch');
  assert.deepEqual(errors,[],'No console/runtime/hydration errors');assert.deepEqual(missing,[],'No missing assets');assert.deepEqual(external,[],'No external requests');
  const result={passed:true,browser:version.Browser,checks,exports:report,scope:'Actual static-export browser capture; software WebGL, not a hardware FPS benchmark.'};await fs.writeFile(path.join(output,'network-motion-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await send('Target.closeTarget',{targetId:target.targetId});await send('Browser.close');
} finally {
  if(socket)socket.close();for(const promise of pending.values()){clearTimeout(promise.timeout);promise.reject(Error('Browser closed'));}pending.clear();server.close();if(browser.exitCode===null)browser.kill();
}
