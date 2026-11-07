/** Additional launch UI checks, using the existing local browser harness. */
import assert from 'node:assert/strict';
import { verifyTopologyUi } from './verify-topology-ui.mjs';
export async function verifyLaunchUi({cdp,evaluate,load,viewport,media,waitFor,pause,url,checks}) {
  await verifyTopologyUi({cdp,evaluate,load,viewport,media,waitFor,pause,checks});
  const key=async (name,code)=>{await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:code,...(name==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:code});};
  for(const [width,theme] of [[1440,'dark'],[375,'light']]) {
    await viewport(width,1000);await media(theme);await load();
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'No overflow');
    assert.equal(await evaluate(`document.querySelector('.desktop-nav > a[href="/"]').getAttribute('aria-current')`),'page','Home is current');
    await evaluate(`document.querySelector('#experience .screenshot-trigger').scrollIntoView({block:'center',behavior:'instant'})`);await pause(1300);
    await evaluate(`document.querySelector('#experience .screenshot-trigger').focus()`);
    await key('Enter',13);
    await waitFor(`!!document.querySelector('dialog[open]')`,'Keyboard opens screenshot');
    await waitFor(`[...document.querySelectorAll('dialog[open] img')].filter(i=>getComputedStyle(i).display!=='none').every(i=>i.complete&&i.naturalWidth>0)`,'Full original screenshot loads');
    assert.equal(await evaluate(`document.activeElement.getAttribute('aria-label')`),'Close screenshot','Close receives initial focus');
    await key('Tab',9);
    // Native dialog contains keyboard focus; cycle through any browser chrome stop.
    await key('Tab',9);
    assert(await evaluate(`document.querySelector('dialog[open]').contains(document.activeElement)||document.activeElement===document.body`),'Focus cannot reach background controls');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('dialog[open] h2')).opacity`),'1','Dialog title is visible without scroll reveals');
    assert(await evaluate(`(()=>{const r=document.querySelector('dialog[open]').getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth+.5&&r.bottom<=innerHeight+.5})()`),'Modal stays inside viewport');
    assert.equal(await evaluate(`document.body.style.overflow`),'hidden','Background scroll locked');
    if(width<900){assert.equal(await evaluate('!!document.querySelector("canvas")'),false,'Mobile skips 3D');assert(await evaluate(`(()=>{const p=document.querySelector('dialog[open] .screenshot-pan');return p.scrollWidth>p.clientWidth})()`),'Mobile capture supports inspection by panning');}
    await key('Escape',27);
    await waitFor(`!document.querySelector('dialog[open]')`,'Escape closes screenshot');
    assert.equal(await evaluate(`document.activeElement.classList.contains('screenshot-trigger')`),true,'Focus returns to invoking screenshot');
    assert.notEqual(await evaluate(`document.body.style.overflow`),'hidden','Scroll restored');
    await evaluate(`document.querySelector('#experience .screenshot-trigger').click();document.querySelector('dialog[open] [aria-label="Close screenshot"]').click()`);
    await waitFor(`!document.querySelector('dialog[open]')`,'Close button works');
    for(const label of ['Groups','File sharing','Discovery']){
      await evaluate(`[...document.querySelectorAll('#experience [role="tab"]')].find(b=>b.textContent.startsWith(`+JSON.stringify(label)+`)).click()`);
      await pause(300);await evaluate(`document.querySelector('#experience .screenshot-trigger').click()`);
      assert.equal(await evaluate(`document.querySelector('dialog[open] h2').textContent`),label,'Selected capture has correct title');
      await key('Escape',27);await pause(100);
    }
  }
  checks.push('original screenshot inspection: desktop dark/mobile light; keyboard Enter/Escape, focus restoration, body scroll lock, all product views, mobile panning');
  await viewport(1440,1000);
  await evaluate(`document.querySelector('.header-download').click()`);
  await waitFor(`location.pathname==='/downloads/' && !!document.querySelector('#support')`,'Downloads client navigation');
  assert(await evaluate(`document.querySelector('.download-coming-soon')?.disabled && document.querySelector('.download-coming-soon').textContent.includes('Coming Soon')`),'Coming Soon is truly disabled');
  assert.equal(await evaluate(`[...document.querySelectorAll('a')].filter(a=>a.href.includes('/releases/download/')||a.protocol==='mailto:'||(a.hostname==='github.com'&&a.pathname.includes('/issues'))).length`),0,'No unverified installer or support URLs');
  assert.equal(await evaluate(`document.querySelector('#support .button').getAttribute('href')`),'/products/lan-messenger/docs/#troubleshooting','Help is a working internal guide');
  const response=await fetch(url+'/downloads/');assert.equal(response.headers.get('x-frame-options'),'DENY','Local harness applies prepared frame protection');assert(response.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"),'Local harness applies prepared CSP');
  checks.push('disabled download and honest support availability; prepared CSP enforced by local harness');
}
