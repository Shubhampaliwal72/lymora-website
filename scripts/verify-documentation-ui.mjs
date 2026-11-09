/** Documentation-only browser checks; retain native reading and disclosure behavior. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function verifyDocumentationUi({cdp,evaluate,viewport,media,waitFor,pause,url,checks,output}) {
  const route='/products/lan-messenger/docs/';
  const open=async()=>{await cdp('Page.navigate',{url:url+route});await waitFor('location.pathname==='+JSON.stringify(route)+'&&document.readyState==="complete"&&!!document.querySelector(".docs-faq-search")','Hydrated documentation');await evaluate('document.fonts.ready');await evaluate('window.scrollTo({top:0,behavior:"instant"})');};
  const key=async(name,code)=>{await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:code,...(name==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:code});};
  const settle=async(index,expanded)=>waitFor('(()=>{const d=document.querySelectorAll(".docs-question")['+index+'];return d.open==='+expanded+'&&d.querySelector(".docs-question-answer").style.height===""})()','FAQ settles to '+expanded);
  const capture=async name=>{const png=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(output,'documentation-'+name+'.png'),Buffer.from(png.data,'base64'));};
  const search=async value=>{await evaluate('(()=>{const e=document.querySelector(".docs-faq-search input"),set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;set.call(e,'+JSON.stringify(value)+');e.dispatchEvent(new Event("input",{bubbles:true}))})()');await pause(150);};
  for(const [width,theme] of [[1440,'dark'],[1440,'light'],[375,'dark'],[320,'light']]) {
    await viewport(width,1000);await media(theme);await open();
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'No page overflow at '+width);
    assert.equal(await evaluate('document.querySelectorAll(".guide-steps>li").length'),5,'Five source-verified setup steps');
    assert.equal(await evaluate('document.querySelectorAll(".docs-nav a").length'),6,'All guide anchors preserved');
    assert.equal(await evaluate('document.querySelectorAll(".docs-question").length'),7,'All original questions preserved');
    assert.equal(await evaluate('document.querySelectorAll(".reveal-word").length'),0,'No global heading animation interferes with reading');
    await capture('guide-'+width+'-'+theme);
    await evaluate('[...document.querySelectorAll(".docs-nav a")].find(a=>a.hash==="#files").click()');
    await waitFor('document.querySelector(".docs-nav a[aria-current=location]")?.hash==="#files"','Section navigation still tracks files');
    await pause(800);
    assert(await evaluate('(()=>{const r=document.querySelector("#files").getBoundingClientRect(),h=document.querySelector(".header-inner").getBoundingClientRect();return r.top>=h.bottom&&r.top<innerHeight*.5})()'),'Anchor clears header');
    await evaluate('document.querySelector("#faq").scrollIntoView({block:"start",behavior:"instant"})');await pause(250);
    await evaluate('document.querySelector(".docs-question summary").focus()');await key('Enter',13);await settle(0,true);
    assert(await evaluate('(()=>{const a=document.querySelector(".docs-question-answer");return a.getBoundingClientRect().height>20&&a.scrollHeight<=a.clientHeight+1})()'),'Open answer is completely readable');
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".docs-question-toggle")).rotate'),'45deg','Control animates to its close state');
    await capture('faq-'+width+'-'+theme);
    await key('Enter',13);await pause(30);
    assert(await evaluate('document.querySelector(".docs-question").open'),'Closing retains the answer during its animation');await settle(0,false);
    for(let i=0;i<5;i++){await evaluate('document.querySelector(".docs-question summary").click()');await pause(40);}
    await settle(0,true);
    for(let i=0;i<4;i++){await evaluate('document.querySelector(".docs-question summary").click()');await pause(40);}
    await settle(0,true);
    await evaluate('document.querySelectorAll(".docs-question summary")[1].click()');await settle(1,true);
    assert.equal(await evaluate('document.querySelectorAll(".docs-question[open]").length'),2,'Multiple useful answers can stay open');
    await search('25 MiB');
    await waitFor('document.querySelectorAll(".docs-question").length===1','FAQ filters questions and answer text');
    assert(await evaluate('document.querySelector(".docs-question").textContent.includes("current code does not impose")'),'Verified attachment wording preserved');
    await search('xyz-no-such-answer');await waitFor('!!document.querySelector(".docs-faq-empty")','Helpful no-results state');
    await evaluate('document.querySelector(".docs-faq-empty button").click()');await waitFor('document.querySelectorAll(".docs-question").length===7','Reset restores all questions');
  }
  checks.push('both themes at 1440/375/320px; source information and six anchors preserved; animated keyboard open/close; answer containment; rapid reversal; multiple open answers; live search and reset');
  await viewport(1440,1000);await media('dark');await open();
  await evaluate('document.querySelector("#faq").scrollIntoView({block:"start",behavior:"instant"});document.querySelector(".docs-question summary").click()');await settle(0,true);
  await viewport(320,900);await pause(300);
  assert(await evaluate('(()=>{const a=document.querySelector(".docs-question-answer");return a.scrollHeight<=a.clientHeight+1})()'),'Open answer adapts to narrower text without clipped height');
  await cdp('Emulation.setScriptExecutionDisabled',{value:true});await cdp('Page.navigate',{url:url+route});await pause(700);
  assert.equal(await evaluate('document.querySelectorAll(".docs-question").length'),7,'Original FAQ remains in exported HTML without JavaScript');
  assert.equal(await evaluate('!!document.querySelector(".docs-faq-search")'),false,'No inactive search control without JavaScript');
  await evaluate('document.querySelector(".docs-question summary").click()');
  assert(await evaluate('document.querySelector(".docs-question").open&&document.querySelector(".docs-question-answer").getBoundingClientRect().height>20'),'Native disclosure works without JavaScript');
  await cdp('Emulation.setScriptExecutionDisabled',{value:false});
  checks.push('open answer reflows after resizing; no-JavaScript reading and native FAQ remain functional');
  await cdp('Page.navigate',{url:url+'/about/'});await waitFor('location.pathname==="/about/"&&!!document.querySelector("main h1")','Other route still loads');
  assert.equal(await evaluate('!!document.querySelector(".messenger-docs")'),false,'Guide styling and motion stay scoped to documentation');
  assert.equal(await evaluate('document.documentElement.dataset.motion'),'full','Shared brand motion policy remains enabled');
  checks.push('other route shell and existing brand motion policy preserved');
}
