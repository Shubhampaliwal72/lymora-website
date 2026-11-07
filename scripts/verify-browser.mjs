/** Local acceptance checks against out/, using an installed Edge/Chrome. No uploads. */
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
const browser = spawn(browserPath, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--enable-unsafe-swiftshader', 'about:blank'], {windowsHide:true, stdio:'ignore'});
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
    await evaluate("document.querySelector('.ambience-control[aria-pressed=false]')?.click()");
  };
  const media=async (theme, reduce=false)=>cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme},{name:'prefers-reduced-motion',value:reduce?'reduce':'no-preference'}]});
  const viewport=async (width,height=1000)=>cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});

  const waitFor=async (expression,message,attempts=120) => {
    for(let i=0;i<attempts;i++){if(await evaluate(expression))return;await pause(100);}
    throw Error(message+': '+JSON.stringify(await evaluate("({mode:document.querySelector('.living-network')?.dataset.mode,canvas:!!document.querySelector('canvas'),hardware:navigator.hardwareConcurrency,memory:navigator.deviceMemory,fine:matchMedia('(pointer:fine)').matches})")));
  };

  const rendererFiles=[];
  async function findRendererFiles(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await findRendererFiles(file);else if(file.endsWith('.js')&&(await fs.readFile(file,'utf8')).includes('network-canvas'))rendererFiles.push('/'+path.relative(path.join(root,'out'),file).split(path.sep).join('/'));}}
  if(!process.env.LYMORA_TEST_URL){await findRendererFiles(path.join(root,'out/_next'));assert(rendererFiles.length>0,'Lazy renderer chunk identified');}
  await viewport(1440);await media('dark',true);await load();assert.equal(await evaluate("!!document.querySelector('canvas')"),false,'Reduced motion starts without WebGL');
  await viewport(375,844);await media('dark');await load();
  if(!process.env.LYMORA_TEST_URL)assert.equal(requests.some(request=>rendererFiles.includes(new URL(request).pathname)),false,'Mobile and reduced motion do not request the lazy 3D chunk');

  assert.equal(await evaluate("!!document.querySelector('canvas')"),false,'Mobile starts without the 3D renderer');
  await evaluate("localStorage.removeItem('lymora-website-theme')");
  for(const theme of ['dark','light']){
    await media(theme);
    for(const width of [320,375,390,768,1024,1440]){
      await viewport(width,width<600?844:1000);await load();
      if(width>900)await waitFor("document.querySelector('.living-network').dataset.mode==='3d'",'Desktop 3D scene must finish rendering');
      const state=await evaluate("(()=>({theme:document.documentElement.dataset.theme,width:innerWidth,scroll:document.documentElement.scrollWidth,images:[...document.images].filter(i=>getComputedStyle(i).display!=='none'&&(i.loading!=='lazy'||i.getBoundingClientRect().top<innerHeight&&i.getBoundingClientRect().bottom>0)).every(i=>i.complete&&i.naturalWidth>0),mode:document.querySelector('.living-network').dataset.mode,canvas:!!document.querySelector('canvas'),headline:getComputedStyle(document.querySelector('h1')).fontFamily,bodyFont:getComputedStyle(document.body).fontFamily,links:[...document.querySelectorAll('a[href^=\"#\"]')].every(a=>!!document.querySelector(a.getAttribute('href'))),vitals:window.__webVitals}))()");
      assert.equal(state.theme,theme);assert(state.scroll<=state.width,'No horizontal overflow at '+width);assert(state.images);assert(state.links);
      if(width<=900)assert.equal(state.canvas,false,'No canvas loaded for mobile/tablet');
      report.push(state);
      if(width===1440||width===390){await pause(6300);const name=(width===1440?'desktop':'mobile')+'-'+theme;const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));const metrics=await cdp('Page.getLayoutMetrics');const full=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:metrics.cssContentSize.width,height:metrics.cssContentSize.height,scale:1}});await fs.writeFile(path.join(output,name+'-full.png'),Buffer.from(full.data,'base64'));}
    }
  }
  await evaluate("document.querySelector('button[aria-label=\"Switch color theme\"]').click()");assert.equal(await evaluate('document.documentElement.dataset.theme'),'dark');await load();assert.equal(await evaluate('document.documentElement.dataset.theme'),'dark');
  await viewport(375,844);await load();await evaluate("document.querySelector('.mobile-menu summary').focus()");
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await pause(300);assert.equal(await evaluate("document.querySelector('.mobile-menu').open"),true);
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await pause(100);assert.equal(await evaluate("!document.querySelector('.mobile-menu').open&&document.activeElement.matches('summary')"),true);
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  const tap=async selector=>{const rect=await evaluate("(()=>{const r=document.querySelector("+JSON.stringify(selector)+").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()");await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x,y:rect.y}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(250);};
  await tap('.mobile-menu summary');assert.equal(await evaluate("document.querySelector('.mobile-menu').open"),true);await tap('.mobile-panel a[href="#how-it-works"]');assert.equal(await evaluate('location.hash'),'#how-it-works');assert.equal(await evaluate("document.querySelector('.mobile-menu').open"),false);
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});
  await viewport(1440);await load();await waitFor("document.querySelector('.living-network').dataset.mode==='3d'",'3D re-enabled after mobile resize');
  await evaluate("document.querySelector('button[aria-label=\"Replay network preview\"]').click()");await pause(1500);
  const first=await cdp('Page.captureScreenshot',{format:'png'});await pause(700);const second=await cdp('Page.captureScreenshot',{format:'png'});assert.notEqual(first.data,second.data,'Network preview actually animates');
  await evaluate("document.querySelector('button[aria-label=\"Pause network preview\"]').click()");await pause(500);
  const paused=await cdp('Page.captureScreenshot',{format:'png'});await pause(500);const still=await cdp('Page.captureScreenshot',{format:'png'});assert.equal(paused.data,still.data,'Paused preview comes to rest');
  await evaluate("document.querySelector('button[aria-label=\"Replay network preview\"]').click()");await waitFor("!!document.querySelector('button[aria-label=\"Play network preview\"]')",'Intro must finish without looping',75);
  await media('dark',true);await pause(250);assert.equal(await evaluate("!!document.querySelector('canvas')"),false,'Reduced motion unmounts WebGL');assert.equal(await evaluate("[...document.querySelectorAll('[data-hero-reveal]')].every(e=>getComputedStyle(e).opacity==='1'&&getComputedStyle(e).transform==='none')"),true);
  await media('dark',false);await waitFor("document.querySelector('.living-network').dataset.mode==='3d'",'Scene can return after reduced motion changes');
  await evaluate("document.querySelector('.lighter-control').click()");assert.equal(await evaluate("!!document.querySelector('canvas')"),false,'Lighter view releases WebGL');assert.equal(await evaluate("document.querySelector('.living-network').dataset.mode"),'illustrated');

  await evaluate("document.querySelector('.lighter-control').click()");await waitFor("document.querySelector('.living-network').dataset.mode==='3d'",'Can restore the full scene');


  // Click the Studio monitor itself, using the scene camera's perspective projection.
  const screenPoint=await evaluate("(()=>{const r=document.querySelector('.network-world').getBoundingClientRect(),f=r.height/(2*Math.tan(35.5*Math.PI/360));return {x:r.left+r.width/2+(.58-.17)/(9.52+.9)*f,y:r.top+r.height/2-(1.34-.05)/(9.52+.9)*f}})()");
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...screenPoint});
  await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...screenPoint});
  await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...screenPoint});
  await waitFor("document.querySelector('.living-network').dataset.endpoint==='studio' && document.querySelector('.living-network').dataset.phase==='0'",'Clicking a 3D monitor restarts its direct route');

  // Stage 2: keyboard-select the receiving PC, then follow a complete finite route.
  await evaluate("document.querySelector('.endpoint-choices button:nth-of-type(2)').focus()");
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await waitFor("document.querySelector('.living-network').dataset.endpoint==='team'",'Keyboard selects the receiving PC');
  assert.equal(await evaluate("document.querySelectorAll('.endpoint-choices [aria-pressed=true]').length"),1,'Exactly one recipient is selected');
  const phases=new Set();
  for(let i=0;i<75;i++){phases.add(await evaluate("Number(document.querySelector('.living-network').dataset.phase)"));if(phases.has(4))break;await pause(100);}
  assert.deepEqual([...phases],[0,1,2,3,4],'Discovery, connect, transit, arrival, receipt occur in order');
  assert.match(await evaluate("document.querySelector('.network-story-status [role=status]').textContent"),/Message received by Team PC/);
  await evaluate("document.querySelector('.transfer-choices button:nth-of-type(2)').click()");
  assert.equal(await evaluate("document.querySelector('.living-network').dataset.transfer"),'file');
  await waitFor("document.querySelector('.living-network').dataset.phase==='2'",'A file follows the selected direct connection');
  await evaluate("document.querySelector('button[aria-label=\"Pause network preview\"]').click()");await pause(250);
  const frozen=await evaluate("document.querySelector('.fallback-packet').getAttribute('transform')");await pause(500);
  assert.equal(await evaluate("document.querySelector('.fallback-packet').getAttribute('transform')"),frozen,'Both renderers pause on the shared clock');
  await evaluate("document.querySelector('button[aria-label=\"Play network preview\"]').click()");
  await waitFor("document.querySelector('.living-network').dataset.phase==='4'",'File sequence completes');
  assert.match(await evaluate("document.querySelector('.network-story-status [role=status]').textContent"),/File received by Team PC/);
  // Touch uses the same choices without requiring WebGL.
  await viewport(375,844);await load();
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await evaluate("document.querySelector('.endpoint-choices').scrollIntoView({block:'center',behavior:'instant'})");
  await tap('.endpoint-choices button:nth-of-type(2)');await tap('.transfer-choices button:nth-of-type(2)');
  assert.equal(await evaluate("document.querySelector('.living-network').dataset.endpoint"),'team');
  assert.equal(await evaluate("document.querySelector('.living-network').dataset.transfer"),'file');
  assert.equal(await evaluate("!!document.querySelector('canvas')"),false);
  await waitFor("document.querySelector('.living-network').dataset.phase==='2'",'Lightweight file route animates');
  assert.equal(await evaluate("document.querySelector('.fallback-packet').getAttribute('opacity')"),'1');
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});
  await media('dark',true);await pause(250);
  assert.equal(await evaluate("document.querySelector('.living-network').dataset.phase"),'4','Reduced motion shows the result immediately');
  await evaluate("document.querySelector('.endpoint-choices button').click()");
  assert.match(await evaluate("document.querySelector('.network-story-status [role=status]').textContent"),/File received by Studio PC/);
  await viewport(1440);await media('dark',false);await load();await waitFor("document.querySelector('.living-network').dataset.mode==='3d'",'Desktop renderer returns after touch and reduced motion');

  await evaluate("document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()");
  await waitFor("!document.querySelector('canvas') && document.querySelector('.living-network').dataset.mode==='illustrated'",'Lost WebGL context returns to the illustrated fallback');
  const hint=await cdp('Page.addScriptToEvaluateOnNewDocument',{source:"Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2,configurable:true});Object.defineProperty(navigator,'deviceMemory',{get:()=>2,configurable:true});"});
  await load();assert.equal(await evaluate("!!document.querySelector('canvas')"),false,'Low-powered device stays lightweight');await cdp('Page.removeScriptToEvaluateOnNewDocument',{identifier:hint.identifier});
  await cdp('Emulation.setScriptExecutionDisabled',{value:true});await media('light');await viewport(375,844);await load();await evaluate("document.querySelector('.mobile-menu').open=true");assert.equal(await evaluate("getComputedStyle(document.querySelector('.mobile-panel')).opacity"),'1');assert.equal(await evaluate("getComputedStyle(document.querySelector('h1')).opacity"),'1');assert.equal(await evaluate("getComputedStyle(document.querySelector('.brand-light')).display!=='none'"),true);assert.equal(await evaluate("!!document.querySelector('canvas')"),false);
  await cdp('Emulation.setScriptExecutionDisabled',{value:false});
  assert.deepEqual(missing,[],'No missing local assets');assert.deepEqual(external,[],'No external page requests');assert.deepEqual(errors,[],'No browser/hydration errors');
  const result={stage:2,browser:version.Browser,mode:process.env.LYMORA_TEST_URL?'development':'static export',checks:report,lazyRendererFiles:rendererFiles,passed:['direct 3D monitor click','keyboard endpoint selection','ordered discovery/connection/transit/arrival/receipt','message and file replay to selected PC','shared-clock pause in both renderers','touch endpoint and file controls without WebGL','reduced-motion immediate outcome','12 responsive/theme layouts','real WebGL rendering on desktop','mobile/tablet without WebGL',(process.env.LYMORA_TEST_URL?'mobile/reduced-motion suppress the renderer':'mobile/reduced-motion do not fetch lazy renderer'),'low-power fallback','WebGL context-loss recovery','local original logos and screenshots','anchor destinations','theme persistence','keyboard and Escape focus','touch navigation','animation visibly changes','Pause holds the frame','finite replay','live reduced-motion fallback','lighter view releases WebGL','no-JS content/menu/fallback','no missing assets','no external page requests','no runtime/hydration/console errors'],limitations:['Headless 3D uses software rendering; not a hardware performance benchmark.','Field Core Web Vitals, other engines and physical devices remain Stage 5 checks.']};
  await fs.writeFile(path.join(output,process.env.LYMORA_TEST_URL?'development-results.json':'browser-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await send('Target.closeTarget',{targetId:target.targetId});await send('Browser.close');
} finally {
  if(socket)socket.close();for(const promise of pending.values()){clearTimeout(promise.timeout);promise.reject(Error('Browser closed'));}pending.clear();server.close();if(browser.exitCode===null)browser.kill();
}
