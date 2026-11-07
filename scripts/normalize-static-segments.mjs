/** Normalize Next's Windows-exported RSC paths to the filenames its router requests.
 * Next's collectSegmentPaths uses platform separators, but its filename converter
 * replaces only forward slashes. Keep originals; add portable aliases in out/.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('out');
let normalized = 0;
async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(source);
      continue;
    }
    if (!entry.name.endsWith('.txt')) continue;
    const parts = path.relative(root, source).split(path.sep);
    const segment = parts.findIndex(part => part.startsWith('__next.'));
    if (segment < 0 || segment === parts.length - 1) continue;
    const destination = path.join(root, ...parts.slice(0, segment), parts.slice(segment).join('.'));
    const content = await fs.readFile(source);
    try {
      await fs.writeFile(destination, content, { flag: 'wx' });
      normalized++;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      assert((await fs.readFile(destination)).equals(content), 'Conflicting static segment: ' + destination);
    }
  }
}
await walk(root);
console.log('Static segment filename aliases added: ' + normalized);
