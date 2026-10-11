'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { runSuite } = require('../lib/runner');

test('runner executes independently and returns structured evidence', async () => {
  const server = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const manifest = {
      manifestVersion: '0.2', name: 'Module test',
      config: { baseUrl: `http://127.0.0.1:${server.address().port}` },
      tests: [{ name: 'GET works', method: 'GET', path: '/', expect: { status: 200 } }]
    };
    const result = await runSuite(manifest);
    assert.equal(result.summary.passed, 1);
    assert.equal(result.summary.failed, 0);
    assert.equal(result.results[0].response.body.ok, true);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('runner supports repeated independent invocations', async () => {
  const manifest = { config: { baseUrl: 'http://127.0.0.1:1' }, tests: [{ name: 'disabled', enabled: false }] };
  const first = await runSuite(manifest);
  const second = await runSuite(manifest);
  assert.deepEqual(first.summary, { total: 1, passed: 0, failed: 0, skipped: 1 });
  assert.deepEqual(second.summary, first.summary);
  assert.equal(first.manifestVersion, '0.2');
});
