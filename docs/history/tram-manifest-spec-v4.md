# TRAM Manifest Specification v0.1

## Purpose

The TRAM manifest defines executable behavioral API tests.

The manifest is intentionally:

* human-readable
* machine-executable
* framework-independent
* declarative
* coaching-friendly

The manifest acts as both:

* executable configuration
* behavioral operational artifact

## File format

TRAM manifests are JSON documents.

Typical filename:

```text
api-tests.json
```

## Top-level structure

```json
{
  "manifestVersion": "0.1",
  "version": "1.0.0",
  "name": "Task Management API Tests",
  "description": "Defines a set of behavioral tests for a task-management API.",
  "author": "Mike Amundsen",
  "config": {
    "baseUrl": "http://localhost:3000"
  },
  "data": {},
  "tests": []
}
```

## Top-level properties

| Property          | Required | Description                                |
| ----------------- | -------- | ------------------------------------------ |
| `manifestVersion` | Yes      | Version of the TRAM manifest specification |
| `version`         | No       | Version of this manifest/test collection   |
| `name`            | Yes      | Human-readable test collection name        |
| `description`     | No       | Description of the collection              |
| `author`          | No       | Manifest author                            |
| `config`          | Yes      | Runner configuration                       |
| `data`            | No       | Shared request/test data                   |
| `tests`           | Yes      | Array of test definitions                  |

## Config structure

Example:

```json
"config": {
  "baseUrl": "http://localhost:3000",
  "timeoutMs": 5000,
  "defaultHeaders": {
    "accept": "application/json"
  }
}
```

### Config properties

| Property         | Required | Description                     |
| ---------------- | -------- | ------------------------------- |
| `baseUrl`        | Yes      | Base URL for all requests       |
| `timeoutMs`      | No       | Request timeout in milliseconds |
| `defaultHeaders` | No       | Headers added to all requests   |

## Test structure

Example:

```json
{
  "name": "Create task",
  "description": "Create a valid task.",
  "enabled": true,
  "tags": ["create", "happy-path"],
  "method": "POST",
  "path": "/tasks",
  "headers": {
    "content-type": "application/json"
  },
  "bodyType": "json",
  "body": "$data.task.valid",
  "expect": {
    "status": 201,
    "headers": [
      {
        "name": "content-type",
        "contains": "application/json"
      }
    ],
    "body": [
      {
        "path": "$.status",
        "equals": "active"
      }
    ]
  }
}
```

## Test properties

| Property      | Required | Description                                    |
| ------------- | -------- | ---------------------------------------------- |
| `name`        | Yes      | Human-readable test name                       |
| `description` | No       | Additional test explanation                    |
| `enabled`     | No       | Enable/disable test execution. Default: `true` |
| `tags`        | No       | Array of classification tags                   |
| `method`      | Yes      | HTTP method                                    |
| `path`        | Yes      | Request path                                   |
| `headers`     | No       | Request headers                                |
| `query`       | No       | Query parameter object                         |
| `bodyType`    | No       | Request body encoding                          |
| `body`        | No       | Request body or `$data` reference              |
| `expect`      | Yes      | Expected response assertions                   |

## bodyType

Supported values:

```text
json
form
text
```

Default:

```text
json
```

### JSON example

```json
"bodyType": "json"
```

Sends:

```http
content-type: application/json
```

### Form example

```json
"bodyType": "form"
```

Sends:

```http
content-type: application/x-www-form-urlencoded
```

The body is encoded using:

```text
URLSearchParams
```

### Text example

```json
"bodyType": "text"
```

## Shared data

The `data` section stores reusable request/test data.

Example:

```json
"data": {
  "task.valid": {
    "task": {
      "id": "${randomId}",
      "title": "Buy milk",
      "status": "active",
      "priority": 3,
      "assignedUser": "alice"
    }
  }
}
```

Referenced using:

```json
"body": "$data.task.valid"
```

## Stable run-scoped variables

TRAM supports stable run-scoped values initialized once per test run.

Example:

```json
"data": {
  "stableId": "${randomId}"
}
```

Then referenced later:

```json
"path": "/tasks/${data.stableId}"
```

The value remains stable throughout the current test run.

A new value is generated on the next execution.

## Runtime interpolation

Runtime interpolation supports inserting values into:

* request paths
* query values
* request bodies
* expectations

Example:

```json
"path": "/tasks/${data.stableId}"
```

Nested references are supported:

```json
"${data.filters.status}"
```

Example:

```json
"data": {
  "filters": {
    "status": "active"
  }
}
```

Then:

```json
"query": {
  "status": "${data.filters.status}"
}
```

Interpolation is also supported inside assertions.

Example:

```json
{
  "path": "$.id",
  "equals": "${data.stableId}"
}
```

## Runtime tokens

Current runtime token support:

```text
${randomId}
${timestamp}
${uuid}
${randomEmail}
```

Example:

```json
{
  "id": "${randomId}"
}
```

## Runtime token behavior

Runtime tokens behave differently depending on usage location.

### Direct usage

Tokens used directly inside requests are generated per encounter.

Example:

```json
{
  "id": "${randomId}"
}
```

