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
    "title": "Buy milk",
    "status": "open"
  },
  "task.missingTitle": {
    "status": "open"
  },
  "task.invalidStatus": {
    "title": "Buy milk",
    "status": "bogus"
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
  "title": "Buy milk",
  "status": "open"
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

## Example manifest

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

  "config": {
    "baseUrl": "http://localhost:3000",
    "timeoutMs": 5000,
    "defaultHeaders": {
      "accept": "application/json"
    }
  },

  "data": {
    "task.valid": {
      "id": "${randomId}",
      "title": "Buy milk",
      "status": "open"
    },

    "task.missingTitle": {
      "id": "${randomId}",
      "status": "open"
    },

    "task.invalidStatus": {
      "id": "${randomId}",
      "title": "Buy milk",
      "status": "bogus"
    },

    "filters.openTasks": {
      "status": "open"
    }
  },

  "tests": [
    {
      "name": "List tasks",
      "type": "happy-path",
      "method": "GET",
      "path": "/tasks",
      "expect": {
        "status": 200,
        "headers": [
          {
            "name": "content-type",
            "contains": "application/json"
          }
        ],
        "json": [
          {
            "path": "$.items",
            "isArray": true
          },
          {
            "path": "$.items",
            "each": {
              "hasProperties": ["id", "title", "status"]
            }
          }
        ]
      }
    },

    {
      "name": "Create task",
      "type": "happy-path",
      "method": "POST",
      "path": "/tasks",
      "headers": {
        "content-type": "application/json"
      },
      "body": "$data.task.valid",
      "expect": {
        "status": 201,
        "json": [
          {
            "path": "$.id",
            "exists": true
          },
          {
            "path": "$.title",
            "equals": "Buy milk"
          },
          {
            "path": "$.status",
            "equals": "open"
          }
        ]
      }
    },

    {
      "name": "Reject task with missing title",
      "type": "sad-path",
      "method": "POST",
      "path": "/tasks",
      "headers": {
        "content-type": "application/json"
      },
      "body": "$data.task.missingTitle",
      "expect": {
        "status": 400,
        "headers": [
          {
            "name": "content-type",
            "exists": true
          }
        ],
        "json": [
          {
            "path": "$",
            "exists": true
          }
        ]
      }
    },

    {
      "name": "Filter open tasks",
      "type": "happy-path",
      "method": "GET",
      "path": "/tasks",
      "query": "$data.filters.openTasks",
      "expect": {
        "status": 200,
        "json": [
          {
            "path": "$.items",
            "isArray": true
          },
          {
            "path": "$.items",
            "each": {
              "property": "status",
              "equals": "open"
            }
          }
        ]
      }
    }
  ]
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

