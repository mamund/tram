'use strict';

const fs = require('fs');
const path = require('path');
const { redactHeaderValue } = require('./runner');

function printConsoleReport(suiteResult, options = {}) {
  const verbose = options.verbose === true;

  console.log(suiteResult.name);
  console.log('');

  for (const result of suiteResult.results) {
    if (result.skipped) {
      console.log(`- ${result.name} (skipped)`);
      continue;
    }

    const marker = result.passed ? '✓' : '✗';
    console.log(`${marker} ${result.name}`);

    if (!result.passed || verbose) {
      console.log(`  ${result.method} ${result.path}`);
      if (result.status !== null && result.status !== undefined) {
        console.log(`  Status: ${result.status}`);
      }

      const assertionsToPrint = verbose
        ? result.assertions
        : result.assertions.filter((assertion) => !assertion.passed);

      for (const assertion of assertionsToPrint) {
        const assertionMarker = assertion.passed ? '✓' : '✗';
        console.log(`  ${assertionMarker} ${assertion.message}`);
      }
    }
  }

  console.log('');
  console.log(
    `Summary: ${suiteResult.summary.passed} passed, ${suiteResult.summary.failed} failed, ${suiteResult.summary.skipped} skipped, ${suiteResult.summary.total} total`
  );
}

function writeJsonReport(reportPath, suiteResult) {
  const fullPath = path.resolve(process.cwd(), reportPath);
  fs.writeFileSync(fullPath, `${JSON.stringify(suiteResult, null, 2)}\n`, 'utf8');
}


function writeHttpTranscript(transcriptPath, suiteResult) {
  const fullPath = path.resolve(process.cwd(), transcriptPath);
  fs.writeFileSync(fullPath, renderHttpTranscript(suiteResult), 'utf8');
}

function renderHttpTranscript(suiteResult) {
  const lines = [];

  lines.push('TRAM HTTP Transcript');
  lines.push(`Suite: ${suiteResult.name}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  for (const result of suiteResult.results) {
    if (result.skipped) {
      continue;
    }

    lines.push('============================================================');
    lines.push(`${result.name} (${result.id})`);
    lines.push('');
    lines.push(renderTranscriptRequest(result.request));
    lines.push('');
    lines.push(renderTranscriptResponse(result.response));

    const captureAssertions = (result.assertions || []).filter((assertion) => assertion.type === 'capture');
    if (captureAssertions.length > 0) {
      lines.push('');
      lines.push('--- Captures ------------------------------------------------');
      for (const assertion of captureAssertions) {
        if (assertion.passed) {
          lines.push(`${assertion.target} = ${formatTranscriptValue(assertion.actual)}`);
        } else {
          lines.push(`${assertion.target} = <not captured>`);
        }
      }
    }

    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function renderTranscriptRequest(request) {
  if (!request) {
    return '> REQUEST UNAVAILABLE';
  }

  const url = new URL(request.url);
  const lines = [];

  lines.push(`> ${request.method} ${url.pathname}${url.search} HTTP/1.1`);
  lines.push(`> Host: ${url.host}`);

  for (const [name, value] of Object.entries(request.headers || {})) {
    lines.push(`> ${name}: ${redactHeaderValue(name, value)}`);
  }

  if (request.body !== null && request.body !== undefined) {
    lines.push('>');
    lines.push(prefixTranscriptBody(formatTranscriptBody(request.body), '> '));
  }

  return lines.join('\n');
}

function renderTranscriptResponse(response) {
  if (!response) {
    return '< REQUEST FAILED';
  }

  const lines = [];

  lines.push(`< HTTP/1.1 ${response.status}`);

  for (const [name, value] of Object.entries(response.headers || {})) {
    lines.push(`< ${name}: ${redactHeaderValue(name, value)}`);
  }

  if (response.rawBody) {
    lines.push('<');
    lines.push(prefixTranscriptBody(formatTranscriptBody(response.body), '< '));
  }

  return lines.join('\n');
}

function formatTranscriptBody(value) {
  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

function prefixTranscriptBody(value, prefix) {
  return String(value)
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');
}

function formatTranscriptValue(value) {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  return JSON.stringify(value, null, 2);
}


module.exports = { printConsoleReport, writeJsonReport, writeHttpTranscript, renderHttpTranscript };
