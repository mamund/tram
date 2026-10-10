#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const net = require('node:net');
const { spawn, spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const sample = path.join(root, 'api-samples/tasks');
const manifest = path.join(sample, 'api-tests.json');
const cli = path.join(root, 'bin/tram');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function portAvailable() {
  return new Promise(resolve => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.listen(3000, '127.0.0.1', () => server.close(() => resolve(true)));
  });
}
async function ready(child) {
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(`Tasks API exited early (${child.exitCode})`);
    try {
      const response = await fetch('http://127.0.0.1:3000/');
      if (response.ok) return;
    } catch (_) { /* still starting */ }
    await delay(100);
  }
  throw new Error('Tasks API did not become ready within 10 seconds');
}
async function main() {
  if (!(await portAvailable())) throw new Error('Port 3000 is already occupied; stop the existing service before integration tests');
  if (!fs.existsSync(manifest)) throw new Error(`Missing sample manifest: ${manifest}`);
  if (!fs.existsSync(path.join(sample, 'node_modules/express'))) {
    console.log('Installing Tasks API dependencies with npm ci...');
    const install = spawnSync('npm', ['ci', '--no-audit', '--no-fund'], {cwd: sample, stdio: 'inherit'});
    if (install.status !== 0) throw new Error(`Tasks API npm ci failed (${install.status})`);
  }
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tram-tasks-integration-'));
  const report = path.join(temp, 'report.json');
  const transcript = path.join(temp, 'transcript.http');
  const server = spawn(process.execPath, ['index.js'], {cwd: sample, stdio: ['ignore', 'pipe', 'pipe']});
  let serverOutput = '';
  server.stdout.on('data', chunk => serverOutput += chunk);
  server.stderr.on('data', chunk => serverOutput += chunk);
  try {
    await ready(server);
    const run = spawnSync(process.execPath, [cli, manifest, '--report', report, '--transcript', transcript], {cwd: root, encoding: 'utf8', timeout: 30000});
    if (run.stdout) process.stdout.write(run.stdout);
    if (run.stderr) process.stderr.write(run.stderr);
    if (run.error) throw run.error;
    if (run.status !== 0) throw new Error(`TRAM exited ${run.status}`);
    if (!fs.existsSync(report) || !fs.existsSync(transcript)) throw new Error('Missing evidence artifacts');
    const result = JSON.parse(fs.readFileSync(report, 'utf8'));
    const summary = result.summary;
    if (!summary || summary.total !== 10 || summary.passed !== 10 || summary.failed !== 0 || summary.skipped !== 0) {
      throw new Error(`Unexpected Tasks API summary: ${JSON.stringify(summary)}`);
    }
    console.log('Tasks API integration passed: 10/10 tests; report and transcript generated.');
  } catch (error) {
    if (serverOutput) process.stderr.write(`Tasks API output:\n${serverOutput}\n`);
    throw error;
  } finally {
    server.kill('SIGTERM');
    await Promise.race([new Promise(resolve => server.once('exit', resolve)), delay(1500)]);
    if (server.exitCode === null && !server.killed) server.kill('SIGKILL');
    fs.rmSync(temp, {recursive: true, force: true});
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
