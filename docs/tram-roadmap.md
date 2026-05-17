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

### Range assertions

Add numeric range support.

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

Goals:

* bounded numeric validation
* cleaner behavioral constraints
* avoid proliferation of comparison operators

Planned behavior:

* `min` optional
* `max` optional
* inclusive bounds
* negative values supported

## Stable run-scoped variables

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

## `expect.json[]` rename

Current manifests use:

```json
"expect": {
  "json": []
}
```

Planned direction:

```json
"expect": {
  "body": []
}
```

Reasoning:

* assertions target response bodies, not JSON specifically
* prepares for additional media types
* improves terminology clarity

The underlying assertion model will still support JSONPath-like selection for parsed JSON responses.

## `eachProperty` assertions

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

## Traversal and recursion hardening

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

## Possible future authoring model

One explored direction is a Markdown-based behavioral authoring layer.

Possible flow:

```text
Markdown test stories
        ↓
manifest builder
        ↓
api-tests.json
        ↓
TRAM runner
```

This remains exploratory.

The current focus is stabilizing the executable manifest and runner model.

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

These may eventually become useful, but they are currently outside the project’s primary focus.

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
