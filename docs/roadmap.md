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

Several core TRAM semantics are now operationally validated rather than purely exploratory. The project is increasingly evolving from a lightweight assertion runner into a layered behavioral modeling system for observable HTTP API behavior.

---

# Current state

TRAM currently includes:

* dependency-free HTTP runner
* dependency-free assertion library
* manifest-driven behavioral testing
* layered behavioral modeling (Levels 0–5)
* happy-path and sad-path support
* workflow-oriented behavioral modeling
* governance-oriented behavioral assertions
* accumulated-state workflow modeling
* JSON/form/text request body support
* machine-readable reporting
* collection assertions (`each`)
* object assertions (`hasProperties`)
* object-map assertions (`eachProperty`)
* native type assertions (`type`)
* range assertions (`range`)
* optional property assertions
* stable run-scoped variables
* runtime interpolation
* nested traversal assertions
* validated nested traversal semantics
* array vs object-map traversal distinction
* path vs property traversal distinction
* npm CLI packaging
* executable `tram` CLI runner
* CLI argument hardening
* pre-run manifest validation
* accumulated validation error reporting
* supported method/bodyType validation
* authoring/runtime/assertion failure separation
* sample CRUD-style task API
* standalone manifest validation (--validate)

The current implementation has been validated against a real Node.js HTTP API using layered behavioral manifests spanning:

| Level | Focus |
|---|---|
| 0 | Surface |
| 1 | Shape |
| 2 | Safe behavior |
| 3 | Unsafe behavior |
| 4 | Workflow |
| 5 | Governance |

The behavioral levels build progressively. Early levels verify observable responses in isolation. Later levels introduce continuity through captured observations, workflow progression through hypermedia affordances, and governance through observable policy behavior.

| Level | Primary behavioral capability |
| ----- | ---------------------- |
| 0     | Observation            |
| 1     | Structural description |
| 2     | Navigation             |
| 3     | Captured observations  |
| 4     | Hypermedia progression |
| 5     | Governance validation  |


---

# Guiding principles

TRAM development currently follows several constraints.

## Explicit over implicit

TRAM prefers visible configuration over hidden runtime behavior.

## Behavioral testing over implementation testing

The focus is API behavior, not internal function coverage.

## Low-noise output

Reporting should help users quickly understand failures.

## Stable executable core

The runner and assertion library should remain lightweight and predictable.

TRAM increasingly distinguishes between:

* manifest correctness
* runtime execution
* behavioral verification

## Declarative sequencing over scripting

TRAM models workflows through visible sequential behavioral declarations rather than embedded procedural scripting.

## Coaching-oriented design

The eventual AI Coach should help users understand behavioral API testing while collaboratively constructing executable manifests.

## Layered behavioral isolation

TRAM separates observable concerns into progressive behavioral layers.

The layering model improves:

* debugging scope isolation
* manifest readability
* collaborative review
* AI-assisted generation
* long-term manifest maintenance

---

# Near-term roadmap

## Traversal and recursion hardening

The current traversal model now supports:

* nested `each`
* nested `eachProperty`
* path-based structural traversal
* property-based scalar assertions
* nested affordance validation

Future work will focus on:

* deeper recursive composition
* improved failure localization
* recursive reporting clarity
* null/undefined traversal edge cases
* traversal ergonomics

This work will likely evolve incrementally in response to real-world usage.

---

## Workflow-oriented behavioral modeling

Recent manifest patterns now support executable operational workflows including:

* captured observations
* accumulated state verification
* continuity validation
* multi-step operational narratives

Future work will focus on:

* declarative capture of observed responses
* captured observation reuse
* workflow visualization
* workflow diffing
* continuity diagnostics
* generated workflow review reports
* workflow-oriented coaching guidance

Workflow modeling is increasingly becoming a core architectural capability within TRAM rather than merely a convenience feature.

## Named Endpoint Support

### Motivation

Current TRAM manifests assume all requests execute against a single `baseUrl` defined in configuration. This works well for single-service APIs but limits the ability to model workflows that span multiple services.

As TRAM expands into workflow and governance testing, manifests should be able to express that a request targets a particular service without embedding deployment-specific URLs in the manifest itself.

The goal is to preserve executable intent while keeping infrastructure details in configuration.

### Proposed Configuration

Add an optional `endpoints` collection to the configuration file.

```json
{
  "baseUrl": "http://localhost:3000",
  "endpoints": {
    "auth": "http://localhost:5000",
    "billing": "http://localhost:4000",
    "notifications": "http://localhost:6000"
  }
}
```

The existing `baseUrl` remains unchanged and continues to serve as the default target for requests that do not specify an endpoint.

### Proposed Manifest Extension

Add an optional `endpoint` property to the `request` object.

```json
{
  "request": {
    "endpoint": "auth",
    "method": "POST",
    "path": "/login"
  }
}
```

When omitted, the request uses the configured `baseUrl`.

```json
{
  "request": {
    "method": "GET",
    "path": "/tasks"
  }
}
```

### Resolution Rules

Request execution follows these rules:

