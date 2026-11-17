import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPublicBuild } from '../src/lib/indexing.mjs';

const cases = [
  ['manual production export without launch flag', {}, true],
  ['production build', { NODE_ENV: 'production' }, true],
  ['Cloudflare production branch', { CF_PAGES_BRANCH: 'main' }, true],
  ['legacy explicit launch opt-in', { LYMORA_PUBLIC_LAUNCH: 'true' }, true],
  ['explicit staging opt-out', { LYMORA_PUBLIC_LAUNCH: 'false' }, false],
  ['local development', { NODE_ENV: 'development' }, false],
  ['development cannot opt into indexing', { NODE_ENV: 'development', LYMORA_PUBLIC_LAUNCH: 'true' }, false],
  ['Cloudflare dev branch', { CF_PAGES_BRANCH: 'dev' }, false],
  ['Cloudflare feature branch', { CF_PAGES_BRANCH: 'feature/seo' }, false],
  ['preview cannot opt into indexing', { CF_PAGES_BRANCH: 'dev', LYMORA_PUBLIC_LAUNCH: 'true' }, false],
  ['production branch honors opt-out', { CF_PAGES_BRANCH: 'main', LYMORA_PUBLIC_LAUNCH: 'false' }, false],
];
for (const [name, env, expected] of cases) {
  test(name, () => assert.equal(isPublicBuild(env), expected));
}
