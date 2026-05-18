# TRAM Quick Start

This guide walks through running the TRAM sample project and executing the included behavioral API tests.

The goal is not only to run the tests, but to understand the relationship between:

* the sample API
* the manifest
* the assertions
* the runner output

## Requirements

TRAM currently requires:

```text
Node.js 18+
```

No external libraries or framework dependencies are required.

## Clone the repository

```bash
git clone https://github.com/mamund/2026-05-tram.git
cd 2026-05-tram
```

## Start the sample API

In one terminal window:

```bash
node index.js
```

Expected output:

```text
Listening on port 3000
```

The sample API should now be running locally.

## Run the sample test suite

In another terminal window:

```bash
node api-test-runner.js api-tests.json
```

Expected output:

```text
Task Management API Tests

✓ Get API root
✓ List tasks
✓ Get single task
✓ Reject unknown task lookup
✓ Create task
✓ Reject task creation without title
✓ Reject invalid task status
✓ Update task status
✓ Filter tasks by active status

Summary: 9 passed, 0 failed, 0 skipped, 9 total
```

## Run in verbose mode

Verbose mode prints all assertion results.

```bash
node api-test-runner.js api-tests.json --verbose
```

This helps reveal:

* assertion evaluation
* JSON path behavior
* collection assertions
* failure messages

## Generate a machine-readable report

```bash
node api-test-runner.js api-tests.json --report results.json
```

This generates a detailed JSON report containing:

* request details
* response details
* assertion results
* pass/fail summaries

## Inspect the manifest

Open:

```text
api-tests.json
```

The manifest defines:

* test cases
* request configuration
* test data
* assertions
* expected behavior

Key sections:

```text
config
data
tests
expect
```

## Inspect the assertion model

Open:

```text
assertions.js
```

Current assertion support includes:

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
```

Example collection assertion:

```json
{
  "path": "$",
  "each": {
    "property": "status",
    "oneOf": ["active", "pending", "completed"]
  }
}
```

## Inspect body encoding behavior

TRAM currently supports:

```text
json
form
text
```

Example:

```json
{
  "method": "PUT",
  "path": "/tasks/task-1/status",
  "bodyType": "form",
  "body": "$data.task.updateStatus"
}
```

## Try modifying a test

One of the fastest ways to understand TRAM is to intentionally break something.

Suggested experiments:

### Change an expected value

Change:

```json
"equals": "active"
```

to:

```json
"equals": "closed"
```

Then rerun the suite.

### Disable a test

Add:

```json
"enabled": false
```

to a test.

Then rerun the suite.

### Break a request body

Remove a required property from a POST request body.

Then rerun the suite.

These experiments help reveal:

* behavioral expectations
* assertion failures
* request construction
* manifest ergonomics

## Project philosophy

TRAM emphasizes:

* behavioral API testing
* readable manifests
* low-noise reporting
* explicit configuration
* minimal hidden behavior
* augmentation over automation

The long-term direction includes an AI Coaching layer that helps users:

* discover API behaviors
* identify test candidates
* reason about happy and sad paths
* construct manifests collaboratively
* understand behavioral API testing concepts

## Next steps

Recommended files to explore:

```text
README.md
api-tests.json
assertions.js
api-test-runner.js
```

Recommended next experiments:

* add new sad-path tests
* add filtering tests
* add new assertions
* improve reporting
* explore manifest ergonomics
