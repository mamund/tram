# TRAM

**TRAM** (Test Runner for Assertion Manifests) is a lightweight, dependency-free HTTP API behavioral testing platform for Node.js.

<img src="tram-logo.png" width="200" alt="TRAM (Test Runner for Assertion Manifests)" />

TRAM combines:

* a manifest-driven test format
* a reusable assertion engine
* a portable HTTP test runner
* stable runtime interpolation support
* object-map and collection assertions
* an eventual AI Coaching workflow focused on learning and augmentation rather than pure automation

TRAM treats API testing as behavioral modeling rather than framework scripting.

<img src="tram-test-run.png" alt="TRAM screenshot of test run" />

## Why TRAM exists

Modern API systems already have strong tooling around structure and implementation:

* OpenAPI generation
* schema validation
* SDK generation
* monitoring
* scaffolding
* AI-assisted code generation

At the same time, distributed systems often fail behaviorally rather than structurally.

A response may validate correctly while:

* workflows drift
* affordances disappear
* assumptions diverge
* state transitions become inconsistent
* operational expectations become fragmented across teams and tools

TRAM explores a narrower problem:

```text
How do we make behavioral expectations directly visible,
portable, executable, and reviewable?
```

The core artifact is the manifest:

```text
api-tests.json
```

The manifest defines:

* requests
* request bodies
* assertions
* expected behaviors
* shared test data
* runtime interpolation values

Assertions become directly inspectable operational statements.

Example:

```json
{
  "path": "$.status",
  "equals": "active"
}
```

## Project goals

TRAM is designed around several principles:

* behavioral tests over implementation tests
* portable manifests over framework lock-in
* readable intent over clever abstractions
* explicitness over hidden runtime behavior
* low-noise reporting
* augmentation and learning over one-shot generation

The long-term direction is an AI Coach that helps users learn behavioral API testing while collaboratively constructing executable manifests.

## Current implementation

Current implementation includes:

* manifest specification (`api-tests.json`)
* dependency-free assertion engine
* dependency-free HTTP runner
* body/header/status assertions
* collection assertions (`each`)
* object-map assertions (`eachProperty`)
* range assertions (`range`)
* stable run-scoped variables
* runtime interpolation (`${data.*}`)
* happy-path and sad-path testing
* JSON, form, and text request body support
* machine-readable reporting
* real API validation against a sample CRUD-style task API

## Project structure

```text
.
├── assertions.js
├── api-test-runner.js
├── api-tests.json
├── index.js
└── docs/
```

## Core concepts

### Manifest-driven testing

Tests are defined declaratively in a manifest:

```json
{
  "name": "Create task",
  "method": "POST",
  "path": "/tasks/${data.stableId}",
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

The manifest acts as both:

* executable configuration
* behavioral operational artifact

### Shared runtime data

The `data` section stores reusable request and runtime values.

Example:

```json
{
  "data": {
    "stableId": "${randomId}"
  }
}
```

The generated value remains stable throughout the current test run.

Later requests can reference the same value:

```json
{
  "path": "/tasks/${data.stableId}"
}
```

This enables coordinated multi-step behavioral flows without introducing custom scripting.

### Assertion engine

The assertion library currently supports:

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

Example nested collection + object-map assertion:

```json
{
  "path": "$",
  "each": {
    "path": "$._links",
    "eachProperty": {
      "hasProperties": ["href", "method"]
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

The assertion model supports:

* collection traversal
* nested traversal
* object-map iteration
* hypermedia affordance validation

while remaining declarative and inspectable.

### Request body support

TRAM supports multiple request body encodings:

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

## Running the sample project

Start the sample API:

```bash
node index.js
```

Run the test suite:

```bash
node api-test-runner.js api-tests.json
```

Verbose mode:

```bash
node api-test-runner.js api-tests.json --verbose
```

Generate a machine-readable report:

```bash
node api-test-runner.js api-tests.json --report results.json
```

## Documentation

### Quick Start

Practical walkthrough for:

* running the sample project
* inspecting manifests
* understanding assertions
* understanding runtime interpolation
* exploring behavioral API testing workflows

### Manifest Specification

Authoritative executable manifest model.

Defines:

* manifest structure
* request configuration
* assertion syntax
* traversal behavior
* runtime interpolation
* stable run-scoped variables
* collection assertions
* object-map assertions
* body handling

### Explainer

Architectural discussion of:

* behavioral assertions
* operational artifacts
* hypermedia-oriented testing
* generated systems
* AI-assisted workflows

## Reporting philosophy

TRAM emphasizes:

* low-noise console output
* readable failures
* behavior visibility
* detailed machine-readable reports

The console output is intentionally concise by default.

## Design philosophy

TRAM is intentionally conservative.

v0.1 avoids:

* framework dependencies
* custom scripting
* setup/teardown orchestration
* schema engines
* plugin systems
* hidden runtime behavior

The current emphasis is:

```text
clarity
predictability
behavior visibility
manifest ergonomics
reviewability
```

## AI Coaching direction

The eventual AI Coach layer will:

1. inspect `server.js` and/or API Story documents
2. identify API behaviors
3. propose candidate tests
4. distinguish happy and sad paths
5. review assertions collaboratively
6. generate plausible first-pass manifests

The goal is not automatic test generation alone.

The goal is helping users understand behavioral API testing while collaboratively constructing executable manifests.

## Related ideas

TRAM draws inspiration from:

* behavioral testing
* executable specifications
* hypermedia-oriented design
* affordance-centric APIs
* augmentation-oriented AI systems
* coaching-based human/machine collaboration

## Status

Early experimental project.

Interfaces and manifest formats will evolve during v0.x development.

Project repository:

```text
https://github.com/mamund/2026-05-tram
```

