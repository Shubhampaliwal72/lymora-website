/** Measure natural CSS playback across two cycles, without hover or timeline seeking. */
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function verifyLogoUi({cdp,evaluate,viewport,media,waitFor,pause,url,checks,output}) {
  const nativeReducedMotion=await evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches');
  const results=[];
  for(const [width,theme,reduced] of [[1440,'dark',false],[1440,'light',false],[1440,'dark',true],[1440,'light',true],[375,'dark',false],[320,'light',true]]) {
    await viewport(width,900);await media(theme,reduced);
    await evaluate('try{localStorage.removeItem("lymora-website-theme")}catch{}document.documentElement.dataset.qaDeparting="true"');
    const home=width===1440&&theme==='dark'&&!reduced;
    await cdp('Page.navigate',{url:url+(home?'/':'/about/')});
    await waitFor('document.readyState==="complete"&&!document.documentElement.dataset.qaDeparting&&document.querySelector(".site-header .brand-symbol")?.dataset.live==="true"','Automatic logo starts after hydration');
    await evaluate('document.fonts.ready;window.scrollTo({top:0,behavior:"instant"})');await pause(100);
    if(home)await waitFor('document.querySelector(".living-network")?.dataset.mode==="3d"','Stable Three.js scene initializes with Timer compatibility');
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:width-3,y:850});
    const samples=await evaluate("new Promise(resolve=>{const element=document.querySelector('.site-header .brand-symbol'),copy=document.querySelector('.brand-copy');const animation=element.getAnimations().find(a=>a.animationName==='brand-symbol-live');const initial=copy.getBoundingClientRect(),rows=[],start=performance.now();const sample=()=>{const style=getComputedStyle(element),matrix=new DOMMatrixReadOnly(style.transform),r=copy.getBoundingClientRect();rows.push({time:performance.now()-start,m11:matrix.m11,m13:matrix.m13,m22:matrix.m22,m41:matrix.m41,m42:matrix.m42,iteration:animation.effect.getComputedTiming().currentIteration,progress:animation.effect.getComputedTiming().progress,reflection:Number(getComputedStyle(element,'::after').opacity),textDelta:Math.max(Math.abs(r.x-initial.x),Math.abs(r.y-initial.y),Math.abs(r.width-initial.width),Math.abs(r.height-initial.height)),state:style.animationPlayState});if(performance.now()-start<Number(animation.effect.getTiming().duration)+1300)setTimeout(sample,75);else resolve(rows);};sample();})");
    const debug=await evaluate('(()=>{const e=document.querySelector(".site-header .brand-symbol"),s=getComputedStyle(e);return {root:document.documentElement.dataset,symbol:e.dataset,hidden:document.hidden,rect:e.getBoundingClientRect().toJSON(),animation:s.animation,play:s.animationPlayState,transform:s.transform,animations:e.getAnimations().map(a=>({name:a.animationName,current:a.currentTime,state:a.playState,timing:a.effect.getComputedTiming(),frames:a.effect.getKeyframes()}))}})()');
    await writeFile(path.join(output,'logo-last-probe.json'),JSON.stringify({width,theme,reduced,debug,samples},null,2));
    const rotations=samples.map(s=>s.m11),iterations=samples.map(s=>s.iteration);
    assert(Math.max(...rotations)-Math.min(...rotations)>.6,'Symbol visibly rotates without any hover: '+theme+'/'+width+'/'+reduced);
    assert(Math.max(...iterations)>Math.min(...iterations),'Logo repeats automatically in a second cycle');
    assert(samples.every(s=>s.textDelta<.1),'Wordmark and tagline remain stationary in every sample');
    assert(samples.some(s=>Math.abs(s.m11-1)<.005&&Math.abs(s.m13)<.08&&Math.abs(s.m22-1)<.001&&Math.abs(s.m41)<.001&&Math.abs(s.m42)<.001),'Symbol returns to its original orientation on each revolution');
    assert(samples.some(s=>s.reflection>.1),'Masked light reflection plays in the same cycle');
    assert(samples.every(s=>s.state==='running'),'Logo animation is not suppressed by OS preference or viewport size');
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Logo never causes horizontal overflow');
    const result={width,theme,reduced,samples:samples.length,rotationRange:[Math.min(...rotations),Math.max(...rotations)],iterations:[Math.min(...iterations),Math.max(...iterations)],maxTextMovement:Math.max(...samples.map(s=>s.textDelta))};
    results.push(result);
    await writeFile(path.join(output,'logo-live-'+width+'-'+theme+'-'+(reduced?'reduced':'full')+'.json'),JSON.stringify({result,samples},null,2));
    const bounds=await evaluate('(()=>{const r=document.querySelector(".header-inner").getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()');
    const png=await cdp('Page.captureScreenshot',{format:'png',clip:{...bounds,scale:1},captureBeyondViewport:false});
    await writeFile(path.join(output,'logo-live-'+width+'-'+theme+'-'+(reduced?'reduced':'full')+'.png'),Buffer.from(png.data,'base64'));
  }
  await evaluate('document.querySelector(".ambience-control").click()');
  await waitFor('getComputedStyle(document.querySelector(".site-header .brand-symbol")).animationPlayState==="paused"','Existing Pause ambience also pauses the logo');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".site-header .brand-symbol"),"::after").animationPlayState'),'paused','Reflection pauses together with symbol');
  const frozen=await evaluate('document.querySelector(".site-header .brand-symbol").getAnimations()[0].currentTime');await pause(250);
  assert(Math.abs(await evaluate('document.querySelector(".site-header .brand-symbol").getAnimations()[0].currentTime')-frozen)<.1,'Manual pause holds the animation time');
  await evaluate('document.querySelector(".ambience-control").click()');
  await waitFor('getComputedStyle(document.querySelector(".site-header .brand-symbol")).animationPlayState==="running"','Resume ambience resumes the logo');
  await evaluate('Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});document.dispatchEvent(new Event("visibilitychange"))');
  await waitFor('getComputedStyle(document.querySelector(".site-header .brand-symbol")).animationPlayState==="paused"','Hidden document suspends logo animation');
  await evaluate('delete document.hidden;document.dispatchEvent(new Event("visibilitychange"))');
  await waitFor('getComputedStyle(document.querySelector(".site-header .brand-symbol")).animationPlayState==="running"','Visible document resumes logo animation');
  await evaluate('document.querySelector(".site-header").style.position="relative";window.scrollTo({top:700,behavior:"instant"})');
  await waitFor('document.querySelector(".site-header .brand-symbol").dataset.paused==="true"','Offscreen logo suspends its animation');
  await evaluate('document.querySelector(".site-header").style.removeProperty("position");window.scrollTo({top:0,behavior:"instant"})');
  await waitFor('document.querySelector(".site-header .brand-symbol").dataset.paused==="false"','Onscreen logo resumes');
  await writeFile(path.join(output,'logo-live-measurements.json'),JSON.stringify({nativeReducedMotion,results},null,2));
  checks.push('Natural automatic logo playback over two iterations in both themes and both OS motion modes, 320/375/1440px; measured rotation, return to original orientation, reflection and zero text movement');
  checks.push('Existing Pause/Resume ambience controls both logo and reflection; simulated visibility and actual offscreen suspension/resumption; no hover or timeline manipulation required');
}
