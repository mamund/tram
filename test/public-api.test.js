'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { loadManifest, validateManifest, run } = require('..');

test('package root exports the documented public API', () => {
  assert.equal(typeof loadManifest, 'function');
  assert.equal(typeof validateManifest, 'function');
  assert.equal(typeof run, 'function');
});

test('public API loads and validates a manifest', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tram-api-'));
  try {
    const file = path.join(dir, 'manifest.json');
    const manifest = { config: { baseUrl: 'http://127.0.0.1:1' }, tests: [] };
    fs.writeFileSync(file, JSON.stringify(manifest));
    assert.deepEqual(loadManifest(file), manifest);
    assert.equal(validateManifest(manifest), undefined);
    assert.throws(() => validateManifest({}), /Manifest validation failed/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('public run executes valid manifests and returns evidence', async () => {
  const server = http.createServer((_req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const manifest = { manifestVersion: '0.2', config: { baseUrl: `http://127.0.0.1:${server.address().port}` }, tests: [{ name: 'smoke', method: 'GET', path: '/', expect: { status: 200 } }] };
    const result = await run(manifest);
    assert.equal(result.summary.passed, 1);
    assert.equal(result.summary.failed, 0);
    assert.equal(result.results[0].response.body.ok, true);
    assert.deepEqual((await run(manifest)).summary, result.summary);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('public run rejects invalid manifests before making requests', async () => {
  await assert.rejects(run({ tests: [] }), /Manifest validation failed/);
});
