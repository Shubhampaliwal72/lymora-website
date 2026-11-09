import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
export async function verifyTopologyUi({cdp,evaluate,load,viewport,media,waitFor,pause,checks}){
  const output=path.resolve('.verification');
  for(const [width,theme] of [[1440,'dark'],[1440,'light'],[375,'dark'],[375,'light'],[901,'dark']]){
    await viewport(width,1000);await media(theme);await load();
    await evaluate('window.scrollTo({top:0,behavior:"instant"})');
    if(width>900)await waitFor(`document.querySelector('.living-network').dataset.mode==='3d'`,'Desktop peer mesh loads');
    assert.equal(await evaluate(`document.querySelectorAll('.network-device-label').length`),3,'Three selectable PCs');
    assert.equal(await evaluate(`document.querySelectorAll('.topology-wire').length`),3,'Three direct mesh connections');
    assert.equal(await evaluate(`!!document.querySelector('.network-interaction')`),false,'Old demo dashboard removed');
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'No page overflow');
    assert(await evaluate(`(()=>{const box=document.querySelector('.network-world').getBoundingClientRect();return [...document.querySelectorAll('.network-device-label')].every(e=>{const r=e.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right&&r.top>=box.top&&r.bottom<=box.bottom})})()`),'PC labels remain inside the scene');
    assert(await evaluate(`(()=>{const a=document.querySelector('.network-world').getBoundingClientRect(),b=document.querySelector('.network-demo-strip').getBoundingClientRect();return a.bottom<=b.top+.5&&b.height<160})()`),'Compact status stays below the PCs');
    await evaluate(`document.querySelector('[aria-label="Send preview to Team PC"]').click()`);
    await waitFor(`document.querySelector('.living-network').dataset.endpoint==='team'`,'Selecting a PC changes delivery target');
    await evaluate(`document.querySelector('[aria-label="Send a file in the preview"]').click()`);
    await waitFor(`document.querySelector('.living-network').dataset.transfer==='file'`,'File preview works');
    await evaluate(`document.querySelector('[aria-label="Pause network preview"]').click()`);
    await waitFor(`!!document.querySelector('[aria-label="Play network preview"]')`,'Pause accessible');
    const phase=await evaluate(`document.querySelector('.living-network').dataset.phase`);await pause(350);assert.equal(await evaluate(`document.querySelector('.living-network').dataset.phase`),phase,'Pause holds story');
    await evaluate(`document.querySelector('[aria-label="Play network preview"]').click()`);
    await evaluate(`document.querySelector('[aria-label="Send a message in the preview"]').click()`);
    await waitFor(`document.querySelector('.living-network').dataset.phase==='4'`,'Packet arrives at receiving PC');
    await evaluate(`document.querySelector('[aria-label="Pause network preview"]').click()`);
    await evaluate('window.scrollTo({top:0,behavior:"instant"})');await pause(200);
    const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await fs.writeFile(path.join(output,'peer-mesh-'+width+'-'+theme+'.png'),Buffer.from(shot.data,'base64'));
    if(width<=900)assert.equal(await evaluate('!!document.querySelector("canvas")'),false,'Mobile uses aligned SVG, not WebGL');
  }
  checks.push('three-PC mesh, visible labels, no old card, compact status, target/file/message/pause/arrival controls, dark/light desktop/mobile plus 901px layout');
}
