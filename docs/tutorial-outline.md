# Using TRAM for Behavioral API Testing

## Tutorial outline and writing guide

### Purpose

This document outlines a proposed hands-on tutorial for introducing TRAM as a behavioral API testing system.

The tutorial is intended to:

* introduce the TRAM execution model
* teach behavioral API testing concepts
* demonstrate manifest-driven testing workflows
* reinforce readable operational assertions
* gradually expand from simple tests to richer behavioral modeling

The tutorial is intentionally progressive.

The goal is not merely teaching syntax.

The goal is helping readers gradually recognize that the manifest itself becomes an executable behavioral model of the system.

## Target audience

The tutorial is intended for:

* API developers
* architects
* technical leads
* API designers
* engineers evaluating behavioral testing approaches

No prior TRAM knowledge is assumed.

## Target duration

Recommended pacing:

```text
15–20 minutes guided
30 minutes with experimentation
```

## Pedagogical structure

The tutorial intentionally follows a layered progression:

```text
run tests
    ↓
read tests
    ↓
modify tests
    ↓
model behavior
```

The tutorial should preserve a stable conceptual model throughout.

The same patterns introduced early should continue scaling into richer behavioral assertions later.

The progression should feel like:

```text
simple → deeper use of the same system
```

rather than:

```text
simple → completely different advanced system
```

## Core teaching thread

A recurring theme throughout the tutorial is:

```text
behavioral expectations are executable operational artifacts
```

The tutorial should repeatedly reinforce that:

* assertions describe observable behavior
* manifests expose operational assumptions
* tests accumulate system knowledge
* behavior includes both success and failure states
* operational drift can occur even when structural validation passes

## Proposed structure

# 1. Introduction

## Goal

Introduce TRAM as a behavioral testing system rather than a framework-centric assertion library.

Suggested framing:

```text
TRAM models observable API behavior through executable manifests.
```

Possible opening concepts:

* APIs often fail behaviorally rather than structurally
* assertions can become inspectable operational artifacts
* manifests can act as executable behavioral specifications

## Desired reader outcome

The reader should understand:

* this is not only endpoint testing
* the manifest is the important artifact
* behavioral modeling is the core concern

# 2. Prerequisites and setup

## Requirements

```text
Node.js 18+
```

## Repository setup

Example:

```bash
git clone https://github.com/mamund/2026-05-tram.git
cd 2026-05-tram
```

## CLI setup

### macOS/Linux

```bash
chmod +x bin/tram
npm link
```

### Windows

```bash
npm link
```

## Verification

Example:

```bash
tram api-tests.json
```

## Desired reader outcome

The reader successfully installs and executes TRAM.

# 3. Understand the behavioral workflow

## Conceptual model

Suggested diagram:

```text
sample API
        ↓
TRAM manifest
        ↓
TRAM runner
        ↓
behavioral results
```

## Key teaching point

The important artifact is:

```text
api-tests.json
```

The tutorial should explain that the manifest contains:

* requests
* assertions
* runtime values
* operational expectations
* behavioral assumptions

## Desired reader outcome

The reader understands the relationship between:

* API
* manifest
* runner
* behavioral output

# 4. Start the sample API

## Goal

Establish the runtime environment.

Example:

```bash
node sample-api/index.js
```

Expected output:

```text
Listening on port 3000
```

## Desired reader outcome

The reader has a working sample API.

# 5. Run the behavioral suite

## Goal

Execute the manifest before discussing implementation details.

Example:

```bash
tram api-tests.json
```

## Discussion points

Explain briefly that TRAM has:

* loaded the manifest
* initialized runtime data
* executed requests
* evaluated assertions
* produced behavioral results

## Desired reader outcome

The reader understands the overall execution flow.

# 6. Read one behavioral test

## Purpose

This section is the conceptual hinge of the tutorial.

The reader should learn to interpret a test as an operational statement about system behavior.

## Suggested example

```json
{
  "name": "Create task",
  "method": "POST",
  "path": "/tasks",
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
      },
      {
        "path": "$.priority",
        "range": {
          "min": 1,
          "max": 5
        }
      }
    ]
  }
}
```

