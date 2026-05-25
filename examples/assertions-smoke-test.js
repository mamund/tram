// assertions-smoke-test.js
'use strict';

const { evaluateExpectations } = require('../lib/assertions');

const fakeListResponse = {
  status: 200,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'content-language': 'fr, en'
  },
  body: [
    {
      id: 'task-1',
      title: 'Initial Task',
      status: 'active',
      priority: 3,
      amount: -10,
      assignedUser: 'alice',
      description: "This is a description",
      _links: {
        self: { href: '/tasks/task-1', method: 'GET' },
        updateStatus: { href: '/tasks/task-1/status', method: 'PUT' }
      }
    }
  ]
};

const expect = {
  status: 200,
  headers: [
    { name: 'content-type', contains: 'application/json' },
    { name: 'content-language', contains: 'en' }
  ],
  body: [
    { path: '$', isArray: true },
    { path: '$', minLength: 1 },
    {
      path: '$',
      each: {
        hasProperties: ['id', 'title', 'status', 'priority', 'assignedUser', '_links']
      }
    },
    {
      path: '$',
      each: {
        property: 'status',
        oneOf: ['active','pending','complete']
      }
    },
    {
      path: '$',
      each: {
        property: 'priority',
        range: {min:1, max:5}
      }
    },
    {
      path: '$',
      each: {
        property: 'amount',
        range: {min: -100}
      }
    },
    {
      path: '$',
      each: {
        property: 'description',
        type: 'string',
        optional: true
      }
    },
    {
      path: '$',
      each: {
        property: 'missing-property',
        type: 'string',
        optional: true
      }
    }
  ]
};

const results = evaluateExpectations({
  expect,
  response: fakeListResponse
});

for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.message}`);
}

const failed = results.filter(r => !r.passed).length;

console.log(`\nSummary: ${results.length - failed} passed, ${failed} failed`);

process.exit(failed > 0 ? 1 : 0);
