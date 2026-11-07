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
const browser = spawn(browserPath, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', 'about:blank'], {windowsHide:true, stdio:'ignore'});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
const pending = new Map();
let id = 0;
const errors = [], external = [], report = [];
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
      const requestUrl=message.params.request.url;
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
    await cdp('Page.navigate',{url});
    for(let i=0;i<100;i++){
      if(await evaluate("document.readyState==='complete' && !!document.querySelector('#hero-title')"))break;
      await pause(100);
    }
    await evaluate('document.fonts.ready'); await pause(1200);
  };
  const media=async (theme, reduce=false)=>cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme},{name:'prefers-reduced-motion',value:reduce?'reduce':'no-preference'}]});
  const viewport=async (width,height=1000)=>cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  await viewport(1440); await media('dark'); await load();
  await evaluate("localStorage.removeItem('lymora-website-theme')");
  // Both themes and all approved breakpoints, including a narrow 320px viewport.
  for(const theme of ['dark','light']){
    await media(theme);
    for(const width of [320,375,390,768,1024,1440]){
      await viewport(width,width<600?844:1000);await load();
      const state=await evaluate("(()=>({theme:document.documentElement.dataset.theme,width:innerWidth,scroll:document.documentElement.scrollWidth,images:[...document.images].every(i=>i.complete&&i.naturalWidth>0),headline:getComputedStyle(document.querySelector('h1')).fontFamily,bodyFont:getComputedStyle(document.body).fontFamily,links:[...document.querySelectorAll('a[href^=\"#\"]')].every(a=>!!document.querySelector(a.getAttribute('href'))),vitals:window.__webVitals}))()");
      assert.equal(state.theme,theme);assert(state.scroll<=state.width,'No horizontal overflow at '+width);assert(state.images,'Both original logos loaded');assert(state.links,'All internal links have real destinations');
      report.push({theme,width,...state});
      if(width===1440||width===390){await pause(2500);const name=(width===1440?'desktop':'mobile')+'-'+theme;const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));const metrics=await cdp('Page.getLayoutMetrics');const full=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:metrics.cssContentSize.width,height:metrics.cssContentSize.height,scale:1}});await fs.writeFile(path.join(output,name+'-full.png'),Buffer.from(full.data,'base64'));}
    }
  }
  // Theme toggle and persistence survive reload and override system preference.
  await evaluate("document.querySelector('button[aria-label=\"Switch color theme\"]').click()");
  assert.equal(await evaluate('document.documentElement.dataset.theme'),'dark');await load();
  assert.equal(await evaluate('document.documentElement.dataset.theme'),'dark');
  // Keyboard opens the native mobile disclosure; Escape closes it and restores focus.
  await viewport(375,844);await load();
  await evaluate("document.querySelector('.mobile-menu summary').focus()");
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await pause(300);
  assert.equal(await evaluate("document.querySelector('.mobile-menu').open"),true,JSON.stringify(await evaluate("({focused:document.activeElement.outerHTML,hasFocus:document.hasFocus(),errors:0})")));
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await pause(100);
  assert.equal(await evaluate("!document.querySelector('.mobile-menu').open && document.activeElement.matches('summary')"),true);
  // Touch interaction opens the menu; selecting a link navigates and closes it.
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  const tap=async selector=>{
    const rect=await evaluate("(()=>{const r=document.querySelector("+JSON.stringify(selector)+").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
    await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x,y:rect.y}]});
    await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(250);
  };
  await tap('.mobile-menu summary');assert.equal(await evaluate("document.querySelector('.mobile-menu').open"),true);
  await tap('.mobile-panel a[href="#how-it-works"]');assert.equal(await evaluate('location.hash'),'#how-it-works');assert.equal(await evaluate("document.querySelector('.mobile-menu').open"),false);
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});
  // Reduced motion stops an active sequence and disables replay; no hidden hero content.
  await viewport(1440);await load();await media('dark',true);await pause(100);
  assert.equal(await evaluate("document.querySelector('.replay-button').disabled"),true);
  assert.equal(await evaluate("[...document.querySelectorAll('[data-hero-reveal]')].every(e=>getComputedStyle(e).opacity==='1'&&getComputedStyle(e).transform==='none')"),true);
  await media('dark',false);await pause(100);assert.equal(await evaluate("document.querySelector('.replay-button').disabled"),false);
  await evaluate("document.querySelector('.replay-button').click()");await pause(350);
  assert.equal(await evaluate("Number(getComputedStyle(document.querySelector('.packet')).opacity)>0"),true,'Replay actually starts a signal');
  for(let i=0;i<60;i++){if(await evaluate("getComputedStyle(document.querySelector('.packet')).opacity==='0' && getComputedStyle(document.querySelector('.receipt')).opacity==='0'"))break;await pause(100);}
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.packet')).opacity==='0' && getComputedStyle(document.querySelector('.receipt')).opacity==='0'"),true,JSON.stringify(await evaluate("({packet:document.querySelector('.packet').outerHTML,receipt:document.querySelector('.receipt').outerHTML})")));
  // No-JS fallback: content, matching system logo and native menu stay usable.
  await cdp('Emulation.setScriptExecutionDisabled',{value:true});await media('light');await viewport(375,844);await load();
  await evaluate("document.querySelector('.mobile-menu').open=true");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.mobile-panel')).opacity"),'1');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('h1')).opacity"),'1');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.brand-light')).display !== 'none'"),true);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.enhanced-control')).display"),'none');
  await cdp('Emulation.setScriptExecutionDisabled',{value:false});
  assert.deepEqual(missing,[],'No missing local assets');assert.deepEqual(external,[],'No external browser requests');assert.deepEqual(errors,[],'No browser or hydration errors');
  const result={browser:version.Browser,mode:process.env.LYMORA_TEST_URL?'development':'static export',checks:report,passed:['12 responsive/theme layouts','original logo assets','working anchor navigation','theme persistence','keyboard navigation and Escape focus','touch menu navigation','live reduced-motion changes','finite animation and replay','no-JavaScript visible content and native menu','no missing assets','no external browser requests','no console/runtime/hydration errors'],limitations:['Local lab observations are not field Core Web Vitals.','Other browser engines and physical touch devices are not covered.']};
  await fs.writeFile(path.join(output,process.env.LYMORA_TEST_URL?'development-results.json':'browser-results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  await send('Target.closeTarget',{targetId:target.targetId});await send('Browser.close');
} finally {
  if(socket)socket.close();
  for(const promise of pending.values()){clearTimeout(promise.timeout);promise.reject(Error('Browser closed'));}pending.clear();
  server.close();if(browser.exitCode===null)browser.kill();
}