## Read the test in layers

### Protocol layer

Example:

```json
"status": 201
```

Interpretation:

```text
The API successfully created a resource.
```

### Metadata layer

Example:

```json
"contains": "application/json"
```

Interpretation:

```text
The response describes itself as JSON.
```

### Body layer

Examples:

```json
"equals": "active"
```

```json
"range": {
  "min": 1,
  "max": 5
}
```

Interpretation:

```text
New tasks begin active.
Priority values remain operationally bounded.
```

## Important teaching point

The test is not merely validating a request.

The test is expressing:

* operational expectations
* behavioral assumptions
* observable system rules

Suggested conceptual line:

```text
The manifest is gradually becoming an executable behavioral specification.
```

## Desired reader outcome

The reader begins interpreting assertions as behavioral statements rather than implementation checks.

# 7. Add a simple happy-path test

## Goal

Teach controlled extension of the behavioral suite.

Possible examples:

* add a filtering test
* add a retrieval test
* add a collection assertion

## Teaching points

* adding new behavior incrementally
* rerunning the suite
* reading output
* understanding behavioral coverage

## Desired reader outcome

The reader successfully modifies the manifest.

# 8. Add a sad-path test

## Goal

Introduce behavioral boundaries and rejection behavior.

Possible examples:

* missing title
* invalid status
* malformed request

## Important teaching point

Behavior includes rejection behavior.

## Desired reader outcome

The reader understands that operational expectations include invalid-state handling.

# 9. Add richer behavioral assertions

This section deepens the behavioral model while preserving the same conceptual patterns introduced earlier.

## 9.1 Type assertions

Example:

```json
{
  "path": "$.priority",
  "type": "number"
}
```

Teaching point:

```text
Returned values have meaningful operational structure.
```

## 9.2 Range assertions

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

Teaching point:

```text
Behavioral invariants matter.
```

## 9.3 Collection assertions

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

Teaching point:

```text
Collections expose aggregate behavioral expectations.
```

## 9.4 Object-map assertions

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

Teaching point:

```text
Affordances are behavioral surfaces too.
```

## Desired reader outcome

The reader sees that richer assertions emerge from the same underlying patterns introduced earlier.

# 10. Stable runtime values

## Goal

Introduce coordinated behavioral workflows.

Example:

```json
"stableId": "${randomId}"
```

Referenced later:

```json
"path": "/tasks/${data.stableId}"
```

## Teaching point

```text
TRAM supports multi-step behavioral workflows without introducing custom scripting.
```

## Desired reader outcome

The reader understands coordinated runtime state reuse.

# 11. Generate reports

## Goal

Introduce machine-readable output and operational visibility.

Example:

```bash
tram api-tests.json --report results.json
```

## Discussion points

Potential uses:

* inspection
* debugging
* governance
* review
* automation

## Desired reader outcome

The reader understands that manifests and reports support operational review workflows.

# 12. Intentionally break tests

## Goal

Teach failure readability and operational debugging.

Suggested examples:

* wrong status
* wrong type
* wrong property
* invalid interpolation
* invalid range

## Important teaching point

Failure readability is part of the system design.

## Desired reader outcome

The reader understands how assertions expose behavioral mismatches.

# 13. What the manifest now represents

## Goal

Reflect on the completed behavioral model.

The tutorial should summarize that the manifest now expresses:

* executable tests
* behavioral assertions
* operational expectations
* observable invariants
* runtime coordination
* hypermedia verification

Suggested closing concept:

```text
The manifest has evolved from a collection of requests into an executable behavioral model of the system.
```

## Desired reader outcome

The reader understands the architectural purpose of the manifest.

# 14. Suggested next experiments

Possible directions:

* add pagination tests
* add authorization tests
* add lifecycle workflows
* add collection invariants
* experiment with runtime data reuse
* improve reporting
* explore manifest ergonomics
* experiment with hypermedia assertions
* explore AI-assisted manifest generation

## Final pedagogical note

The tutorial should consistently reinforce:

```text
TRAM is not only executing requests.
TRAM is helping users model observable system behavior.
```

