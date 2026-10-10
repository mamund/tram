'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const cli = path.join(root, 'bin/tram');
function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], { cwd: root });
    let stdout = '', stderr = '';
    child.stdout.on('data', b => stdout += b);
    child.stderr.on('data', b => stderr += b);
    child.on('error', reject);
    child.on('close', code => resolve({code, stdout, stderr}));
  });
}
function manifest(baseUrl, tests) {
  return { name: 'Regression', manifestVersion: '0.2', config: {baseUrl}, tests };
}
async function withServer(fn) {
  const server = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ok: true, path: req.url}));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await fn(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}
async function withManifest(data, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tram-test-'));
  const file = path.join(dir, 'manifest.json');
  fs.writeFileSync(file, JSON.stringify(data));
  try { await fn(file, dir); }
  finally { fs.rmSync(dir, {recursive: true, force: true}); }
}
test('help succeeds and unknown option fails', async () => {
  assert.equal((await run(['--help'])).code, 0);
  assert.equal((await run(['--bogus'])).code, 1);
});
test('valid manifests validate without contacting server', async () => {
  await withManifest(manifest('http://127.0.0.1:1', [{id:'one', name:'One', method:'GET', path:'/', expect:{status:200}}]), async file => {
    const result = await run([file, '--validate']);
    assert.equal(result.code, 0, result.stderr);
    assert.match(result.stdout, /No HTTP requests were made/);
  });
});
test('invalid manifest fixtures are rejected', async () => {
  const dir = path.join(root, 'examples/bad-manifests');
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const result = await run([path.join(dir, file), '--validate']);
    assert.equal(result.code, 1, `${file}: ${result.stdout} ${result.stderr}`);
  }
});
test('passing assertions yield zero and write evidence', async () => {
  await withServer(async baseUrl => {
    await withManifest(manifest(baseUrl, [{id:'pass', name:'Pass', method:'GET', path:'/ok', expect:{status:200}}]), async (file, dir) => {
      const report = path.join(dir, 'report.json'), transcript = path.join(dir, 'transcript.http');
      const result = await run([file, '--report', report, '--transcript', transcript]);
      assert.equal(result.code, 0, result.stderr + result.stdout);
      assert.equal(JSON.parse(fs.readFileSync(report)).summary.failed, 0);
      assert.match(fs.readFileSync(transcript, 'utf8'), /GET \/ok/);
    });
  });
});
test('failing assertions yield nonzero and retain failure evidence', async () => {
  await withServer(async baseUrl => {
    await withManifest(manifest(baseUrl, [{id:'fail', name:'Fail', method:'GET', path:'/ok', expect:{status:201}}]), async (file, dir) => {
      const report = path.join(dir, 'report.json');
      const result = await run([file, '--report', report]);
      assert.equal(result.code, 1);
      assert.equal(JSON.parse(fs.readFileSync(report)).summary.failed, 1);
    });
  });
});
test('transport errors yield nonzero', async () => {
  await withManifest(manifest('http://127.0.0.1:1', [{id:'network', name:'Network', method:'GET', path:'/', expect:{status:200}}]), async file => {
    assert.equal((await run([file])).code, 1);
  });
});
