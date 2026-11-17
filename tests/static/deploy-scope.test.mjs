import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const path = new URL('../../.vercelignore', import.meta.url);

test('.vercelignore exists', () => {
  assert.ok(existsSync(path), '.vercelignore missing');
});

test('live deploy allows only the platform folder and static site files', () => {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  for (const l of ['/*', '!/platform']) {
    assert.ok(lines.includes(l), `missing pattern ${l}`);
  }
  const allowed = lines.filter(l => l.startsWith('!'));
  for (const bad of ['docs', 'tests', 'package.json', '.superpowers']) {
    assert.ok(!allowed.some(l => l.includes(bad)), `must not re-include ${bad}`);
  }
});
