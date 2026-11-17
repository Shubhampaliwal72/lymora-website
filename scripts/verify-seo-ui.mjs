/** SEO/performance regressions in the existing loopback-only browser harness. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
export async function verifySeoUi({cdp,evaluate,viewport,media,waitFor,pause,url,checks,report,requests,output}) {
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:"window.__seo={shifts:[],lcp:0};new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.__seo.shifts.push({t:e.startTime,value:e.value})})).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__seo.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true});"});
  const navigate=async route=>{
    await evaluate("document.documentElement.dataset.qaDeparting='true'");
    await cdp('Page.navigate',{url:url+route});
    await waitFor("document.readyState==='complete'&&!document.documentElement.dataset.qaDeparting&&location.pathname==="+JSON.stringify(route),'SEO page loads: '+route);
    await evaluate('document.fonts.ready');await pause(500);
  };
  const state=()=>evaluate("(()=>{let max=0,total=0,first=0,last=0;for(const e of window.__seo?.shifts??[]){if(e.t-last>1000||e.t-first>5000){total=0;first=e.t}total+=e.value;last=e.t;max=Math.max(max,total)}const h=document.querySelector('h1');return {title:document.title,overflow:document.documentElement.scrollWidth>innerWidth+1,h1:!!h&&getComputedStyle(h).visibility!=='hidden'&&getComputedStyle(h).opacity!=='0',cls:max,lcp:window.__seo?.lcp,canvas:document.querySelectorAll('canvas').length}})()");
  await viewport(1440,1000);await media('light',true);await navigate('/');
  await evaluate("localStorage.removeItem('lymora-website-theme');localStorage.removeItem('lymora-website-motion')");
  const routes=['/','/downloads/','/products/','/products/lan-messenger/','/products/lan-messenger/docs/','/about/','/privacy/'];
  for(const width of [320,390,1440]){
    await viewport(width,width<600?844:1000);
    for(const route of routes){await navigate(route);const s=await state();assert(s.h1,'Visible H1: '+route);assert(!s.overflow,'No overflow: '+route+' at '+width);assert(s.title.includes('Lymora'),'Branded title: '+route);report.push({route,width,...s});}
  }
  for(const reduced of [false,true]){
    await viewport(1440,1000);await media('light',reduced);await navigate('/downloads/');await pause(2000);
    const s=await state();assert(s.cls<.02,'Downloads fallback does not shift layout: '+JSON.stringify(s));
    await evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");await pause(650);
    const after=await state();assert(after.cls<.02,'Fallback scrolling uses transforms: '+JSON.stringify(after));
    report.push({route:'/downloads/',reduced,...after});
    const image=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(output,'seo-downloads-'+(reduced?'static':'live')+'.png'),Buffer.from(image.data,'base64'));
  }
  for(const theme of ['light','dark']){
    await viewport(390,844);await media(theme,true);const start=requests.length;await navigate('/');
    await evaluate("document.querySelector('.theme-screenshot').scrollIntoView({behavior:'instant',block:'center'})");
    await waitFor("(()=>{const i=document.querySelector('.theme-screenshot img');return i.complete&&i.naturalWidth>0})()",'Screenshot loads');
    assert((await evaluate("document.querySelector('.theme-screenshot img').currentSrc")).endsWith('chats-'+theme+'.png'),'System-theme image selected');
    const images=new Set(requests.slice(start).filter(r=>/\/media\/product\/chats-(dark|light)\.png/.test(r)));
    assert.equal(images.size,1,'Only one screenshot theme requested: '+JSON.stringify([...images]));
    await evaluate("document.querySelector('.theme-toggle').click()");
    await waitFor("document.querySelector('.theme-screenshot img').currentSrc.endsWith('chats-"+(theme==='dark'?'light':'dark')+".png')",'Saved theme updates picture');
    await evaluate("localStorage.removeItem('lymora-website-theme')");
    report.push({theme,firstScreenshotRequests:images.size});
  }
  await media('light',true);await viewport(390,844);await navigate('/');
  await cdp('Emulation.setScriptExecutionDisabled',{value:true});
  for(const route of ['/','/downloads/','/products/lan-messenger/docs/']){
    await navigate(route);assert((await state()).h1,'Copy visible without JavaScript');
    const image=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(output,'seo-no-js-'+(route==='/'?'home':route.includes('docs')?'docs':'downloads')+'.png'),Buffer.from(image.data,'base64'));
  }
  await cdp('Emulation.setScriptExecutionDisabled',{value:false});
  checks.push('seven routes at 320/390/1440; visible HTML and branded metadata; Downloads CLS below 0.02 with live/static backdrop; one screenshot theme per default load; saved theme switching; no-JS Home/Downloads/Docs');
}
