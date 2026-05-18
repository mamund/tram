'use strict';

/**
 * assertions.js v0.1
 *
 * Dependency-free assertion engine for the HTTP API test runner.
 *
 * Responsibilities:
 * - Evaluate HTTP status assertions
 * - Evaluate HTTP header assertions
 * - Evaluate JSON body assertions
 * - Support simple JSONPath-like traversal
 * - Support collection assertions through `each`
 * - Return normalized assertion result objects
 */

function evaluateExpectations({ expect = {}, response = {} }) {
  const results = [];

  if (Object.prototype.hasOwnProperty.call(expect, 'status')) {
    results.push(assertStatus(expect.status, response.status));
  }

  if (Array.isArray(expect.headers)) {
    for (const assertion of expect.headers) {
      results.push(assertHeader(assertion, response.headers || {}));
    }
  }

  if (Array.isArray(expect.body)) {
    for (const assertion of expect.body) {
      results.push(...assertJson(assertion, response.body));
    }
  }

  return results;
}

function assertStatus(expected, actual) {
  const passed = actual === expected;

  return {
    passed,
    type: 'status',
    target: 'http',
    expected,
    actual,
    message: passed
      ? `Status is ${expected}.`
      : `Expected status ${expected}, got ${actual}.`
  };
}

function assertHeader(assertion, headers) {
  const name = assertion.name;
  const normalizedName = String(name || '').toLowerCase();
  const actual = getHeader(headers, normalizedName);

  if (assertion.exists === true) {
    const passed = actual !== undefined;
    return {
      passed,
      type: 'exists',
      target: 'header',
      name,
      expected: true,
      actual,
      message: passed
        ? `Header ${name} exists.`
        : `Expected header ${name} to exist.`
    };
  }

  if (Object.prototype.hasOwnProperty.call(assertion, 'equals')) {
    const expected = assertion.equals;
    const passed = actual === expected;
    return {
      passed,
      type: 'equals',
      target: 'header',
      name,
      expected,
      actual,
      message: passed
        ? `Header ${name} equals "${expected}".`
        : `Expected header ${name} to equal "${expected}", got "${actual}".`
    };
  }

  if (Object.prototype.hasOwnProperty.call(assertion, 'contains')) {
    const expected = assertion.contains;
    const passed = typeof actual === 'string' && actual.includes(expected);

    return {
      passed,
      type: 'contains',
      target: 'header',
      name,
      expected,
      actual,
      message: passed
        ? `Header ${name} contains "${expected}".`
        : `Expected header ${name} to contain "${expected}", got "${actual}".`
    };
  }

  return unsupportedAssertion('header', assertion, `Unsupported header assertion for ${name}.`);
}

function assertJson(assertion, body, basePath = '$') {
  const path = assertion.path || '$';
  const absolutePath = path === '$' ? basePath : joinPath(basePath, path);
  const value = selectPath(body, path);
  const results = [];

  if (assertion.exists === true) {
    const passed = value.exists;
    results.push({
      passed,
      type: 'exists',
      target: 'json',
      path: absolutePath,
      expected: true,
      actual: value.value,
      message: passed
        ? `${absolutePath} exists.`
        : `Expected ${absolutePath} to exist.`
    });
  }

  if (Object.prototype.hasOwnProperty.call(assertion, 'equals')) {
    const expected = assertion.equals;
    const actual = value.value;
    const passed = value.exists && deepEqual(actual, expected);
    results.push({
      passed,
      type: 'equals',
      target: 'json',
      path: absolutePath,
      expected,
      actual,
      message: passed
        ? `${absolutePath} equals ${formatValue(expected)}.`
        : `Expected ${absolutePath} to equal ${formatValue(expected)}, got ${formatValue(actual)}.`
    });
  }

  if (Object.prototype.hasOwnProperty.call(assertion, 'contains')) {
    const expected = assertion.contains;
    const actual = value.value;
    const passed = value.exists && contains(actual, expected);
    results.push({
      passed,
      type: 'contains',
      target: 'json',
      path: absolutePath,
      expected,
      actual,
      message: passed
        ? `${absolutePath} contains ${formatValue(expected)}.`
        : `Expected ${absolutePath} to contain ${formatValue(expected)}, got ${formatValue(actual)}.`
    });
  }

  if (Array.isArray(assertion.oneOf)) {
    const expected = assertion.oneOf;
    const actual = value.value;
    const passed = value.exists && expected.some((item) => deepEqual(item, actual));
    results.push({
      passed,
      type: 'oneOf',
      target: 'json',
      path: absolutePath,
      expected,
      actual,
      message: passed
        ? `${absolutePath} is one of ${expected.map(formatValue).join(', ')}.`
        : `Expected ${absolutePath} to be one of ${expected.map(formatValue).join(', ')}, got ${formatValue(actual)}.`
    });
  }

  if (isRangeAssertion(assertion.range)) {
    const expected = normalizeRange(assertion.range);
    const actual = value.value;
    results.push(assertRange({
      actual,
      expected,
      exists: value.exists,
      path: absolutePath,
      type: 'range'
    }));
  }

  if (assertion.isArray === true) {
    const actual = value.value;
    const passed = Array.isArray(actual);
    results.push({
      passed,
      type: 'isArray',
      target: 'json',
      path: absolutePath,
      expected: true,
      actual,
      message: passed
        ? `${absolutePath} is an array.`
        : `Expected ${absolutePath} to be an array.`
    });
  }

  if (Array.isArray(assertion.hasProperties)) {
    const actual = value.value;
    results.push(assertHasProperties({
      actual,
      expected: assertion.hasProperties,
      path: absolutePath,
      type: 'hasProperties'
    }));
  }

  if (Object.prototype.hasOwnProperty.call(assertion, 'minLength')) {
    const expected = assertion.minLength;
    const actual = value.value;
    const actualLength = actual != null && typeof actual.length === 'number'
      ? actual.length
      : undefined;
    const passed = typeof actualLength === 'number' && actualLength >= expected;

    results.push({
      passed,
      type: 'minLength',
      target: 'json',
      path: absolutePath,
      expected,
      actual: actualLength,
      message: passed
        ? `${absolutePath} length is at least ${expected}.`
        : `Expected ${absolutePath} length to be at least ${expected}, got ${actualLength}.`
    });
  }

  if (assertion.each) {
    const actual = value.value;

    if (!Array.isArray(actual)) {
      results.push({
        passed: false,
        type: 'each',
        target: 'json',
        path: absolutePath,
        expected: 'array',
        actual,
        message: `Expected ${absolutePath} to be an array for each assertion.`
      });
    } else {
      actual.forEach((item, index) => {
        const itemPath = `${absolutePath}[${index}]`;
        results.push(...assertEach(assertion.each, item, itemPath));
      });
    }
  }

  if (results.length === 0) {
    results.push(unsupportedAssertion('json', assertion, `Unsupported JSON assertion at ${absolutePath}.`));
  }

  return results;
}

