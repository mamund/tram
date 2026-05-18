# HTTP API test manifest v0.1

## Purpose

The manifest describes behavioral HTTP API tests in a portable JSON format.

The runner reads this manifest, executes HTTP requests, evaluates assertions, and reports results.

## File name

Recommended default:

```text
api-tests.json
```

## Top-level shape

```json
{
  "name": "Task Management API Tests",
  "manifestVersion": "0.1",
  "version": "1.0.0",
  "description": "Defines a set of tests for a task-management API.",
  "author": "Mike Amundsen",
  "created": "2026-05-16",
  "updated": "2026-05-16",
  "tags": ["tasks", "http", "behavioral-testing"],
  "config": {},
  "data": {},
  "tests": []
}
```

## Top-level fields

### `name`

Human-readable name for the test collection.

```json
"name": "Task Management API Tests"
```

### `manifestVersion`

Version of the manifest grammar/specification.

```json
"manifestVersion": "0.1"
```

The runner may use this value to check compatibility.

### `version`

Version of this specific test collection.

```json
"version": "1.0.0"
```

This value changes when the test collection itself changes.

### `description`

Optional human-readable description of the test collection.

```json
"description": "Defines a set of tests for a task-management API."
```

### `author`

Optional author or maintainer.

```json
"author": "Mike Amundsen"
```

### `created`

Optional creation date, using `YYYY-MM-DD`.

```json
"created": "2026-05-16"
```

### `updated`

Optional last-updated date, using `YYYY-MM-DD`.

```json
"updated": "2026-05-16"
```

### `tags`

Optional list of labels for organization and discovery.

```json
"tags": ["tasks", "http", "behavioral-testing"]
```

### `config`

Runtime configuration.

```json
"config": {
  "baseUrl": "http://localhost:3000",
  "timeoutMs": 5000,
  "defaultHeaders": {
    "accept": "application/json"
  }
}
```

Supported fields:

```text
baseUrl          required
timeoutMs        optional
defaultHeaders   optional
```

### `data`

Named test data used by requests.

```json
"data": {
  "task.valid": {
    "task": {
      "title": "Buy milk",
      "status": "open"
    }
  },
  "task.missingTitle": {
    "task": {
      "status": "open"
    }
  },
  "task.invalidStatus": {
    "task": {
      "title": "Buy milk",
      "status": "bogus"
    }
  },
  "filters.openTasks": {
    "status": "open"
  }
}
```

Data values may include simple generated tokens:

```text
${randomId}
${timestamp}
${uuid}
${randomEmail}
```

### `tests`

Ordered list of test cases.

```json
"tests": [
  {
    "name": "Create task",
    "method": "POST",
    "path": "/tasks",
    "body": "$data.task.valid",
    "expect": {
      "status": 201
    }
  }
]
```

## Test fields

### Required

```text
name
method
path
expect
```

### Optional

```text
id
description
type
tags
enabled
rationale
headers
query
body
bodyType
expect
```

### `id`

Optional stable identifier for reporting and tooling.

```json
"id": "task-create-valid"
```

### `tags`

Optional labels for filtering and organization.

```json
"tags": ["create", "happy-path"]
```

Defaults to an empty array.

### `enabled`

Optional execution switch.

```json
"enabled": true
```

If omitted, the runner assumes the test is enabled.

If set to `false`, the runner skips the test during execution.

Example:

```json
{
  "id": "task-missing-title",
  "name": "Reject task with missing title",
  "tags": ["create", "sad-path", "validation"],
  "enabled": true,
  "description": "A task cannot be created without a title.",
  "type": "sad-path",
  "rationale": "The API should reject incomplete task creation requests.",
  "method": "POST",
  "path": "/tasks",
  "body": "$data.task.missingTitle",
  "expect": {
    "status": 400
  }
}
```

## Request fields

### `method`

HTTP method.

```json
"method": "GET"
```

Supported initially:

```text
GET
POST
PUT
PATCH
DELETE
```

### `path`

Path relative to `config.baseUrl`.

```json
"path": "/tasks"
```

Path values may use variables later:

```json
"path": "/tasks/${taskId}"
```

### `query`

Query parameters.

```json
"query": "$data.filters.openTasks"
```

or:

```json
"query": {
  "status": "open",
  "limit": 10
}
```

### `headers`

Request-specific headers.

```json
"headers": {
  "content-type": "application/json"
}
```

These override `config.defaultHeaders`.

### `body`

Request body.

```json
"body": "$data.task.valid"
```

or inline:

```json
"body": {
  "task": {
    "title": "Buy milk",
    "status": "open"
  }
}
```

### `bodyType`

Controls request body encoding.

```json
"bodyType": "json"
```

Supported values:

```text
json
form
text
```

Behavior:

