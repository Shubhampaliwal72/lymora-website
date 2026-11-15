/** Actual export: reversible desktop story, static mobile and accessible exits. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
export async function verifyConnectionStory({cdp,evaluate,load,viewport,media,waitFor,pause,url,checks,output}) {
 const capture=async name=>{const image=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(output,'connection-story-'+name+'.png'),Buffer.from(image.data,'base64'));};
 const go=async p=>{
   await evaluate('(()=>{const s=document.querySelector(".connection-chapter-stage"),r=s.parentElement.getBoundingClientRect();window.scrollTo({top:scrollY+r.top-(document.querySelector(".header-inner").getBoundingClientRect().bottom+20)+innerHeight*1.8*'+p+',behavior:"instant"})})()');
   await pause(700);
   for(let i=0;i<4;i++) {
    const actual=await evaluate('Number(document.querySelector(".setup-connection-story").style.getPropertyValue("--story-progress"))');
    if(Math.abs(actual-p)<.008)break;
    await evaluate('scrollBy({top:innerHeight*1.8*('+p+'-'+actual+'),behavior:"instant"})');await pause(600);
   }
 };
 for(const theme of ['dark','light']) {
   await viewport(1440,1000);await media(theme,false);await load();
   await evaluate('document.documentElement.dataset.qaDeparting="true";localStorage.setItem("lymora-website-motion","full");location.reload()');
   await waitFor('!document.documentElement.dataset.qaDeparting&&document.querySelector(".setup-connection-story")?.dataset.storyMode==="cinematic"','Desktop story initializes');
   await pause(1000);
   const routePosition=await evaluate('getComputedStyle(document.querySelector(".connection-route")).position');
   assert(['static','relative'].includes(routePosition),'The original route diagram remains in document flow');
   let previousShape='';
   for(const [p,step] of [[.12,0],[.5,1],[.9,2],[.5,1],[.12,0]]) {
    await go(p);
    await waitFor('document.querySelector(".setup-connection-story").dataset.activeStep==="'+step+'"','Step follows scroll in both directions');
    assert.equal(await evaluate('document.querySelectorAll(".connection-step[aria-current=step]").length'),1);
    const panel=await evaluate('(()=>{const e=document.querySelectorAll(".connection-step")['+step+'],r=e.getBoundingClientRect(),s=getComputedStyle(e),h=document.querySelector(".header-inner").getBoundingClientRect();return {opacity:Number(s.opacity),top:r.top,bottom:r.bottom,header:h.bottom,height:innerHeight}})()');
    assert(panel.opacity>.99&&panel.top>panel.header&&panel.bottom<panel.height,'Current text stays completely visible under the header');
    const scene=await evaluate('document.querySelector(".connection-network-person:nth-of-type(3)").getAttribute("d")');
    if(previousShape)assert.notEqual(scene,previousShape,'Human point surface changes perspective with progress');previousShape=scene;
    assert(await evaluate('(()=>{const s=getComputedStyle(document.querySelector(".connection-diagram"));return Number(s.getPropertyValue("--connection-left"))>.99&&Number(s.getPropertyValue("--connection-right"))>.99})()'),'Diagram wires are complete before the pinned story');
    if(p===.5)await capture('discover-'+theme);
    if(p===.9) {
      assert(await evaluate('Number(document.querySelector("[data-connection-network-packet]").getAttribute("opacity"))===1'),'Message packet is visible at delivery');
      await capture('connect-'+theme);
    }
   }
   await evaluate('document.querySelectorAll("[data-story-go]")[2].focus()');
   await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});
   await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
   await waitFor('document.querySelector(".setup-connection-story").dataset.activeStep==="2"','Keyboard step selection advances the native page scroll');
   await evaluate('document.querySelector(".connection-story-exit").click()');await pause(1300);
   assert(await evaluate('location.hash==="#together"&&document.querySelector("#together").getBoundingClientRect().top<innerHeight*.6'),'Native skip exits to the next chapter');
   await go(.5);
   await evaluate('document.querySelector(".ambience-control").click()');await pause(600);
   assert.equal(await evaluate('document.querySelector(".setup-connection-story").dataset.storyMode??"static"'),'static','Pausing releases the stage');
   assert(await evaluate('[...document.querySelectorAll(".connection-step")].every(e=>getComputedStyle(e).visibility!=="hidden"&&Number(getComputedStyle(e).opacity)===1)'),'All three steps stay visible after pause');
   assert.equal(await evaluate('document.querySelectorAll(".pin-spacer").length'),0,'Pin spacer is removed on pause');
   await evaluate('document.querySelector(".ambience-control").click()');
   await waitFor('document.querySelector(".setup-connection-story").dataset.storyMode==="cinematic"','Resume rebuilds the story');
   assert.equal(await evaluate('document.querySelectorAll(".pin-spacer").length'),1,'Resume does not duplicate pins');
   assert((await evaluate('document.querySelectorAll("canvas").length'))<=1,'No extra WebGL canvas');
   // Client navigation must clean up the scoped pin and restore it exactly once.
   await go(.5);
   await evaluate('[...document.querySelectorAll(".desktop-nav a")].find(a=>a.pathname==="/downloads/").click()');
   await waitFor('location.pathname==="/downloads/"&&!document.querySelector(".connection-chapter-stage")','Downloads route loads');
   assert.equal(await evaluate('document.querySelectorAll(".pin-spacer").length'),0,'Route exit removes the pin');
   const history=await cdp('Page.getNavigationHistory');
   const previous=history.entries.slice(0,history.currentIndex).reverse().find(entry=>new URL(entry.url).pathname==='/');
   assert(previous,'A homepage history entry exists');
   await evaluate('history.back()');
   await waitFor('location.pathname==="/"&&document.querySelector(".setup-connection-story")?.dataset.storyMode==="cinematic"','Browser Back restores chapter');await pause(800);
   assert.equal(await evaluate('document.querySelectorAll(".pin-spacer").length'),1,'Back restores one scoped pin');
   checks.push(theme+': three readable scroll holds, reverse, perspective, message delivery, normal route bar, keyboard choice, section exit, pause/resume and route/Back cleanup');
 }
 for(const width of [320,375,768]) {
  await viewport(width,850);await media('light',false);await load();await pause(800);
  assert.equal(await evaluate('document.querySelector(".setup-connection-story").dataset.storyMode??"static"'),'static');
  assert.equal(await evaluate('document.querySelectorAll(".pin-spacer").length'),0);
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Mobile has no horizontal overflow');
  for(let i=0;i<3;i++) {
   await evaluate('document.querySelectorAll(".connection-step")['+i+'].scrollIntoView({block:"center",behavior:"instant"})');await pause(150);
   assert(await evaluate('(()=>{const r=document.querySelectorAll(".connection-step")['+i+'].getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()'),'Mobile step fits in viewport');
  }
  await evaluate('document.querySelector(".connection-network-figure").scrollIntoView({block:"center",behavior:"instant"})');await pause(200);await capture('mobile-'+width);
 }
 await viewport(1440,1000);await media('dark',true);await load();
 await evaluate('localStorage.removeItem("lymora-website-motion");location.reload()');
 await waitFor('document.querySelector(".setup-connection-story")&&document.documentElement.dataset.motion==="reduced"','Reduced motion initializes');await pause(300);
 assert.equal(await evaluate('document.querySelectorAll(".pin-spacer").length'),0);
 assert(await evaluate('[...document.querySelectorAll(".connection-step")].every(e=>Number(getComputedStyle(e).opacity)===1)'),'Reduced motion reveals all steps');
 await cdp('Emulation.setScriptExecutionDisabled',{value:true});
 await cdp('Page.navigate',{url:url+'/'});await pause(1600);
 const noScript=await cdp('DOM.getDocument',{depth:0});const html=await cdp('DOM.getOuterHTML',{nodeId:noScript.root.nodeId});
 assert(html.outerHTML.includes('Install on both PCs.')&&html.outerHTML.includes('Discover nearby devices.')&&html.outerHTML.includes('Start the conversation.')&&html.outerHTML.includes('connection-network-person warm'),'Server HTML contains all steps and the human illustration');
 await cdp('Emulation.setScriptExecutionDisabled',{value:false});
 checks.push('320/375/768px static flow; no overflow or pin; reduced motion and no-JavaScript HTML keep all steps and the original illustration');
}