function assertEach(eachAssertion, item, itemPath) {
  const results = [];

  if (Array.isArray(eachAssertion.hasProperties)) {
    results.push(assertHasProperties({
      actual: item,
      expected: eachAssertion.hasProperties,
      path: itemPath,
      type: 'each.hasProperties'
    }));
  }

  if (eachAssertion.property) {
    const propertyPath = `${itemPath}.${eachAssertion.property}`;
    const actual = item != null ? item[eachAssertion.property] : undefined;
    const exists = actual !== undefined;

    if (Object.prototype.hasOwnProperty.call(eachAssertion, 'equals')) {
      const expected = eachAssertion.equals;
      const passed = exists && deepEqual(actual, expected);
      results.push({
        passed,
        type: 'each.property.equals',
        target: 'json',
        path: propertyPath,
        expected,
        actual,
        message: passed
          ? `${propertyPath} equals ${formatValue(expected)}.`
          : `Expected ${propertyPath} to equal ${formatValue(expected)}, got ${formatValue(actual)}.`
      });
    }

    if (Object.prototype.hasOwnProperty.call(eachAssertion, 'contains')) {
      const expected = eachAssertion.contains;
      const passed = exists && contains(actual, expected);
      results.push({
        passed,
        type: 'each.property.contains',
        target: 'json',
        path: propertyPath,
        expected,
        actual,
        message: passed
          ? `${propertyPath} contains ${formatValue(expected)}.`
          : `Expected ${propertyPath} to contain ${formatValue(expected)}, got ${formatValue(actual)}.`
      });
    }

    if (Array.isArray(eachAssertion.oneOf)) {
      const expected = eachAssertion.oneOf;
      const passed = exists && expected.some((value) => deepEqual(value, actual));
      results.push({
        passed,
        type: 'each.property.oneOf',
        target: 'json',
        path: propertyPath,
        expected,
        actual,
        message: passed
          ? `${propertyPath} is one of ${expected.map(formatValue).join(', ')}.`
          : `Expected ${propertyPath} to be one of ${expected.map(formatValue).join(', ')}, got ${formatValue(actual)}.`
      });
    }

    if (isRangeAssertion(eachAssertion.range)) {
      const expected = normalizeRange(eachAssertion.range);
      results.push(assertRange({
        actual,
        expected,
        exists,
        path: propertyPath,
        type: 'each.property.range'
      }));
    }
  }

  if (eachAssertion.path) {
    results.push(...assertJson(eachAssertion, item, itemPath));
  }

  if (results.length === 0) {
    results.push(unsupportedAssertion('json', eachAssertion, `Unsupported each assertion at ${itemPath}.`));
  }

  return results;
}

