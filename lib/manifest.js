'use strict';

const fs = require('fs');
const path = require('path');

const SUPPORTED_MANIFEST_VERSIONS = ['0.1', '0.2'];
const CURRENT_MANIFEST_VERSION = '0.2';

const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const VALID_BODY_TYPES = ['json', 'form', 'text'];

function validateManifestPath(manifestPath) {
  const fullPath = path.resolve(process.cwd(), manifestPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Manifest file not found: ${fullPath}`);
  }

  const stats = fs.statSync(fullPath);

  if (!stats.isFile()) {
    throw new Error(`Manifest path is not a file: ${fullPath}`);
  }

  return fullPath;
}

function loadManifest(manifestPath) {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read manifest JSON: ${error.message}`);
  }
}

function validateManifest(manifest) {
  const errors = [];

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    errors.push('Manifest must be a JSON object.');
  }

  if (
    manifest?.manifestVersion &&
    !SUPPORTED_MANIFEST_VERSIONS.includes(manifest.manifestVersion)
  ) {
    errors.push(
      `Unsupported manifestVersion ${manifest.manifestVersion}. ` +
      `Supported versions are ${SUPPORTED_MANIFEST_VERSIONS.join(', ')}.`
    );
  }

  if (!manifest?.config || typeof manifest.config !== 'object' || Array.isArray(manifest.config)) {
    errors.push('Manifest requires config object.');
  } else if (!manifest.config.baseUrl) {
    errors.push('Manifest requires config.baseUrl.');
  }

  if (!Array.isArray(manifest?.tests)) {
    errors.push('Manifest requires tests array.');
  } else {
    validateTests(manifest.tests, errors);
  }

  if (errors.length > 0) {
    throw new Error(`Manifest validation failed:\n- ${errors.join('\n- ')}`);
  }
}

function validateTests(tests, errors) {
  const seenIds = new Set();

  tests.forEach((test, index) => {
    const prefix = `tests[${index}]`;

    if (!test || typeof test !== 'object' || Array.isArray(test)) {
      errors.push(`${prefix} must be an object.`);
      return;
    }

    if (test.id) {
      if (seenIds.has(test.id)) {
        errors.push(`${prefix}.id duplicates "${test.id}".`);
      }
      seenIds.add(test.id);
    }

    if (!test.name) {
      errors.push(`${prefix} missing name.`);
    }

    if (!test.method) {
      errors.push(`${prefix} missing method.`);
    } else if (!VALID_METHODS.includes(String(test.method).toUpperCase())) {
      errors.push(`${prefix}.method unsupported HTTP method: ${test.method}.`);
    }

    if (!test.path) {
      errors.push(`${prefix} missing path.`);
    } else if (typeof test.path !== 'string') {
      errors.push(`${prefix}.path must be a string.`);
    }

    if (!test.expect || typeof test.expect !== 'object' || Array.isArray(test.expect)) {
      errors.push(`${prefix} missing expect object.`);
    }

    if (test.bodyType && !VALID_BODY_TYPES.includes(test.bodyType)) {
      errors.push(`${prefix}.bodyType unsupported value: ${test.bodyType}.`);
    }

    validateCapture(test.capture, `${prefix}.capture`, errors);
  });
}

function validateCapture(capture, prefix, errors) {
  if (capture === undefined) return;

  if (!capture || typeof capture !== 'object' || Array.isArray(capture)) {
    errors.push(`${prefix} must be an object.`);
    return;
  }

  for (const [name, spec] of Object.entries(capture)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      errors.push(`${prefix}.${name} has invalid capture name.`);
    }

    if (typeof spec === 'string') {
      validateCapturePath(spec, `${prefix}.${name}`, errors);
      continue;
    }

    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
      errors.push(`${prefix}.${name} must be a string or object.`);
      continue;
    }

    if (typeof spec.from !== 'string') {
      errors.push(`${prefix}.${name}.from must be a string.`);
    } else {
      validateCapturePath(spec.from, `${prefix}.${name}.from`, errors);
    }

    if (spec.optional !== undefined && typeof spec.optional !== 'boolean') {
      errors.push(`${prefix}.${name}.optional must be a boolean.`);
    }
  }
}

function validateCapturePath(capturePath, prefix, errors) {
  if (!capturePath) {
    errors.push(`${prefix} capture path must not be empty.`);
    return;
  }

  if (
    capturePath !== 'status' &&
    capturePath !== 'rawBody' &&
    !capturePath.startsWith('body.') &&
    !capturePath.startsWith('headers.')
  ) {
    errors.push(`${prefix} unsupported capture path: ${capturePath}.`);
  }
}

module.exports = { loadManifest, validateManifest, validateManifestPath, CURRENT_MANIFEST_VERSION };
