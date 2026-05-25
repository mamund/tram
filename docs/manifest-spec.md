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

## Runner execution

TRAM manifests are typically executed using the `tram` CLI.

Example:

```bash
tram api-tests.json
```

Verbose mode:

```bash
tram api-tests.json --verbose
```

Machine-readable report generation:

```bash
tram api-tests.json --report results.json
```

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

## Assertion modifiers

### optional

Marks a property-oriented assertion as optional.

If the property is absent:

```text
the assertion passes
```

If the property exists:

```text
the assertion must still validate successfully
```

Default:

```json
"optional": false
```

Examples:

```json
{
  "path": "$",
  "each": {
    "property": "description",
    "optional": true,
    "type": "string"
  }
}
```

This assertion means:

```text
"description" may be absent
if present, it must be a string
```

Optional assertions also work inside nested `eachProperty` assertions.

Example:

```json
{
  "path": "$._links",
  "eachProperty": {
    "path": "$.title",
    "optional": true,
    "type": "string"
  }
}
```

### Optional assertion scope

Optional assertions apply only to:

```text
property-oriented assertions
```

Current supported usage includes:

```text
each.property.equals
each.property.contains
each.property.oneOf
each.property.type
each.property.range
nested eachProperty path assertions
```

Optional assertions do not apply to:

```text
status
exists
isArray
each
eachProperty
hasProperties
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