function assertRange({ actual, expected, exists, path, type }) {
  const isNumber = typeof actual === 'number' && Number.isFinite(actual);
  const hasMin = Object.prototype.hasOwnProperty.call(expected, 'min');
  const hasMax = Object.prototype.hasOwnProperty.call(expected, 'max');

  let passed = exists && isNumber;

  if (passed && hasMin) {
    passed = actual >= expected.min;
  }

  if (passed && hasMax) {
    passed = actual <= expected.max;
  }

  return {
    passed,
    type,
    target: 'json',
    path,
    expected,
    actual,
    message: passed
      ? `${path} is ${rangeDescription(expected)}.`
      : rangeFailureMessage({ actual, expected, exists, isNumber, path })
  };
}

function isRangeAssertion(range) {
  return range && typeof range === 'object' && !Array.isArray(range)
    && (Object.prototype.hasOwnProperty.call(range, 'min')
      || Object.prototype.hasOwnProperty.call(range, 'max'));
}

function normalizeRange(range) {
  const normalized = {};

  if (Object.prototype.hasOwnProperty.call(range, 'min')) {
    normalized.min = range.min;
  }

  if (Object.prototype.hasOwnProperty.call(range, 'max')) {
    normalized.max = range.max;
  }

  return normalized;
}

function rangeDescription(range) {
  const hasMin = Object.prototype.hasOwnProperty.call(range, 'min');
  const hasMax = Object.prototype.hasOwnProperty.call(range, 'max');

  if (hasMin && hasMax) {
    return `between ${range.min} and ${range.max}`;
  }

  if (hasMin) {
    return `at least ${range.min}`;
  }

  if (hasMax) {
    return `at most ${range.max}`;
  }

  return 'within range';
}

function rangeFailureMessage({ actual, expected, exists, isNumber, path }) {
  if (!exists) {
    return `Expected ${path} to be ${rangeDescription(expected)}, but the path does not exist.`;
  }

  if (!isNumber) {
    return `Expected ${path} to be numeric and ${rangeDescription(expected)}, got ${formatValue(actual)}.`;
  }

  return `Expected ${path} to be ${rangeDescription(expected)}, got ${formatValue(actual)}.`;
}

function assertHasProperties({ actual, expected, path, type }) {
  const missing = expected.filter((property) => {
    return !Object.prototype.hasOwnProperty.call(Object(actual || {}), property);
  });
  const passed = missing.length === 0;

  return {
    passed,
    type,
    target: 'json',
    path,
    expected,
    actual,
    message: passed
      ? `${path} has properties ${expected.join(', ')}.`
      : `Expected ${path} to have properties ${expected.join(', ')}. Missing: ${missing.join(', ')}.`
  };
}

function getHeader(headers, name) {
  if (!headers) return undefined;

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === name) {
      return Array.isArray(value) ? value.join(', ') : String(value);
    }
  }

  return undefined;
}

function selectPath(source, path) {
  if (path === '$') {
    return { exists: source !== undefined, value: source };
  }

  if (typeof path !== 'string' || !path.startsWith('$.')) {
    return { exists: false, value: undefined };
  }

  const tokens = tokenizePath(path);
  let current = source;

  for (const token of tokens) {
    if (current === null || current === undefined) {
      return { exists: false, value: undefined };
    }

    if (typeof token === 'number') {
      if (!Array.isArray(current) || token < 0 || token >= current.length) {
        return { exists: false, value: undefined };
      }
      current = current[token];
    } else {
      if (!Object.prototype.hasOwnProperty.call(Object(current), token)) {
        return { exists: false, value: undefined };
      }
      current = current[token];
    }
  }

  return { exists: true, value: current };
}

function tokenizePath(path) {
  const stripped = path.replace(/^\$\.?/, '');
  if (!stripped) return [];

  const tokens = [];
  const parts = stripped.split('.');

  for (const part of parts) {
    const re = /([^\[\]]+)|\[(\d+)\]/g;
    let match;

    while ((match = re.exec(part)) !== null) {
      if (match[1]) tokens.push(match[1]);
      if (match[2]) tokens.push(Number(match[2]));
    }
  }

  return tokens;
}

function contains(actual, expected) {
  if (typeof actual === 'string') {
    return actual.includes(String(expected));
  }

  if (Array.isArray(actual)) {
    return actual.some((item) => deepEqual(item, expected));
  }

  return false;
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function joinPath(basePath, path) {
  if (basePath === '$') return path;
  if (path === '$') return basePath;
  if (path.startsWith('$.')) return `${basePath}.${path.slice(2)}`;
  return `${basePath}.${path}`;
}

function formatValue(value) {
  if (typeof value === 'string') return `"${value}"`;
  return JSON.stringify(value);
}

function unsupportedAssertion(target, assertion, message) {
  return {
    passed: false,
    type: 'unsupported',
    target,
    expected: assertion,
    actual: undefined,
    message
  };
}

module.exports = {
  evaluateExpectations,
  assertStatus,
  assertHeader,
  assertJson,
  selectPath,
  tokenizePath
};

