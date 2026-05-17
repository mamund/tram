<img src="tram-logo.png" width=200" alt="TRAM (Test Runner for Assertion Manifests)" />

# TRAM

**TRAM** (Test Runner for Assertion Manifests) is a lightweight, dependency-free HTTP API behavioral testing platform for Node.js.

The project combines:

* a manifest-driven test format
* a reusable assertion engine
* a portable HTTP test runner
* an eventual AI Coaching workflow focused on learning and augmentation rather than pure automation

TRAM treats API testing as behavioral modeling rather than framework scripting.

## Project goals

TRAM is designed around several principles:

* behavioral tests over implementation tests
* portable manifests over framework lock-in
* readable intent over clever abstractions
* low-noise reporting
* explicitness over hidden magic
* augmentation and learning over one-shot generation

The long-term direction is an AI Coach that helps users learn behavioral API testing while collaboratively constructing executable manifests.

## Current status

Current implementation includes:

* manifest specification (`api-tests.json`)
* dependency-free assertion engine
* dependency-free HTTP runner
* JSON/body/header assertions
* collection assertions (`each`)
* happy-path and sad-path testing
* JSON, form, and text body support
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
  "path": "/tasks",
  "body": "$data.task.valid",
  "expect": {
    "status": 201
  }
}
```

The manifest acts as both:

* executable configuration
* human-readable behavioral documentation

### Assertion engine

The assertion library currently supports:

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

Example:

```json
{
  "path": "$",
  "each": {
    "property": "status",
    "oneOf": ["active", "pending", "completed"]
  }
}
```

### Body encoding support

TRAM supports multiple request body formats:

```json
"bodyType": "json"
```

Supported values:

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

## Running tests

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

Write a machine-readable report:

```bash
node api-test-runner.js api-tests.json --report results.json
```

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
* test inheritance systems
* hidden runtime behavior

The current emphasis is:

```text
clarity
predictability
behavior visibility
manifest ergonomics
```

## AI Coaching direction

The eventual AI Coach layer will:

1. inspect `server.js` and/or API Story documents
2. identify API behaviors
3. propose candidate tests
4. distinguish happy and sad paths
5. review data shapes and assertions with the user
6. generate plausible first-pass manifests

The goal is not automatic test generation alone.

The goal is helping users understand behavioral API testing while constructing executable manifests.

## Related ideas

TRAM draws inspiration from:

* behavioral testing
* hypermedia-oriented design
* affordance-centric APIs
* executable specifications
* augmentation-oriented AI systems
* coaching-based human/machine collaboration

## Status

Early experimental project.

Interfaces and manifest formats will evolve during v0.x development.

Project repository:

[TRAM on GitHub](https://github.com/mamund/2026-05-tram)
