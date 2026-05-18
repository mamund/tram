# TRAM Roadmap

## Purpose

This document outlines the near-term direction for the TRAM project.

TRAM is still early-stage software. The current emphasis is not feature completeness, but validating a behavioral testing model that is:

* readable
* executable
* framework-independent
* teachable
* compatible with AI-assisted coaching workflows

The roadmap reflects ideas and implementation pressure discovered during real usage of the sample runner and manifest system.

## Current state

TRAM currently includes:

* dependency-free HTTP runner
* dependency-free assertion library
* manifest-driven behavioral testing
* happy-path and sad-path support
* JSON/form/text request body support
* machine-readable reporting
* collection assertions (`each`)
* object assertions (`hasProperties`)
* range assertions (`range`)
* sample CRUD-style task API

The current implementation has been validated against a real Node.js HTTP API.

## Guiding principles

TRAM development currently follows several constraints.

### Explicit over implicit

TRAM prefers visible configuration over hidden runtime behavior.

### Behavioral testing over implementation testing

The focus is API behavior, not internal function coverage.

### Low-noise output

Reporting should help users quickly understand failures.

### Stable executable core

The runner and assertion library should remain lightweight and predictable.

### Coaching-oriented design

The eventual AI Coach should help users understand behavioral API testing while collaboratively constructing executable manifests.

## Near-term roadmap

## Assertion improvements

### Stable run-scoped variables

Support generated values resolved once per test run.

Example:

```json
"data": {
  "stableId": "${randomId}"
}
```

This enables behavioral sequences such as:

```text
create
retrieve
update
delete
verify missing
```

without introducing scripting support.

Goals:

* preserve declarative manifests
* support correlated test flows
* avoid runtime mutation complexity

### eachProperty assertions

Current support:

```text
each
→ array iteration
```

Planned support:

```text
eachProperty
→ object/map iteration
```

Example:

```json
{
  "path": "$._links",
  "eachProperty": {
    "hasProperties": ["href", "method"]
  }
}
```

Goals:

* improve support for hypermedia formats
* support object maps cleanly
* preserve distinction between arrays and objects

### Primitive type assertions

Add support for basic JSON/native value type assertions.

Example:

```json
{
  "path": "$.priority",
  "type": "number"
}
```

Supported initial values:

```text
string
number
boolean
array
object
null
```

Purpose:

* confirm basic representation shape
* avoid overusing `equals`, `oneOf`, or `range`
* support fields with generated or variable values
* remain lighter than schema validation

Deferred semantic assertions:

```text
uuid
email
uri
date-time
slug
hostname
regex
```

These semantic format assertions are intentionally outside the current scope.

### Traversal and recursion hardening

As manifests and response bodies become more complex, recursive traversal behavior will require additional validation and stabilization.

Areas of focus:

* nested `each`
* nested path resolution
* recursive reporting
* context isolation
* failure readability
* null handling

This work will likely evolve incrementally in response to real-world usage.

## Reporting improvements

Current reporting intentionally emphasizes:

* concise console output
* readable failures
* machine-readable JSON reports

Possible future additions:

* summary-only mode
* grouped failure reporting
* colorized output
* timing summaries
* assertion statistics
* test filtering by tag

## Manifest ergonomics

The current JSON manifest is intentionally explicit.

Ongoing evaluation areas:

* repetition pressure
* readability
* local reasoning
* failure comprehension
* maintainability
* coaching usability

The project may eventually support alternate authoring formats while preserving the JSON manifest as the executable runtime representation.

## AI Coach direction

The long-term direction for TRAM includes an AI Coaching layer.

The AI Coach is intended to:

1. inspect `server.js` and/or API Story documents
2. identify API behaviors
3. suggest candidate tests
4. distinguish happy and sad paths
5. review request/response data shapes
6. review assertion choices
7. help users modify generated tests
8. generate executable manifests

The coaching experience should preserve:

* user judgment
* visible reasoning
* intentional friction
* behavioral understanding

The goal is not one-shot test generation.

The goal is collaborative construction of behavioral API tests.

## Review document generation

A future utility may generate human-readable review documents directly from manifests.

Possible flow:

```text
api-tests.json
        ↓
tram-review.js
        ↓
TRAM Test Review Document
```

Purpose:

* inspect coverage
* review behaviors
* identify weak assertions
* review happy/sad path balance
* support coaching/reflection loops

Important architectural rule:

```text
The manifest is authoritative.
The review document is explanatory.
```

The review document is intentionally:

* generated
* read-only
* regenerable
* non-authoritative

## Deferred from current scope

The following ideas are intentionally postponed:

```text
schema validation
parallel execution
setup/teardown orchestration
custom scripting
plugin systems
external assertion libraries
framework adapters
browser automation
capture-variable mutation systems
```

## Current development philosophy

TRAM is currently evolving through:

* real API testing
* iterative manifest authoring
* runner pressure-testing
* assertion refinement
* coaching-oriented design review

The project is intentionally conservative at this stage.

The emphasis is:

```text
clarity
behavior visibility
predictability
reviewability
human understanding
```