1. If `request.endpoint` is present, resolve the corresponding URL root from `config.endpoints`.
2. If `request.endpoint` is absent, use `config.baseUrl`.
3. If an endpoint name cannot be resolved, execution fails with a descriptive error.

Example:

```text
Unknown endpoint "authz".
Known endpoints: auth, billing, notifications
```

### Validation Changes

Manifest validation:

* `request.endpoint` is optional.
* When present, it must be a string.

Configuration validation:

* `endpoints` is optional.
* When present, it must be an object.
* Each endpoint value must be a string URL root.

### Benefits

* Supports cross-service workflow testing.
* Keeps deployment details out of manifests.
* Preserves backward compatibility.
* Maintains separation between behavioral intent and runtime configuration.
* Improves support for workflow and governance scenarios where multiple services participate in a single business process.

### Example Workflow

```json
{
  "request": {
    "endpoint": "auth",
    "method": "POST",
    "path": "/login"
  }
}
```

```json
{
  "request": {
    "endpoint": "tasks",
    "method": "POST",
    "path": "/tasks"
  }
}
```

```json
{
  "request": {
    "endpoint": "notifications",
    "method": "POST",
    "path": "/messages"
  }
}
```

This allows manifests to express relationships between services while leaving deployment concerns in configuration.

### Relationship to TRAM Layers

This enhancement is primarily intended to support Level 4 (Workflow) and Level 5 (Governance) testing.

Levels 0–3 focus on validating the behavior of individual resources and interactions. Named endpoint support enables manifests to describe business processes that span multiple services while preserving the same declarative testing model.

The feature does not introduce new assertion types or alter existing manifest semantics. Instead, it expands the execution environment so that workflow-oriented manifests can express service boundaries without exposing infrastructure details.

Named endpoint support also provides the foundation for future hypermedia traversal across service boundaries.

---

## Governance-oriented assertions

Current governance support includes:

* required-field validation
* allowed-value assertions
* range assertions
* optional property constraints
* policy-oriented sad-path testing

Future exploration areas include:

* authorization modeling
* workflow legality constraints
* permission-sensitive representations
* policy visualization
* governance-oriented review reporting

The distinction between representation shape and semantic legitimacy is expected to become increasingly important as APIs evolve and generated systems become more common.

---

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
* validation-phase diagnostics
* workflow-phase summaries
* workflow continuity summaries
* governance-focused failure grouping

---

## Manifest ergonomics

The current JSON manifest is intentionally explicit.

Ongoing evaluation areas:

* repetition pressure
* readability
* local reasoning
* failure comprehension
* maintainability
* coaching usability
* workflow readability
* traversal readability

The project may eventually support alternate authoring formats while preserving the JSON manifest as the executable runtime representation.

Possible future directions include:

* markdown-oriented authoring
* review-oriented manifest projections
* generated operational summaries
* coaching-oriented editing workflows

---

## Namespace expansion

The current manifest system already supports:

```text
data.* -- authored input
```

Future namespaces under consideration:

```text
capture.* -- captured observations
env.* -- execution environment
```

Potential uses include:

* response capture reuse
* environment configuration
* runtime execution flexibility
* improved manifest portability
* workflow coordination
* multi-environment testing

The current design constraint remains:

```text
maintain visible and inspectable runtime behavior
```

---

# AI Coach direction

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

The coaching layer now also includes:

* layered manifest progression
* traversal-aware guidance
* capture guidance
* hypermedia workflow guidance
* governance guidance
* runtime interpolation guidance
* manifest debugging assistance
* workflow-oriented review patterns
* behavioral decomposition guidance

The coaching experience should preserve:

* user judgment
* visible reasoning
* intentional friction
* behavioral understanding

The goal is not one-shot test generation.

The goal is collaborative construction of behavioral API tests and executable operational models.

---

# Review document generation

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
* inspect workflow continuity
* inspect governance assumptions

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

Possible future additions include:

* workflow summaries
* governance summaries
* behavioral coverage maps
* affordance inventories
* layer-oriented review views

---

# Deferred from current scope

The following ideas are intentionally postponed:

```text
schema validation
parallel execution
dedicated setup/teardown lifecycle sections
custom scripting
plugin systems
external assertion libraries
framework adapters
browser automation
```

The current project emphasis remains:

```text
behavioral clarity
workflow visibility
predictable execution
reviewability
human understanding
```

---

# Current development philosophy

TRAM is currently evolving through:

* real API testing
* iterative manifest authoring
* runner pressure-testing
* assertion refinement
* workflow-oriented experimentation
* governance-oriented modeling
* coaching-oriented design review
* CLI usability refinement

The project remains intentionally conservative at this stage.

The emphasis is:

```text
clarity
behavior visibility
workflow visibility
predictability
reviewability
human understanding
```

Execution is one outcome of a behavioral model. TRAM is increasingly focused on helping authors create, validate, execute, and review those models while preserving observable API behavior as the primary source of evidence. Validation establishes that the behavioral model is internally consistent. Execution gathers evidence about that model by observing a running API.

The long-term direction is not merely a larger assertion engine.

The larger goal is a system for creating readable, executable behavioral models of observable API behavior.
