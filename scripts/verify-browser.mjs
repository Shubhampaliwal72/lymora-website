/** Current browser acceptance suite. Reuses the shared renderer/route harness.
 * The old Stage 2 script assumed a separate hero canvas and retired controls.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const suites = ['--seo-only', '--launch-only'];
for (const suite of suites) {
  console.log('Browser acceptance: ' + suite);
  execFileSync(process.execPath, ['scripts/verify-network-motion.mjs', suite], { stdio: 'inherit', windowsHide: true });
}
const output = path.resolve('.verification');
const report = { passed: true, suites, checks: ['seven routes, mobile widths, metadata, layout stability and theme delivery', 'current three-PC mesh, keyboard screenshot dialog, download links and launch controls'], limitations: ['Local static export and software WebGL; not field Core Web Vitals or a physical-device benchmark.'] };
await fs.writeFile(path.join(output, 'browser-results.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
