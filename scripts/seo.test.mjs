import assert from 'node:assert/strict';
import { test } from 'node:test';
import { serializeStructuredData } from '../src/lib/json-ld.mjs';

test('JSON-LD cannot close its containing HTML script', () => {
  const data = { name: '</script><script>alert(1)</script>', description: 'A < B & C' };
  const serialized = serializeStructuredData(data);
  assert(!serialized.includes('<'));
  assert.deepEqual(JSON.parse(serialized), data);
});
test('JSON-LD preserves nested release information and Unicode', () => {
  const data = { '@type': 'SoftwareApplication', softwareVersion: '1.0.1', nested: { name: 'Lymora', os: ['Windows'] } };
  assert.deepEqual(JSON.parse(serializeStructuredData(data)), data);
});
