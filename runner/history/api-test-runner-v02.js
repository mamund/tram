#!/usr/bin/env node
'use strict';

/**
 * api-test-runner.js v0.1
 *
 * Dependency-free HTTP API test runner.
 *
 * Usage:
 *   node api-test-runner.js api-tests.json
 *   node api-test-runner.js api-tests.json --verbose
 *   node api-test-runner.js api-tests.json --report results.json
 *
 * Requires:
 *   Node.js 18+
 *   ./assertions.js
 */

const fs = require('fs');
const path = require('path');
const { evaluateExpectations } = require('./assertions');

const SUPPORTED_MANIFEST_VERSION = '0.1';

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.manifestPath) {
    printUsage();
    process.exit(1);
  }

  try {
    const manifest = loadManifest(args.manifestPath);
    validateManifest(manifest);

    const suiteResult = await runSuite(manifest);

    printConsoleReport(suiteResult, { verbose: args.verbose });

    if (args.reportPath) {
      writeJsonReport(args.reportPath, suiteResult);
    }

    process.exit(suiteResult.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

function parseArgs(argv) {
  const args = {
    manifestPath: null,
    verbose: false,
    reportPath: null
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--verbose' || arg === '-v') {
      args.verbose = true;
      continue;
    }

    if (arg === '--report') {
      const reportPath = argv[i + 1];
      if (!reportPath) throw new Error('--report requires a file path.');
      args.reportPath = reportPath;
      i += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }

    if (!args.manifestPath) {
      args.manifestPath = arg;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printUsage() {
  console.log('Usage:');
  console.log('  node api-test-runner.js api-tests.json');
  console.log('  node api-test-runner.js api-tests.json --verbose');
  console.log('  node api-test-runner.js api-tests.json --report results.json');
}

function loadManifest(manifestPath) {
  const fullPath = path.resolve(process.cwd(), manifestPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Manifest file not found: ${fullPath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read manifest JSON: ${error.message}`);
  }
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Manifest must be a JSON object.');
  }

  if (manifest.manifestVersion && manifest.manifestVersion !== SUPPORTED_MANIFEST_VERSION) {
    throw new Error(
      `Unsupported manifestVersion ${manifest.manifestVersion}. Supported version is ${SUPPORTED_MANIFEST_VERSION}.`
    );
  }

  if (!manifest.config || typeof manifest.config !== 'object') {
    throw new Error('Manifest requires config.');
  }

  if (!manifest.config.baseUrl) {
    throw new Error('Manifest requires config.baseUrl.');
  }

  if (!Array.isArray(manifest.tests)) {
    throw new Error('Manifest requires tests array.');
  }
}

async function runSuite(manifest) {
  const results = [];
  const tests = manifest.tests || [];

  for (let index = 0; index < tests.length; index += 1) {
    const test = tests[index];
    const testResult = await runTest({ manifest, test, index });
    results.push(testResult);
  }

  return {
    name: manifest.name || 'HTTP API Tests',
    manifestVersion: manifest.manifestVersion || SUPPORTED_MANIFEST_VERSION,
    version: manifest.version || null,
    description: manifest.description || null,
    author: manifest.author || null,
    created: manifest.created || null,
    updated: manifest.updated || null,
    tags: Array.isArray(manifest.tags) ? manifest.tags : [],
    summary: summarize(results),
    results
  };
}

async function runTest({ manifest, test, index }) {
  const id = test.id || `test-${index + 1}`;
  const enabled = test.enabled !== false;

  if (!enabled) {
    return {
      id,
      name: test.name || id,
      enabled: false,
      skipped: true,
      passed: true,
      method: test.method || null,
      path: test.path || null,
      status: null,
      durationMs: 0,
      assertions: []
    };
  }

  validateTest(test, index);

  const request = buildRequest({ manifest, test });
  const started = Date.now();

  try {
    const response = await executeRequest(request, manifest.config.timeoutMs);
    const durationMs = Date.now() - started;
    const assertions = evaluateExpectations({ expect: test.expect, response });
    const passed = assertions.every((assertion) => assertion.passed);

    return {
      id,
      name: test.name,
      enabled: true,
      skipped: false,
      passed,
      type: test.type || null,
      tags: Array.isArray(test.tags) ? test.tags : [],
      rationale: test.rationale || null,
      method: request.method,
      path: test.path,
      url: request.url,
      status: response.status,
      durationMs,
      request: requestForReport(request),
      response: responseForReport(response),
      assertions
    };
  } catch (error) {
    const durationMs = Date.now() - started;

    return {
      id,
      name: test.name,
      enabled: true,
      skipped: false,
      passed: false,
      type: test.type || null,
      tags: Array.isArray(test.tags) ? test.tags : [],
      rationale: test.rationale || null,
      method: request.method,
      path: test.path,
      url: request.url,
      status: null,
      durationMs,
      request: requestForReport(request),
      response: null,
      assertions: [
        {
          passed: false,
          type: 'request',
          target: 'http',
          expected: 'successful HTTP request',
          actual: error.message,
          message: `Request failed: ${error.message}`
        }
      ]
    };
  }
}

function validateTest(test, index) {
  const label = test.name || `test at index ${index}`;

  if (!test.name) throw new Error(`Test at index ${index} requires name.`);
  if (!test.method) throw new Error(`${label} requires method.`);
  if (!test.path) throw new Error(`${label} requires path.`);
  if (!test.expect || typeof test.expect !== 'object') {
    throw new Error(`${label} requires expect object.`);
  }
}

function buildRequest({ manifest, test }) {
  const config = manifest.config || {};
  const data = manifest.data || {};

  const method = String(test.method || 'GET').toUpperCase();
  const headers = {
    ...(config.defaultHeaders || {}),
    ...(test.headers || {})
  };

  const query = resolveValue(test.query, data);
  const url = buildUrl(config.baseUrl, test.path, query);

  const request = {
    method,
    url,
    headers,
    body: undefined,
    bodyType: null
  };

  if (Object.prototype.hasOwnProperty.call(test, 'body')) {
    const bodyType = test.bodyType || 'json';
    const resolvedBody = resolveTokens(resolveValue(test.body, data));

    request.bodyType = bodyType;
    request.body = encodeBody(resolvedBody, bodyType, request.headers);
  }

  return request;
}

function encodeBody(body, bodyType, headers) {
  switch (bodyType) {
    case 'json':
      if (!hasHeader(headers, 'content-type')) {
        headers['content-type'] = 'application/json';
      }
      return JSON.stringify(body);

    case 'form':
      if (!hasHeader(headers, 'content-type')) {
        headers['content-type'] = 'application/x-www-form-urlencoded';
      }
      return encodeFormBody(body);

    case 'text':
      if (!hasHeader(headers, 'content-type')) {
        headers['content-type'] = 'text/plain';
      }
      return typeof body === 'string' ? body : String(body);

    default:
      throw new Error(`Unsupported bodyType: ${bodyType}`);
  }
}

function encodeFormBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('bodyType "form" requires body to be an object.');
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }

  return params.toString();
}

function buildUrl(baseUrl, requestPath, query) {
  const url = new URL(requestPath, ensureTrailingSlash(baseUrl));

  if (query && typeof query === 'object') {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(resolveTokens(value)));
    }
  }

  return url.toString();
}

function ensureTrailingSlash(value) {
  return String(value).endsWith('/') ? value : `${value}/`;
}

async function executeRequest(request, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      signal: controller.signal
    });

    const text = await response.text();
    const headers = headersToObject(response.headers);
    const body = parseBody(text, headers);

    return {
      status: response.status,
      headers,
      body,
      rawBody: text
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function parseBody(text, headers) {
  if (!text) return null;

  const contentType = getHeaderValue(headers, 'content-type') || '';

  if (contentType.includes('application/json') || looksLikeJson(text)) {
    try {
      return JSON.parse(text);
    } catch (_error) {
      return text;
    }
  }

  return text;
}

function looksLikeJson(text) {
  const trimmed = text.trim();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

function headersToObject(headers) {
  const result = {};
  headers.forEach((value, key) => {
    result[key.toLowerCase()] = value;
  });
  return result;
}

function resolveValue(value, data) {
  if (typeof value === 'string' && value.startsWith('$data.')) {
    const key = value.slice('$data.'.length);

    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      throw new Error(`Data reference not found: ${value}`);
    }

    return clone(data[key]);
  }

  return clone(value);
}

function resolveTokens(value) {
  if (typeof value === 'string') {
    return value.replace(/\$\{([^}]+)\}/g, (_match, tokenName) => generateToken(tokenName));
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveTokens(item));
  }

  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = resolveTokens(child);
    }
    return result;
  }

  return value;
}

function generateToken(tokenName) {
  switch (tokenName) {
    case 'randomId':
      return Math.random().toString(36).slice(2);
    case 'timestamp':
      return new Date().toISOString();
    case 'uuid':
      return cryptoRandomUuid();
    case 'randomEmail':
      return `test-${Math.random().toString(36).slice(2)}@example.com`;
    default:
      return `\${${tokenName}}`;
  }
}

function cryptoRandomUuid() {
  if (global.crypto && typeof global.crypto.randomUUID === 'function') {
    return global.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function summarize(results) {
  const summary = {
    total: results.length,
    passed: 0,
    failed: 0,
    skipped: 0
  };

  for (const result of results) {
    if (result.skipped) summary.skipped += 1;
    else if (result.passed) summary.passed += 1;
    else summary.failed += 1;
  }

  return summary;
}

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

function requestForReport(request) {
  return {
    method: request.method,
    url: request.url,
    headers: request.headers,
    bodyType: request.bodyType,
    body: request.body ? safeParseRequestBody(request.body, request.bodyType) : null
  };
}

function safeParseRequestBody(value, bodyType) {
  if (bodyType === 'json') {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return value;
    }
  }

  if (bodyType === 'form') {
    return Object.fromEntries(new URLSearchParams(value));
  }

  return value;
}

function responseForReport(response) {
  return {
    status: response.status,
    headers: response.headers,
    body: response.body,
    rawBody: response.rawBody
  };
}

function hasHeader(headers, name) {
  const normalized = name.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === normalized);
}

function getHeaderValue(headers, name) {
  const normalized = name.toLowerCase();
  for (const [key, value] of Object.entries(headers || {})) {
    if (key.toLowerCase() === normalized) return value;
  }
  return undefined;
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

main();

