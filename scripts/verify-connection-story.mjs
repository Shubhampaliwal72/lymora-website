/** Static-export checks for the native-scroll three-step PC story. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function verifyConnectionStory({cdp,evaluate,load,viewport,media,waitFor,pause,url,checks,output}) {
 const capture=async name=>{const image=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(output,'connection-story-'+name+'.png'),Buffer.from(image.data,'base64'));};
 for(const theme of ['dark','light']) {
  await viewport(1440,1000);await media(theme,false);await load();await pause(700);
  assert.equal(await evaluate('document.querySelectorAll(".connection-step").length'),3,'All three story steps are in the document');
  assert.equal(await evaluate('document.querySelectorAll(".pc-monitor").length'),2,'Two PC displays illustrate the LAN connection');
  assert.equal(await evaluate('document.querySelectorAll(".pin-spacer").length'),0,'The experience retains native scrolling');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".connection-device-scene")).position'),'sticky','The 3D PC scene holds beside the vertical story on desktop');
  let previousTransform='';
  for(const index of [0,1,2,1,0]) {
   await evaluate('(()=>{const e=document.querySelectorAll(".connection-step")['+index+'],r=e.getBoundingClientRect();window.scrollTo({top:scrollY+r.top+r.height/2-innerHeight*.6,behavior:"instant"})})()');
   await waitFor('document.querySelector(".setup-connection-story").dataset.activeStep==="'+index+'"','Active step follows native scroll in either direction');
   assert.equal(await evaluate('document.querySelectorAll(".connection-step[aria-current=step]").length'),1,'Exactly one current step is exposed to assistive technology');
   assert.equal(await evaluate('document.querySelector(".connection-device-scene").dataset.activeStep'),String(index),'PC scene tracks the active story step');
   const transform=await evaluate('getComputedStyle(document.querySelector(".pc-monitor-peer")).transform');
   if(index===2)await capture('step-3-'+theme);
   previousTransform=transform;
  }
  assert(previousTransform && previousTransform!=='none','The monitor is composed with CSS perspective');
  await evaluate('document.querySelectorAll("[data-story-go]")[2].click()');
  await waitFor('document.querySelector(".setup-connection-story").dataset.activeStep==="2"','Step control scrolls to the selected native section');
  assert.equal(await evaluate('document.querySelectorAll(".pin-spacer").length'),0,'Step selection does not create a pinned scroll trap');
  await evaluate('document.querySelector(".connection-story-exit").click()');await pause(800);
  assert(await evaluate('location.hash==="#together"'),'The continue link keeps working');
  checks.push(theme+': native scroll step progression and reversal, sticky 3D PCs, accessible state, direct step navigation, no pinned scroll trap');
 }
 for(const width of [320,375,680,768]) {
  await viewport(width,850);await media('light',false);await load();await pause(500);
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Story has no horizontal overflow at '+width+'px');
  assert.equal(await evaluate('document.querySelectorAll(".connection-step").length'),3,'All copy remains available at '+width+'px');
  if(width<=680)assert.notEqual(await evaluate('getComputedStyle(document.querySelector(".connection-device-scene")).position'),'sticky','Small screens use a static PC scene');
  await evaluate('document.querySelectorAll(".connection-step")[2].scrollIntoView({block:"center",behavior:"instant"})');await pause(150);
  await capture('mobile-'+width);
 }
 await viewport(1440,1000);await media('dark',true);await load();await pause(400);
 assert(await evaluate('[...document.querySelectorAll(".connection-step")].every(e=>Number(getComputedStyle(e).opacity)===1)'),'Reduced motion leaves every step visible');
 assert.equal(await evaluate('document.querySelectorAll(".pin-spacer").length'),0,'Reduced motion has no pinned motion structure');
 await cdp('Emulation.setScriptExecutionDisabled',{value:true});await cdp('Page.navigate',{url:url+'/'});await pause(1200);
 const documentTree=await cdp('DOM.getDocument',{depth:0});const html=await cdp('DOM.getOuterHTML',{nodeId:documentTree.root.nodeId});
 assert(html.outerHTML.includes('Install on both PCs.')&&html.outerHTML.includes('Discover nearby devices.')&&html.outerHTML.includes('Start the conversation.')&&html.outerHTML.includes('pc-monitor'),'Server HTML keeps the PC scene and all story copy without JavaScript');
 await cdp('Emulation.setScriptExecutionDisabled',{value:false});
 checks.push('320–768px responsive reading flow; reduced motion; server-rendered fallback without JavaScript');
}