```text
json
→ JSON.stringify(body)
→ content-type: application/json

form
→ URLSearchParams(body)
→ content-type: application/x-www-form-urlencoded

text
→ String(body)
→ content-type: text/plain
```

If omitted, the runner assumes:

```json
"bodyType": "json"
```

Example using form encoding:

```json
{
  "name": "Update task status",
  "method": "PUT",
  "path": "/tasks/task-1/status",
  "bodyType": "form",
  "body": "$data.task.updateStatus",
  "expect": {
    "status": 200
  }
}
```

## Expectations

### Status

```json
"expect": {
  "status": 200
}
```

### Headers

```json
"expect": {
  "headers": [
    {
      "name": "content-type",
      "exists": true
    },
    {
      "name": "content-type",
      "contains": "application/json"
    }
  ]
}
```

Supported header assertions:

```text
exists
equals
contains
```

## JSON body assertions

JSON assertions are expressed as an array.

```json
"expect": {
  "json": [
    {
      "path": "$.id",
      "exists": true
    },
    {
      "path": "$.status",
      "equals": "open"
    }
  ]
}
```

Supported JSON assertions:

```text
exists
equals
contains
oneOf
isArray
hasProperties
minLength
each
```

### `exists`

```json
{
  "path": "$.id",
  "exists": true
}
```

### `equals`

```json
{
  "path": "$.status",
  "equals": "open"
}
```

### `contains`

For strings or arrays.

```json
{
  "path": "$.message",
  "contains": "Missing title"
}
```

### `oneOf`

Checks that a value belongs to an allowed set.

```json
{
  "path": "$.status",
  "oneOf": ["active", "pending", "completed"]
}
```

### `isArray`

```json
{
  "path": "$.items",
  "isArray": true
}
```

### `hasProperties`

```json
{
  "path": "$.task",
  "hasProperties": ["id", "title", "status"]
}
```

### `minLength`

For arrays or strings.

```json
{
  "path": "$.items",
  "isArray": true,
  "minLength": 1
}
```

### `each`

Runs assertions against every item in an array.

```json
{
  "path": "$.items",
  "each": {
    "hasProperties": ["id", "title", "status"]
  }
}
```

Property check on each item:

```json
{
  "path": "$.items",
  "each": {
    "property": "status",
    "equals": "open"
  }
}
```

Allowed-value check on each item:

```json
{
  "path": "$.items",
  "each": {
    "property": "status",
    "oneOf": ["active", "pending", "completed"]
  }
}
```

Nested path check on each item:

```json
{
  "path": "$.items",
  "each": {
    "path": "$.links",
    "isArray": true
  }
}
```

## Assertion result model

The runner evaluates assertions and produces normalized assertion results.

## Assertion result

Each assertion produces one or more assertion results.

Example:

```json
{
  "passed": false,
  "type": "equals",
  "target": "json",
  "path": "$.status",
  "expected": "open",
  "actual": "closed",
  "message": "Expected $.status to equal \"open\", got \"closed\"."
}
```

Header example:

```json
{
  "passed": true,
  "type": "contains",
  "target": "header",
  "name": "content-type",
  "expected": "application/json",
  "actual": "application/json; charset=utf-8",
  "message": "Header content-type contains \"application/json\"."
}
```

Collection example using `each`:

```json
{
  "passed": false,
  "type": "each.hasProperties",
  "target": "json",
  "path": "$.items[2]",
  "expected": ["id", "title", "status"],
  "actual": {
    "id": "123",
    "title": "Buy milk"
  },
  "message": "Expected $.items[2] to have properties id, title, status. Missing: status."
}
```

## Test result model

A test result wraps request execution details and assertion results.

```json
{
  "id": "task-list",
  "name": "List tasks",
  "enabled": true,
  "passed": false,
  "method": "GET",
  "path": "/tasks",
  "status": 200,
  "durationMs": 42,
  "assertions": [
    {
      "passed": true,
      "type": "status",
      "target": "http",
      "expected": 200,
      "actual": 200,
      "message": "Status is 200."
    },
    {
      "passed": false,
      "type": "each.hasProperties",
      "target": "json",
      "path": "$.items[2]",
      "expected": ["id", "title", "status"],
      "actual": {
        "id": "123",
        "title": "Buy milk"
      },
      "message": "Expected $.items[2] to have properties id, title, status. Missing: status."
    }
  ]
}
```

## Suite result model

The machine-readable report wraps all test results.

```json
{
  "name": "Task Management API Tests",
  "manifestVersion": "0.1",
  "version": "1.0.0",
  "summary": {
    "total": 4,
    "passed": 3,
    "failed": 1,
    "skipped": 0
  },
  "results": []
}
```

## Deferred from v0.1

These are useful, but should wait:

```text
capture variables from responses
setup/teardown
test dependencies
auth helpers
media-type profiles
schema validation
custom scripting
external data files
parallel execution
```