Each occurrence generates a new value.

### Run-scoped initialization

Tokens inside `data` initialize once per test run.

Example:

```json
"data": {
  "stableId": "${randomId}"
}
```

All later references to:

```json
"${data.stableId}"
```

reuse the same generated value.

## Path and reference syntax

TRAM currently uses several related traversal/reference systems.

### Assertion traversal

Assertion paths operate on response bodies using JSONPath-like traversal.

Example:

```json
{
  "path": "$.status",
  "equals": "active"
}
```

### Manifest data lookup

Manifest data references retrieve reusable manifest-defined values.

Example:

```json
"body": "$data.task.valid"
```

### Runtime interpolation

Runtime interpolation inserts values into runtime request construction.

Example:

```json
"path": "/tasks/${data.stableId}"
```

## Expectations

Structure:

```json
"expect": {
  "status": 200,
  "headers": [],
  "body": []
}
```

### status

Simple HTTP status assertion.

Example:

```json
"status": 200
```

### headers

Array of header assertions.

Example:

```json
"headers": [
  {
    "name": "content-type",
    "contains": "application/json"
  }
]
```

### body

Array of response body assertions.

Body assertions operate on parsed JSON responses using JSONPath-like traversal.

Example:

```json
"body": [
  {
    "path": "$.status",
    "equals": "active"
  }
]
```

## Supported assertions

```text
exists
equals
contains
oneOf
range
isArray
hasProperties
minLength
each
eachProperty
```

## Assertion reference

### exists

Checks that a path exists.

Example:

```json
{
  "path": "$.id",
  "exists": true
}
```

### equals

Checks exact equality.

Example:

```json
{
  "path": "$.status",
  "equals": "active"
}
```

### contains

Checks substring or array membership.

Example:

```json
{
  "path": "$.title",
  "contains": "milk"
}
```

### oneOf

Checks that a value matches one of several allowed values.

Example:

```json
{
  "path": "$.status",
  "oneOf": ["active", "pending", "completed"]
}
```

### range

Checks that a numeric value falls within a valid range.

Example:

```json
{
  "path": "$.priority",
  "range": {
    "min": 1,
    "max": 5
  }
}
```

Rules:

```text
min optional
max optional
inclusive bounds
numeric values only
negative values supported
```

Examples:

Lower bound only:

```json
{
  "path": "$.temperature",
  "range": {
    "min": -40
  }
}
```

Upper bound only:

```json
{
  "path": "$.discountPercent",
  "range": {
    "max": 100
  }
}
```

### isArray

Checks that the selected value is an array.

Example:

```json
{
  "path": "$",
  "isArray": true
}
```

### hasProperties

Checks that an object contains required properties.

Example:

```json
{
  "path": "$",
  "hasProperties": [
    "id",
    "title",
    "status"
  ]
}
```

### minLength

Checks minimum array/string length.

Example:

```json
{
  "path": "$",
  "minLength": 1
}
```

### each

Iterates over all elements of an array and applies assertions to each item.

Example:

```json
{
  "path": "$",
  "each": {
    "hasProperties": [
      "id",
      "title",
      "status"
    ]
  }
}
```

Rules:

```text
each only operates on arrays
non-array values fail the assertion
```

### each.property

Applies assertions to a property on each array item.

Example:

```json
{
  "path": "$",
  "each": {
    "property": "status",
    "oneOf": [
      "active",
      "pending",
      "completed"
    ]
  }
}
```

### each.property.range

Applies range assertions to a property on each array item.

Example:

```json
{
  "path": "$",
  "each": {
    "property": "priority",
    "range": {
      "min": 1,
      "max": 5
    }
  }
}
```

### eachProperty

Iterates over all properties in an object map and applies assertions to each property value.

Example:

```json
{
  "path": "$._links",
  "eachProperty": {
    "hasProperties": [
      "href",
      "method"
    ]
  }
}
```

Rules:

```text
eachProperty only operates on object maps
arrays fail the assertion
primitive values fail the assertion
```

### Nested eachProperty assertions

Nested assertions are supported inside `eachProperty`.

Example:

```json
{
  "path": "$._links",
  "eachProperty": {
    "path": "$.method",
    "oneOf": [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE"
    ]
  }
}
```

### Nested collection + object-map assertions

`each` and `eachProperty` can be combined.

Example:

```json
{
  "path": "$",
  "each": {
    "path": "$._links",
    "eachProperty": {
      "hasProperties": [
        "href",
        "method"
      ]
    }
  }
}
```

This assertion verifies:

```text
for each record
  for each link relation
    ensure href and method exist
```

## Nested assertions

Nested path assertions are supported.

Example:

```json
{
  "path": "$",
  "each": {
    "path": "$._links.self",
    "hasProperties": [
      "href",
      "method"
    ]
  }
}
```

## Unsupported features

The current specification intentionally excludes:

```text
custom scripting
setup/teardown orchestration
parallel execution
schema engines
plugin systems
browser automation
```

## Design philosophy

The manifest design currently emphasizes:

```text
clarity
behavior visibility
predictability
reviewability
human understanding
low-noise execution
```

