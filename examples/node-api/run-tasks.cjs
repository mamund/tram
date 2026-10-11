#!/usr/bin/env node
'use strict';

// Run from the repository root or any working directory:
//   node examples/node-api/run-tasks.cjs
// Start the sample Tasks server first (see README.md).
const path = require('node:path');
const { loadManifest, run } = require('../../');

async function main() {
  const manifestPath = path.resolve(__dirname, '../../api-samples/tasks/api-tests.json');
  const manifest = loadManifest(manifestPath);
  const outcome = await run(manifest);

  console.log('Tasks API:', outcome.summary);
  for (const result of outcome.results) {
    console.log(`${result.passed ? 'PASS' : result.skipped ? 'SKIP' : 'FAIL'} ${result.id || result.name}`);
  }
  if (outcome.summary.failed > 0) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
