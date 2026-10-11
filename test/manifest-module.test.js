'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadManifest, validateManifest, validateManifestPath } = require('../lib/manifest');

test('manifest module loads and validates a file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tram-manifest-'));
  try {
    const file = path.join(dir, 'manifest.json');
    const manifest = { manifestVersion: '0.2', config: { baseUrl: 'http://localhost:3000' }, tests: [] };
    fs.writeFileSync(file, JSON.stringify(manifest));
    assert.equal(validateManifestPath(file), file);
    assert.deepEqual(loadManifest(file), manifest);
    assert.equal(validateManifest(loadManifest(file)), undefined);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('manifest module rejects invalid manifests', () => {
  assert.throws(() => validateManifest({ config: {}, tests: [] }), /config.baseUrl/);
  assert.throws(() => validateManifest({ manifestVersion: '99', config: { baseUrl: 'http:\/\/localhost' }, tests: [] }), /Unsupported manifestVersion/);
});
