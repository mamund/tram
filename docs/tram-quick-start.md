# TRAM Quick Start

This guide walks through running the TRAM sample project and inspecting the behavioral testing workflow.

The goal is not only to execute the sample tests, but to understand the relationship between:

* the sample API
* the manifest
* the assertions
* the runner
* the resulting behavioral model

TRAM treats API testing as behavioral modeling rather than framework scripting.

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

## Understand the sample workflow

The sample project follows a simple execution model:

```text
sample API
        ↓
TRAM manifest
        ↓
TRAM runner
        ↓
assertion results
```

The important artifact is the manifest:

```text
api-tests.json
```

The manifest contains:

* requests
* request bodies
* assertions
* expected behavior
* shared test data

The runner executes the manifest directly.

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

At this point, TRAM has:

* loaded the manifest
* executed each request
* evaluated assertions
* generated behavioral results

## Inspect the manifest

Open:

```text
api-tests.json
```

A typical test looks like this:

```json
{
  "name": "Create task",
  "method": "POST",
  "path": "/tasks",
  "body": "$data.task.valid",
  "expect": {
    "status": 201,
    "body": [
      {
        "path": "$.status",
        "equals": "active"
      }
    ]
  }
}
```

This test defines:

* an HTTP request
* request data
* expected response behavior

The important distinction is that assertions are directly inspectable.

Example:

```json
{
  "path": "$.status",
  "equals": "active"
}
```

This assertion is an explicit operational expectation.

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

This assertion verifies:

```text
all returned tasks expose valid status values
```

## Inspect request body handling

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

This allows the runner to work with APIs that expect different request encodings.

## Run in verbose mode

Verbose mode prints detailed assertion results.

```bash
node api-test-runner.js api-tests.json --verbose
```

Verbose mode helps reveal:

* assertion evaluation
* JSON path traversal
* collection assertions
* failure messages
* behavioral expectations

## Generate a machine-readable report

```bash
node api-test-runner.js api-tests.json --report results.json
```

This generates a detailed JSON report containing:

* request details
* response details
* assertion results
* pass/fail summaries

## Try intentionally breaking a test

One of the fastest ways to understand TRAM is to intentionally introduce a failure.

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

### Break a range assertion

Change:

```json
"range": {
  "min": 1,
  "max": 5
}
```

to:

```json
"range": {
  "min": 100
}
```

Then rerun the suite.

These experiments help reveal:

* behavioral expectations
* assertion failures
* request construction
* manifest ergonomics
* failure readability

## Understand the current philosophy

TRAM currently emphasizes:

* behavioral API testing
* explicit manifests
* readable assertions
* low-noise reporting
* predictable execution
* framework independence
* augmentation over automation

The current design intentionally avoids:

```text
custom scripting
schema engines
setup/teardown orchestration
hidden runtime behavior
```

## AI Coaching direction

The long-term direction includes an AI Coaching layer.

The AI Coach is intended to:

* inspect `server.js` and/or API Story documents
* identify API behaviors
* suggest candidate tests
* distinguish happy and sad paths
* review assertions collaboratively
* generate executable manifests

The goal is not one-shot generation alone.

The goal is helping users understand behavioral API testing while collaboratively constructing executable manifests.

## Recommended next steps

Recommended files to inspect:

```text
README.md
api-tests.json
assertions.js
api-test-runner.js
```

Recommended next experiments:

* add new sad-path tests
* add new range assertions
* add filtering tests
* add collection assertions
* improve reporting
* explore manifest ergonomics
* experiment with hypermedia assertions

