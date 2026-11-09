import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { Timer } from 'three';
import {createTimerClock, applyCompatibility} from './r3f-timer-compat.mjs';
const resolvePackage = createRequire(import.meta.url).resolve;

test('Timer-backed clock auto-starts and reports real elapsed seconds', t => {
  let now = 1000;
  t.mock.method(performance, 'now', () => now);
  const clock = createTimerClock(Timer);
  assert.equal(clock.getDelta(), 0);
  assert.equal(clock.running, true);
  now += 1250;
  assert.equal(clock.getDelta(), 1.25);
  now += 500;
  assert.equal(clock.getElapsedTime(), 1.75);
  assert.equal(clock.getDelta(), 0);
});
test('Pause and restart preserve the existing R3F clock contract', t => {
  let now = 1000;
  t.mock.method(performance, 'now', () => now);
  const clock = createTimerClock(Timer);
  clock.start(); now += 500; clock.stop();
  assert.equal(clock.elapsedTime, .5);
  assert.equal(clock.autoStart, false);
  now += 10000;
  assert.equal(clock.getDelta(), 0);
  assert.equal(clock.getElapsedTime(), .5);
  clock.start();
  assert.equal(clock.elapsedTime, 0);
  now += 250;
  assert.equal(clock.getDelta(), .25);
});
test('Manual frame-loop timestamps remain writable without auto-start', () => {
  const clock = createTimerClock(Timer);
  clock.autoStart = false;
  clock.oldTime = 11;
  clock.elapsedTime = 12.5;
  assert.equal(clock.getDelta(), 0);
  assert.equal(clock.oldTime, 11);
  assert.equal(clock.elapsedTime, 12.5);
});
test('All pinned R3F entry points use Timer and reapplying the install adapter changes no bytes', () => {
  const directory = path.join(path.dirname(resolvePackage('@react-three/fiber/package.json')), 'dist');
  const files = fs.readdirSync(directory).filter(file => /^events-.*\.(?:esm|cjs\.(?:dev|prod))\.js$/.test(file));
  assert.equal(files.length, 3);
  const before = files.map(file => fs.readFileSync(path.join(directory, file), 'utf8'));
  before.forEach(source => {
    assert(source.includes('/* lymora-r3f-timer-compat */'));
    assert(!/clock: new THREE(?:__namespace)?\.Clock/.test(source));
  });
  applyCompatibility();
  assert.deepEqual(files.map(file => fs.readFileSync(path.join(directory, file), 'utf8')), before);
});
