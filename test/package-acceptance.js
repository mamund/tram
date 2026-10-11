'use strict';
// Run: node test/package-acceptance.js [path/to/tram-0.1.0.tgz]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const {spawn, spawnSync} = require('node:child_process');
const tarball = path.resolve(process.argv[2] || 'tram-0.1.0.tgz');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tram-package-acceptance-'));
function run(cli, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cli, args, {cwd: dir});
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('error', reject);
    child.on('close', code => resolve({code, stdout, stderr}));
  });
}
async function main() {
  assert.ok(fs.existsSync(tarball), `Tarball not found: ${tarball}`);
  fs.writeFileSync(path.join(dir, 'package.json'), '{"private":true,"name":"tram-package-acceptance","version":"1.0.0"}\n');
  const installed = spawnSync('npm', ['install', '--no-audit', '--no-fund', tarball], {cwd: dir, encoding: 'utf8'});
  assert.equal(installed.status, 0, installed.stderr || installed.stdout);
  const cli = path.join(dir, 'node_modules', '.bin', 'tram');
  const help = await run(cli, ['--help']);
  assert.equal(help.code, 0, help.stderr + help.stdout);
  console.log('PASS installed CLI help');
  const server = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ok: true, path: req.url}));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const manifest = {name:'Package acceptance',manifestVersion:'0.2',config:{baseUrl},tests:[
      {id:'smoke',name:'Smoke',method:'GET',path:'/smoke',expect:{status:200}}
    ]};
    const mf = path.join(dir, 'api-tests.json');
    const report = path.join(dir, 'report.json');
    const transcript = path.join(dir, 'transcript.http');
    fs.writeFileSync(mf, JSON.stringify(manifest));
    const validation = await run(cli, [mf, '--validate']);
    assert.equal(validation.code, 0, validation.stderr + validation.stdout);
    console.log('PASS installed CLI validation');
    const execution = await run(cli, [mf, '--report', report, '--transcript', transcript]);
    assert.equal(execution.code, 0, execution.stderr + execution.stdout);
    assert.equal(JSON.parse(fs.readFileSync(report, 'utf8')).summary.failed, 0);
    assert.match(fs.readFileSync(transcript, 'utf8'), /GET \/smoke/);
    console.log('PASS installed CLI execution and evidence');

    // Exercise the published entry point from a separate consumer project.
    const consumerScript = path.join(dir, 'consumer.cjs');
    fs.writeFileSync(consumerScript, `
'use strict';
const assert = require('node:assert/strict');
const { loadManifest, validateManifest, run } = require('@mamund/tram');
(async () => {
  assert.equal(typeof loadManifest, 'function');
  assert.equal(typeof validateManifest, 'function');
  assert.equal(typeof run, 'function');
  const manifest = loadManifest('./api-tests.json');
  validateManifest(manifest);
  const first = await run(manifest);
  assert.equal(first.summary.failed, 0);
  assert.equal(first.summary.passed, 1);
  assert.equal(first.results[0].response.body.ok, true);
  const second = await run(manifest);
  assert.equal(second.summary.failed, 0);
  assert.equal(second.summary.passed, 1);
  console.log('PASS installed public API execution and repeat run');
})().catch(err => { console.error(err); process.exitCode = 1; });
`);
    const api = await run(process.execPath, [consumerScript]);
    assert.equal(api.code, 0, api.stderr + api.stdout);
    assert.match(api.stdout, /PASS installed public API execution and repeat run/);
    console.log('PASS installed package API imports and execution');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(err => {console.error(err); process.exitCode = 1;}).finally(() => fs.rmSync(dir, {recursive:true, force:true}));
