'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { renderHttpTranscript, writeHttpTranscript, writeJsonReport, printConsoleReport } = require('../lib/reports');

const sample = {
  name: 'Report module test',
  summary: { passed: 1, failed: 0, skipped: 0, total: 1 },
  results: [{ id: 'r1', name: 'GET ok', passed: true, skipped: false, method: 'GET', path: '/ok', status: 200, assertions: [],
    request: { method: 'GET', url: 'http://example.test/ok', headers: { authorization: 'Bearer secret' } },
    response: { status: 200, headers: {}, rawBody: '', body: null }
  }]
};

test('reports module renders transcript with redacted headers', () => {
  const transcript = renderHttpTranscript(sample);
  assert.match(transcript, /GET \/ok HTTP\/1\.1/);
  assert.doesNotMatch(transcript, /Bearer secret/);
});

test('reports module writes JSON and transcript', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tram-reports-'));
  try {
    const jsonPath = path.join(dir, 'results.json');
    const transcriptPath = path.join(dir, 'results.http');
    writeJsonReport(jsonPath, sample);
    writeHttpTranscript(transcriptPath, sample);
    assert.deepEqual(JSON.parse(fs.readFileSync(jsonPath, 'utf8')), sample);
    assert.match(fs.readFileSync(transcriptPath, 'utf8'), /TRAM HTTP Transcript/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('console report can be called independently', () => {
  const lines = [];
  const original = console.log;
  console.log = (...args) => lines.push(args.join(' '));
  try { printConsoleReport(sample); } finally { console.log = original; }
  assert.match(lines.join('\n'), /Summary: 1 passed, 0 failed/);
});
