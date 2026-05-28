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

Several core TRAM semantics are now operationally validated rather than purely exploratory. The project is increasingly evolving from a lightweight assertion runner into a layered behavioral modeling system for HTTP APIs.

---

# Current state

TRAM currently includes:

* dependency-free HTTP runner
* dependency-free assertion library
* manifest-driven behavioral testing
* layered behavioral modeling (Levels 0–5)
* happy-path and sad-path support
* workflow-oriented behavioral validation
* governance-oriented behavioral assertions
* accumulated-state workflow verification
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
* sample CRUD-style task API

The current implementation has been validated against a real Node.js HTTP API using layered behavioral manifests spanning:

```text
Level 0 — Surface
Level 1 — Shape
Level 2 — Safe behavior
Level 3 — Unsafe behavior
Level 4 — Workflow
Level 5 — Governance
```

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

* accumulated state verification
* workflow-scoped runtime values
* continuity validation
* multi-step operational narratives

Future work may include:

* workflow visualization
* workflow diffing
* continuity diagnostics
* generated workflow review reports
* workflow-oriented coaching guidance

Workflow modeling is increasingly becoming a core architectural capability within TRAM rather than merely a convenience feature.

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
data.*
```

Future namespaces under consideration:

```text
captures.*
env.*
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
* workflow continuity coaching
* governance distinction guidance
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
setup/teardown orchestration
custom scripting
plugin systems
external assertion libraries
framework adapters
browser automation
capture-variable mutation systems
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

The long-term direction is not merely a larger assertion engine.

The larger goal is a system for creating readable, executable behavioral models of observable API behavior.
