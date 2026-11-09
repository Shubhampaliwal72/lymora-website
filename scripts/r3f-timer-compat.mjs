/**
 * R3F 9.8.2 still constructs THREE.Clock, deprecated in Three r183+.
 * Use Three.Timer behind its existing clock API until a stable R3F migration.
 * Version-guarded, idempotent and applied after npm ci. Never filters console output.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const resolvePackage = createRequire(import.meta.url).resolve;

function createTimerClock(Timer) {
  const timer = new Timer();
  return {
    autoStart: true, startTime: 0, oldTime: 0, elapsedTime: 0, running: false,
    start() {
      this.startTime = performance.now();
      this.oldTime = this.startTime;
      this.elapsedTime = 0;
      this.running = true;
      timer.reset();
    },
    stop() {
      this.getElapsedTime();
      this.running = false;
      this.autoStart = false;
    },
    getElapsedTime() {
      this.getDelta();
      return this.elapsedTime;
    },
    getDelta() {
      if (this.autoStart && !this.running) { this.start(); return 0; }
      if (!this.running) return 0;
      timer.update();
      const delta = timer.getDelta();
      this.oldTime = performance.now();
      this.elapsedTime += delta;
      return delta;
    },
  };
}

function applyCompatibility() {
  const root = path.dirname(resolvePackage('@react-three/fiber/package.json'));
  const metadata = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  if (metadata.version !== '9.8.2') throw new Error('Review the Timer compatibility adapter before upgrading React Three Fiber.');
  const directory = path.join(root, 'dist');
  const files = fs.readdirSync(directory).filter(file => /^events-.*\.(?:esm|cjs\.(?:dev|prod))\.js$/.test(file));
  if (files.length !== 3) throw new Error('Unexpected React Three Fiber distribution; Timer compatibility was not applied.');
  const changes = files.map(file => {
    const target = path.join(directory, file);
    const source = fs.readFileSync(target, 'utf8');
    if (source.includes('/* lymora-r3f-timer-compat */')) return null;
    const pattern = /clock: new (THREE(?:__namespace)?)\.Clock\(\),/g;
    const matches = [...source.matchAll(pattern)];
    if (matches.length !== 1) throw new Error('Unexpected clock construction in ' + file);
    return {target, source: source.replace(pattern, (_, namespace) => 'clock: /* lymora-r3f-timer-compat */ (' + createTimerClock.toString() + ')(' + namespace + '.Timer),')};
  }).filter(Boolean);
  for (const change of changes) fs.writeFileSync(change.target, change.source);
  console.log('React Three Fiber Timer compatibility: ' + changes.length + ' files updated.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) applyCompatibility();
export {createTimerClock, applyCompatibility};
