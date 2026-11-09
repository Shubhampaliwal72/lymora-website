/** Homepage motion checks and full-page review PNGs. Loopback only; no uploads. */
import assert from 'node:assert/strict';
import { verifyDownloadUi } from './verify-download-ui.mjs';
import { verifyHeaderUi } from './verify-header-ui.mjs';
import { verifyLogoUi } from './verify-logo-ui.mjs';
import { verifyDocumentationUi } from './verify-documentation-ui.mjs';
import { verifyGlassUi } from './verify-glass-ui.mjs';
import { verifyLaunchUi } from './verify-launch-ui.mjs';
import { verifyNavigationUi } from './verify-navigation-ui.mjs';
import { verifyPremiumUi } from './verify-premium-ui.mjs';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const root = process.cwd();
const output = path.join(root, '.verification', process.env.LYMORA_TEST_URL ? 'local-server' : '');
await fs.mkdir(output, {recursive: true});
const browserPath = process.env.LYMORA_BROWSER_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
await fs.access(browserPath);
await fs.access(path.join(root, 'out/index.html'));
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.ico':'image/x-icon', '.woff2':'font/woff2', '.svg':'image/svg+xml', '.txt':'text/plain'};
const missing = [];
const faults = {route: "", delay: 0, fail: false, hits: 0};
// Apply only the global header block locally to catch CSP regressions before Pages exists.
const headerText=await fs.readFile(path.join(root,'public/_headers'),'utf8');
const localHeaders=headerText.split(/\r?\n\r?\n/)[0].split(/\r?\n/).slice(1).map(line=>{const index=line.indexOf(':');return [line.slice(0,index).trim(),line.slice(index+1).trim()];});
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    if (faults.route && url.pathname.startsWith(faults.route) && /\.(txt|js)$/.test(url.pathname)) {
      faults.hits++;
      if (faults.delay) await new Promise(resolve => setTimeout(resolve, faults.delay));
      if (faults.fail) {response.writeHead(503);response.end('Intentional local navigation test failure');return;}
    }
    const staticRoot = path.join(root, 'out');
    let file = path.resolve(staticRoot, '.' + decodeURIComponent(url.pathname));
    if (file !== staticRoot && !file.startsWith(staticRoot + path.sep)) throw Error('Invalid path');
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    for(const [name,value] of localHeaders)if(name)response.setHeader(name,value);
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
const errors = [], warnings = [], external = [], report = [], requests = [];
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
    } else if(message.method === 'Runtime.consoleAPICalled' && message.params.type === 'warning') {
      warnings.push(message.params.args.map(arg => arg.value ?? arg.description).join(' '));
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


  const checks=[];
  const logoOnly=process.argv.includes('--logo-only');
  if(logoOnly)await verifyLogoUi({cdp,evaluate,viewport,media,waitFor,pause,url,checks,output});
  const headerOnly=process.argv.includes('--header-only');
  if(headerOnly)await verifyHeaderUi({cdp,evaluate,viewport,media,waitFor,pause,url,checks,output});
  const downloadsOnly=process.argv.includes('--downloads-only');
  if(downloadsOnly)await verifyDownloadUi({cdp,evaluate,viewport,media,waitFor,pause,url,checks,output});
  const docsOnly=process.argv.includes('--docs-only');
  if(docsOnly)await verifyDocumentationUi({cdp,evaluate,viewport,media,waitFor,pause,url,checks,output});
  const glassOnly=process.argv.includes('--glass-only');
  if(glassOnly)await verifyGlassUi({cdp,evaluate,load,viewport,media,waitFor,pause,url,checks,output});
  const launchOnly=process.argv.includes('--launch-only')||process.env.LYMORA_VERIFY_LAUNCH_ONLY==='1';
  const navigationOnly=process.argv.includes('--navigation-only');
  if(navigationOnly) await verifyNavigationUi({cdp,evaluate,viewport,media,waitFor,pause,url,checks,requests,errors,faults,output});
  if(!logoOnly&&!headerOnly&&!downloadsOnly&&!docsOnly&&!glassOnly&&!launchOnly&&!navigationOnly) await verifyPremiumUi({cdp,evaluate,load,viewport,media,waitFor,pause,url,checks,report,output});
  if(!logoOnly&&!headerOnly&&!downloadsOnly&&!docsOnly&&!glassOnly&&!navigationOnly) await verifyLaunchUi({cdp,evaluate,load,viewport,media,waitFor,pause,url,checks});
  assert.deepEqual(errors,[],'No console/runtime/hydration errors');assert.deepEqual(missing,[],'No missing assets');assert.deepEqual(external,[],'No external requests');
  assert.deepEqual(warnings.filter(message=>/THREE\.Clock:|Reduced Motion enabled/.test(message)),[],'No deprecated Clock or reduced-motion hook warnings');
  const result={passed:true,browser:version.Browser,warnings,checks,exports:report,scope:process.env.LYMORA_TEST_URL?'Browser verification against the specified local server; software WebGL, not a hardware FPS benchmark.':'Actual static-export browser capture; software WebGL, not a hardware FPS benchmark.'};await fs.writeFile(path.join(output,logoOnly?'logo-ui-results.json':headerOnly?'header-ui-results.json':downloadsOnly?'downloads-ui-results.json':docsOnly?'documentation-ui-results.json':glassOnly?'glass-ui-results.json':navigationOnly?'navigation-ui-results.json':launchOnly?'launch-ui-results.json':'network-motion-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await send('Target.closeTarget',{targetId:target.targetId});await send('Browser.close');
} finally {
  if(socket)socket.close();for(const promise of pending.values()){clearTimeout(promise.timeout);promise.reject(Error('Browser closed'));}pending.clear();server.close();if(browser.exitCode===null)browser.kill();
}
