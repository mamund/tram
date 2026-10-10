'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateExpectations, selectPath, tokenizePath } = require('../lib/assertions');

const response = {
  status: 200,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Trace': 'abc-123' },
  body: {
    name: 'Sample task', active: true, count: 3, empty: null,
    tags: ['api', 'testing'],
    items: [
      { id: 'a', status: 'active', score: 2 },
      { id: 'b', status: 'pending', score: 5 }
    ],
    attributes: { first: { enabled: true }, second: { enabled: false } }
  }
};

function check(expect, expectedPass, expectedType) {
  const results = evaluateExpectations({ expect, response });
  assert.ok(results.length > 0, 'assertion must produce evidence');
  assert.equal(results.every(r => r.passed), expectedPass, JSON.stringify(results));
  if (expectedType) assert.ok(results.some(r => r.type === expectedType), JSON.stringify(results));
  for (const result of results) {
    assert.equal(typeof result.message, 'string');
    assert.equal(typeof result.passed, 'boolean');
  }
  return results;
}

function body(rule, passes, type) { return check({ body: [rule] }, passes, type); }

test('status assertions accept exact status and reject mismatch', () => {
  check({ status: 200 }, true, 'status');
  check({ status: 201 }, false, 'status');
});

test('headers are case-insensitive and support exists, equals, contains', () => {
  check({ headers: [{ name: 'content-type', exists: true }] }, true, 'exists');
  check({ headers: [{ name: 'CONTENT-TYPE', contains: 'json' }] }, true, 'contains');
  check({ headers: [{ name: 'x-trace', equals: 'abc-123' }] }, true, 'equals');
  check({ headers: [{ name: 'x-missing', exists: true }] }, false);
  check({ headers: [{ name: 'x-trace', equals: 'wrong' }] }, false);
  check({ headers: [{ name: 'x-trace', contains: 'wrong' }] }, false);
});

test('path traversal supports root, nested fields, indexes and missing fields', () => {
  assert.deepEqual(tokenizePath('$.items[1].id'), ['items', 1, 'id']);
  assert.equal(selectPath(response.body, '$.items[1].id').value, 'b');
  assert.equal(selectPath(response.body, '$').exists, true);
  assert.equal(selectPath(response.body, '$.items[9].id').exists, false);
  body({ path: '$.items[0].id', equals: 'a' }, true, 'equals');
  body({ path: '$.items[9].id', exists: false }, true, 'exists');
  body({ path: '$.items[9].id', exists: true }, false, 'exists');
});

test('JSON equality, membership and type produce positive and negative results', () => {
  body({ path: '$.active', equals: true }, true);
  body({ path: '$.active', equals: false }, false);
  body({ path: '$.empty', type: 'null' }, true);
  body({ path: '$.items', type: 'array' }, true);
  body({ path: '$.name', type: 'number' }, false);
  body({ path: '$.count', oneOf: [1, 3, 5] }, true);
  body({ path: '$.count', oneOf: [1, 2] }, false);
  body({ path: '$.name', contains: 'task' }, true);
  body({ path: '$.tags', contains: 'api' }, true);
  body({ path: '$.tags', contains: 'missing' }, false);
});

test('array membership operators cover passing and failing cases', () => {
  for (const [operator, values, passes] of [
    ['anyOf', ['missing', 'api'], true],
    ['anyOf', ['missing'], false],
    ['allOf', ['api', 'testing'], true],
    ['allOf', ['api', 'missing'], false],
    ['noneOf', ['missing'], true],
    ['noneOf', ['api'], false]
  ]) body({ path: '$.tags', [operator]: values }, passes, operator);
});

test('range and length check boundaries and invalid values', () => {
  body({ path: '$.count', range: { min: 3, max: 3 } }, true, 'range');
  body({ path: '$.count', range: { min: 4 } }, false, 'range');
  body({ path: '$.name', range: { min: 1 } }, false, 'range');
  body({ path: '$.tags', isArray: true }, true, 'isArray');
  body({ path: '$.name', isArray: true }, false, 'isArray');
  body({ path: '$.tags', minLength: 2 }, true, 'minLength');
  body({ path: '$.tags', minLength: 3 }, false, 'minLength');
  body({ path: '$.tags', length: 2 }, true, 'length');
  body({ path: '$.tags', length: { min: 3 } }, false, 'length');
});

test('hasProperties checks object shape', () => {
  body({ path: '$', hasProperties: ['name', 'items'] }, true, 'hasProperties');
  body({ path: '$', hasProperties: ['name', 'missing'] }, false, 'hasProperties');
});

test('each evaluates every item and reports a failed member', () => {
  const ok = body({ path: '$.items', each: { property: 'status', oneOf: ['active', 'pending'] } }, true);
  assert.equal(ok.length, 2);
  assert.deepEqual(ok.map(r => r.path), ['$.items[0].status', '$.items[1].status']);
  const bad = body({ path: '$.items', each: { property: 'score', range: { max: 3 } } }, false);
  assert.deepEqual(bad.map(r => r.passed), [true, false]);
  body({ path: '$.name', each: { property: 'status', exists: true } }, false, 'each');
  body({ path: '$.items', each: { hasProperties: ['id', 'status'] } }, true);
});

test('optional missing properties within each are accepted', () => {
  const results = body({ path: '$.items', each: { property: 'description', type: 'string', optional: true } }, true);
  assert.equal(results.length, 2);
  assert.ok(results.every(r => r.type === 'each.property.optional'));
});

test('eachProperty traverses map values', () => {
  const ok = body({ path: '$.attributes', eachProperty: { path: '$.enabled', type: 'boolean' } }, true);
  assert.equal(ok.length, 2);
  body({ path: '$.attributes', eachProperty: { path: '$.enabled', equals: true } }, false);
  body({ path: '$.items', eachProperty: { path: '$', type: 'object' } }, false, 'eachProperty');
});

test('unsupported assertions return explicit failures', () => {
  body({ path: '$.name', unknownOperator: true }, false, 'unsupported');
  check({ headers: [{ name: 'x-trace', unknownOperator: true }] }, false, 'unsupported');
});
