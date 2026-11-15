/** Shared background regression checks against the actual static export. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
export async function verifyParticlesUi({cdp,evaluate,load,viewport,media,waitFor,pause,url,checks,output}) {
 const shot=async name=>{const image=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(output,name+'.png'),Buffer.from(image.data,'base64'));};
 // First reproduce the real device setting. Do not force no-preference before this check.
 await viewport(1510,726,1.25);await load();
 const nativeReduce=await evaluate("matchMedia('(prefers-reduced-motion:reduce)').matches");
 if(nativeReduce){
   assert.equal(await evaluate("document.querySelector('.particle-backdrop').dataset.motion"),'static');
   assert.equal(await evaluate("!!document.querySelector('canvas')"),false,'Device reduced motion initially stays static');
 }
 assert(await evaluate("document.querySelector('.particle-fallback-cloud').children.length<20"),'Dense fallback uses a few paths, not thousands of DOM nodes');
 assert(await evaluate("(()=>{const a=document.querySelector('.ambience-control').getBoundingClientRect(),b=document.querySelector('.hero-copy .button-primary').getBoundingClientRect();return a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom})()"),'Animation control does not cover the primary hero action at Windows 125% scaling');
 await shot('particles-device-default');
 if(await evaluate("document.documentElement.dataset.motion==='full'")){
   await evaluate("document.querySelector('.ambience-control').click()");
   await waitFor("document.documentElement.dataset.motion==='reduced'",'Pause chooses static mode');
 }
 await evaluate("document.querySelector('[aria-label=\"Play animations\"]').click()");
 await waitFor("document.querySelector('.particle-backdrop').dataset.renderer==='webgl'",'Site-only Play starts WebGL using the actual device preference');
 assert.equal(await evaluate("matchMedia('(prefers-reduced-motion:reduce)').matches"),nativeReduce,'Windows preference is unchanged');
 const clip={x:547,y:127,width:396,height:145,scale:1};
 const pixelsBefore=await cdp('Page.captureScreenshot',{format:'png',clip});await pause(800);
 const pixelsAfter=await cdp('Page.captureScreenshot',{format:'png',clip});
 assert.notEqual(pixelsAfter.data,pixelsBefore.data,'Actual background pixels change, not only a frame counter');
 await shot('particles-device-live');
 await load();
 await waitFor("document.querySelector('.particle-backdrop').dataset.renderer==='webgl'",'Saved site preference survives reload');
 assert.equal(await evaluate("localStorage.getItem('lymora-website-motion')"),'full');
 if(process.env.LYMORA_TEST_URL){
   const file=path.resolve('src/components/animations/ParticleBackdrop.tsx');
   const original=await fs.readFile(file,'utf8'),probe=original+'\n// Local development refresh verification.\n';
   try {
     await fs.writeFile(file,probe);await pause(1800);
     await waitFor("document.querySelector('.particle-backdrop')?.dataset.renderer==='webgl'&&document.querySelector('.living-network')?.dataset.mode==='3d'",'Live scene survives Fast Refresh');
     const frame=await evaluate("Number(document.querySelector('canvas').dataset.frames)");await pause(600);
     assert(await evaluate("Number(document.querySelector('canvas').dataset.frames)")>frame,'Animation continues after a source edit');
   } finally {
     if(await fs.readFile(file,'utf8')!==probe)throw Error('Source changed during QA; newer work preserved');
     await fs.writeFile(file,original);
   }
   await pause(1500);await waitFor("document.querySelector('.particle-backdrop')?.dataset.renderer==='webgl'",'Scene survives source restoration');
   checks.push('development Fast Refresh preserves live rendering after a source edit and restoration');
 }
 checks.push('real device motion preference; explicit Play without changing Windows; changing background pixels; saved choice survives reload');
 await viewport(1440,1000);await media('dark');await load();
 await evaluate("document.documentElement.dataset.theme='dark'");
 await waitFor("document.querySelector('.particle-backdrop').dataset.renderer==='webgl'",'Shared particle renderer starts');
 await waitFor("document.querySelector('.living-network').dataset.mode==='3d'",'Existing hero shares renderer');
 assert.equal(await evaluate("document.querySelectorAll('canvas').length"),1,'Only one WebGL canvas');
 const frames=()=>evaluate("Number(document.querySelector('canvas')?.dataset.frames||0)");
 const first=await frames();await pause(450);assert(await frames()>first,'Particles remain alive at rest');
 await shot('particles-home-dark');
 await evaluate("window.scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*.55,behavior:'instant'})");await pause(1500);
 const middle=await evaluate("Number(document.querySelector('.particle-backdrop').dataset.progress)");assert(middle>.45&&middle<.65,'Scroll morph reaches orb');
 await shot('particles-home-orb');
 await evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");await pause(1500);
 await waitFor("Number(document.querySelector('.particle-backdrop').dataset.progress)>.97",'Scroll morph reaches galaxy');await shot('particles-home-galaxy');
 await evaluate("window.scrollTo({top:0,behavior:'instant'})");await pause(1500);
 assert(await evaluate("Number(document.querySelector('.particle-backdrop').dataset.progress)")<.03,'Morph reverses to ring');
 await evaluate("document.querySelector('.ambience-control').click()");
 await waitFor("!document.querySelector('canvas')&&document.documentElement.dataset.motion==='reduced'",'Pause stops expensive rendering');
 assert.equal(await evaluate("getComputedStyle(document.querySelector('.particle-fallback-cloud')).animationName"),'none','Paused fallback is static');
 await evaluate("document.querySelector('[aria-label=\"Play animations\"]').click()");
 await waitFor("document.querySelector('.particle-backdrop').dataset.renderer==='webgl'",'Play restarts the live background');
 checks.push('one shared canvas; live movement at rest; scroll ring/orb/galaxy and reverse; manual pause/resume');
 await evaluate("localStorage.removeItem('lymora-website-motion');window.dispatchEvent(new StorageEvent('storage',{key:'lymora-website-motion'}))");
 await media('dark',true);await waitFor("!document.querySelector('canvas')",'Reduced motion skips WebGL');
 assert.equal(await evaluate("document.querySelector('.particle-backdrop').dataset.motion"),'static');
 assert.equal(await evaluate("getComputedStyle(document.querySelector('.particle-fallback-cloud')).animationName"),'none');
 await shot('particles-reduced-motion');
 await media('dark');await waitFor("document.querySelector('.particle-backdrop').dataset.renderer==='webgl'",'Motion preference recovers renderer');
 await evaluate("document.documentElement.dataset.theme='light'");await pause(500);await shot('particles-home-light');
 await cdp('Page.navigate',{url:url+'/downloads/'});
 await waitFor("document.readyState==='complete'&&document.querySelector('.particle-backdrop')?.dataset.route==='/downloads/'",'Direct Downloads initializes backdrop');
 await waitFor("document.querySelector('.particle-backdrop').dataset.renderer==='webgl'",'Downloads WebGL starts');
 assert.equal(await evaluate("document.querySelectorAll('canvas').length"),1);
 await evaluate("document.documentElement.dataset.theme='dark';window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");await pause(1500);await shot('particles-downloads-dark');
 await evaluate("window.scrollTo({top:0,behavior:'instant'})");await pause(1200);
 await evaluate("document.documentElement.dataset.theme='light'");await pause(400);await shot('particles-downloads-light');
 await viewport(390,844);await pause(800);
 assert.equal(await evaluate("!!document.querySelector('canvas')"),false,'Mobile skips heavy renderer');
 assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"),true,'Mobile fits viewport');
 await shot('particles-mobile');
 checks.push('dark/light homepage and Downloads; direct nested route; mobile SVG; static reduced motion and recovery');
 await viewport(1440,1000);await media('dark');await load();
 await waitFor("document.querySelector('.particle-backdrop').dataset.renderer==='webgl'",'Renderer recovers after mobile');
 await evaluate("document.querySelector('.header-download').click()");
 await waitFor("location.pathname==='/downloads/'&&document.querySelector('.particle-backdrop').dataset.route==='/downloads/'",'Downloads client navigation updates shared background');
 await evaluate("history.back()");
 await waitFor("location.pathname==='/'&&document.querySelector('.living-network')?.dataset.mode==='3d'",'History restores hero');
 await waitFor("document.querySelectorAll('canvas').length===1",'History preserves one renderer');
 checks.push('client navigation and browser history preserve the shared renderer and restore the product scene');
 await evaluate("document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()");
 await waitFor("document.querySelector('.particle-backdrop').dataset.renderer==='svg'&&!document.querySelector('canvas')",'GPU loss reveals fallback');
 assert.equal(await evaluate("document.querySelector('.living-network').dataset.mode"),'illustrated');
 await shot('particles-gpu-fallback');
 checks.push('WebGL context loss restores static/SVG hero and background without hiding copy or controls');
}
