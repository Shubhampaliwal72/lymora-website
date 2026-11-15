import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

/** Real production frames: composition, live movement, product continuity and fallbacks. */
export async function verifyImmersiveHero({cdp,evaluate,load,viewport,media,waitFor,pause,checks,output}) {
  const shot=async name=>{
    const png=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await fs.writeFile(path.join(output,'immersive-'+name+'.png'),Buffer.from(png.data,'base64'));
  };
  const top=async()=>{await evaluate('window.scrollTo({top:0,behavior:"instant"})');await pause(1000);};
  const scene=async()=>{
    await evaluate('document.querySelector("#network-preview").scrollIntoView({block:"center",behavior:"instant"})');
    await pause(1000);
  };
  const live=()=>waitFor('document.querySelector(".particle-backdrop").dataset.renderer==="webgl"','One shared renderer is live');
  await viewport(1440,1000);await load();
  if(await evaluate('matchMedia("(prefers-reduced-motion:reduce)").matches')) {
    assert.equal(await evaluate('!!document.querySelector("canvas")'),false,'Native reduced motion is static before opt-in');
  }
  await evaluate('localStorage.setItem("lymora-website-motion","full");localStorage.setItem("lymora-website-theme","dark")');
  await media('dark');await load();await live();await top();
  assert.equal(await evaluate('document.querySelectorAll("canvas").length'),1,'Ribbons and particles share one canvas');
  assert.equal(await evaluate('document.querySelectorAll("#the-app .living-network").length'),0,'PCs do not crowd the opening');
  assert(await evaluate('(()=>{const hero=document.querySelector("#the-app").getBoundingClientRect(),copy=document.querySelector(".cinematic-copy").getBoundingClientRect(),next=document.querySelector("#network-preview").getBoundingClientRect();return Math.abs(copy.left+copy.width/2-innerWidth/2)<1&&next.top>=hero.bottom-1&&getComputedStyle(document.querySelector("#hero-title")).textAlign==="center"})()'),'Centered brand opening precedes the complete product demo');
  const composition=await evaluate('(()=>{const s=document.querySelector(".particle-backdrop").style;return {x:parseFloat(s.getPropertyValue("--particle-x")),diameter:5.8*Math.min(innerWidth*.158,innerHeight*.153)*Number(s.getPropertyValue("--particle-scale"))/innerHeight,halo:Number(s.getPropertyValue("--halo-presence"))}})()');
  assert(Math.abs(composition.x-50)<.5&&composition.diameter>.76&&composition.diameter<.98&&composition.halo>.99,'The large centered scene occupies the planned hero height');
  assert(await evaluate('(()=>{const b=document.querySelector(".hero-actions .button-primary"),s=getComputedStyle(b),p=document.createElement("i");p.style.color="var(--accent)";document.body.append(p);const c=getComputedStyle(p).color;p.remove();return s.color===c&&parseFloat(s.borderRadius)>100&&s.backdropFilter.includes("blur")})()'),'Orange labels sit on rounded glossy glass');
  const angle=()=>evaluate('parseFloat(getComputedStyle(document.querySelector(".hero-actions .button-primary"),"::after").getPropertyValue("--edge-angle"))');
  const angleBefore=await angle();await pause(400);assert(await angle()<angleBefore,'Primary edge beam runs anticlockwise');
  await shot('hero-dark');
  const clip={x:220,y:180,width:290,height:220,scale:1};
  const before=await cdp('Page.captureScreenshot',{format:'png',clip});await pause(900);const after=await cdp('Page.captureScreenshot',{format:'png',clip});
  assert.notEqual(before.data,after.data,'The large 3D surface visibly moves before scrolling');
  await scene();await waitFor('document.querySelector(".living-network").dataset.mode==="3d"','Below-fold PC scene loads when visible');
  assert.equal(await evaluate('document.querySelectorAll("canvas").length'),1,'PC portal retains the single renderer');
  assert(await evaluate('(()=>{const w=document.querySelector(".network-world").getBoundingClientRect();return [...document.querySelectorAll(".network-device-label")].every(e=>{const r=e.getBoundingClientRect();return r.left>=w.left-.5&&r.right<=w.right+.5&&r.top>=w.top&&r.bottom<=w.bottom})})()'),'All three device labels remain contained');
  await evaluate('[...document.querySelectorAll("button")].find(e=>e.getAttribute("aria-label")==="Send preview to Team PC").click();[...document.querySelectorAll("button")].find(e=>e.getAttribute("aria-label")==="Send a file in the preview").click()');
  assert.equal(await evaluate('document.querySelector(".living-network").dataset.endpoint'),'team');
  assert.equal(await evaluate('document.querySelector(".living-network").dataset.transfer'),'file');await shot('network-dark');
  await evaluate('document.querySelector("#experience").scrollIntoView({block:"start",behavior:"instant"})');await pause(1000);
  assert.equal(await evaluate('document.querySelectorAll("#experience [role=tab]").length'),4);
  await shot('product-dark');
  await evaluate('document.querySelector("#together").scrollIntoView({block:"center",behavior:"instant"})');await pause(1000);
  const middle=await evaluate('Number(document.querySelector(".particle-backdrop").dataset.progress)');
  await top();assert(await evaluate('Number(document.querySelector(".particle-backdrop").dataset.progress)')<middle,'Scrolling upward reverses the morph and restores the centered opening');
  checks.push('centered large 3D opening; actual moving surface pixels; orange-text rounded glass CTAs; anticlockwise edge; preserved below-fold PC interactions; one shared renderer; reverse morph');
  await evaluate('document.querySelector(".theme-toggle").click()');await pause(400);await shot('hero-light');
  await scene();await shot('network-light');await top();
  for(const [width,height] of [[320,844],[375,844],[768,1000],[1440,700],[1920,1080],[3840,1000]]) {
    await viewport(width,height);await load();await top();
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'No horizontal overflow at '+width);
    assert(await evaluate('(()=>{const a=document.querySelector(".hero-actions").getBoundingClientRect(),h=document.querySelector(".header-inner").getBoundingClientRect(),c=document.querySelector(".cinematic-caption").getBoundingClientRect();return a.top>h.bottom&&a.bottom<c.top})()'),'Hero controls have their own readable space at '+width);
    if(width<=768)assert.equal(await evaluate('!!document.querySelector("canvas")'),false,'Small screens avoid WebGL');
    if(width===375||width===1920||width===3840)await shot('hero-'+width);
  }
  await viewport(1440,1000);await load();await top();
  await evaluate('document.querySelector(".header-download").click()');await waitFor('location.pathname==="/downloads/"','Header CTA keeps Downloads destination');
  await evaluate('history.back()');await waitFor('location.pathname==="/"&&!!document.querySelector(".cinematic-hero")','History restores centered homepage');await pause(800);
  await evaluate('localStorage.removeItem("lymora-website-motion")');await media('light',true);await load();
  assert.equal(await evaluate('!!document.querySelector("canvas")'),false,'Reduced motion skips GPU');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".particle-fallback-cloud")).animationName'),'none');
  assert(await evaluate('getComputedStyle(document.querySelector("#hero-title")).opacity==="1"'),'Static heading remains visible');await shot('reduced-motion');
  await evaluate('document.querySelector(".ambience-control").click()');await live();
  await evaluate('document.querySelector("canvas").getContext("webgl2").getExtension("WEBGL_lose_context").loseContext()');
  await waitFor('!document.querySelector("canvas")&&document.querySelector(".particle-backdrop").dataset.renderer==="svg"','GPU failure restores the shared SVG composition');await shot('gpu-fallback');
  checks.push('desktop/mobile/short/ultrawide containment; both themes; history and Downloads; device reduced motion; explicit Play; WebGL loss fallback');
}
