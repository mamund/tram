# TRAM Project Context Document
## Executable Behavioral Modeling for HTTP APIs

Version: May 2026

---

# Project overview

TRAM (Test Runner for Assertion Manifests) is a lightweight, dependency-free behavioral testing and operational modeling system for HTTP APIs.

Repository:

https://github.com/mamund/2026-05-tram

The project has evolved from a simple assertion runner into a layered behavioral modeling system focused on:

* readable executable manifests
* observable operational intent
* workflow-oriented behavioral verification
* governance-oriented behavioral verification
* AI-coachable manifest authoring
* declarative behavioral sequencing
* reviewable operational artifacts

TRAM emphasizes explicit behavioral visibility over scripting flexibility.

The current architectural direction intentionally avoids turning TRAM into a general programmable testing framework.

---

# Core philosophy

TRAM treats manifests as:

* executable operational artifacts
* durable behavioral specifications
* reviewable coordination surfaces
* AI-readable behavioral models

The manifest is intended to remain stable even as implementation code evolves.

TRAM increasingly distinguishes between:

* manifest correctness
* runtime execution
* behavioral verification

Malformed manifests are considered authoring failures rather than API failures.

---

# Behavioral layering model

TRAM organizes behavioral verification into six progressive layers.

| Level | Focus | Question |
|---|---|---|
| 0 | Surface | Can the API be reached? |
| 1 | Shape | Do resources and affordances appear correctly? |
| 2 | Safe behavior | Do navigation, lookup, filtering, and query interactions behave correctly? |
| 3 | Unsafe behavior | Do isolated state-changing actions behave correctly? |
| 4 | Workflow | Can meaningful operational narratives be completed successfully? |
| 5 | Governance | Are policies, constraints, permissions, and semantic rules enforced correctly? |

The layers are additive.

The layering model improves:

* debugging isolation
* reviewability
* behavioral clarity
* coaching workflows
* AI-assisted generation
* long-term maintenance

---

# Current architectural direction

TRAM currently emphasizes:

* declarative sequencing over scripting
* visible operational behavior
* low-noise execution
* predictable runtime behavior
* lightweight implementation
* inspectable workflow continuity
* layered behavioral decomposition

The system intentionally excludes:

* embedded scripting
* plugin systems
* browser automation
* schema engines
* parallel execution
* external assertion runtimes

The architectural direction increasingly resembles:

* executable operational modeling
* behavioral governance
* declarative workflow verification

rather than traditional programmable API testing tools.

---

# Declarative sequencing model

TRAM workflows execute sequentially in manifest order.

The current model intentionally favors:

* visible sequencing
* readable manifests
* deterministic execution
* explicit operational continuity

TRAM models workflows through declarative sequencing rather than embedded procedural scripting.

Current workflow semantics already support:

* multi-step workflows
* accumulated state validation
* stable run-scoped variables
* runtime interpolation
* operational continuity verification

Dedicated setup/teardown lifecycle sections are intentionally deferred for now because current sequencing already supports equivalent behavior patterns.

---

# Manifest structure

Current manifest structure:

```json
{
  "manifestVersion": "0.2",
  "config": {
    "baseUrl": "http://localhost:3000"
  },
  "data": {},
  "tests": []
}
```

Current supported top-level areas:

* config
* data
* tests

Likely future namespaces:

```text
$data.*
$capture.*
$env.*
```

---

# Runtime interpolation semantics

TRAM distinguishes between:

## Object injection

```json
"body": "$data.createTask"
```

## String interpolation

```json
"path": "/tasks/${data.taskId}"
```

Current runtime token support:

```text
${randomId}
${timestamp}
${uuid}
${randomEmail}
```

Stable run-scoped initialization already exists:

```json
"data": {
  "stableId": "${randomId}"
}
```

The value initializes once per run and remains stable throughout the workflow.

---

# Manifest validation model

TRAM now includes explicit pre-run manifest validation.

Validation currently includes:

* manifest structure validation
* required field validation
* supported HTTP method validation
* supported bodyType validation
* duplicate test ID validation
* CLI argument validation
* manifest path validation

Validation failures occur before any HTTP requests execute.

The runtime now distinguishes between:

* authoring failures
* runtime/request failures
* assertion failures

This validation boundary is now considered foundational to the architecture.

---

# Assertion system

Current assertion support includes:

```text
exists
equals
contains
oneOf
type
range
isArray
hasProperties
minLength
each
eachProperty
```

Current traversal semantics distinguish between:

* arrays (`each`)
* object maps (`eachProperty`)

The runtime also distinguishes between:

* `path` for structural traversal
* `property` for scalar leaf checks

Nested traversal and nested assertions are operationally validated.

Optional property assertions now support conditional representation modeling.

---

# Hypermedia orientation

TRAM increasingly supports hypermedia-oriented behavioral verification.

Important distinctions:

* runtime discoverability is observable behavior
* affordances are operational coordination surfaces
* object-map traversal matters for link maps
* conditional affordances matter operationally

Current examples validate:

* `_links`
* affordance maps
* allowed methods
* conditional affordance metadata

The project increasingly treats runtime navigability as part of behavioral correctness.

---

# Reporting direction

Current reporting includes:

* concise console output
* JSON report generation
* readable assertion failures
* low-noise diagnostics

Future reporting directions likely include:

* validation diagnostics
* workflow summaries
* governance summaries
* coverage-oriented review documents
* behavioral gap identification
* manifest translation views
* workflow continuity summaries

A major future direction is manifest-driven review document generation.

Architectural rule:

```text
The manifest is authoritative.
Generated reports are explanatory.
```

---

# Capture/runtime state direction

One major unresolved area is runtime capture semantics.

The likely future direction includes:

```text
$capture.*
```

Potential future features:

* response-derived runtime values
* capture reuse across workflows
* capture-aware reporting
* capture failure diagnostics
* workflow continuity propagation

This area is expected to become a major future architectural boundary.

---

# AI Coach direction

TRAM is intended to support AI-assisted coaching workflows.

The coaching layer is not intended to automate behavioral modeling entirely.

The current philosophy emphasizes:

* collaborative construction
* visible reasoning
* intentional friction
* user judgment
* behavioral understanding

The AI Coach will likely:

* inspect APIs and API stories
* propose layered manifests
* suggest workflow decomposition
* identify happy/sad paths
* explain assertions
* review manifests
* identify weak coverage
* generate review-oriented artifacts

The larger goal is behavioral understanding, not one-shot test generation.

---

# Current implementation status

The current TRAM implementation includes:

* dependency-free Node.js runner
* executable npm CLI
* layered behavioral manifests
* traversal-aware assertion engine
* runtime interpolation
* workflow-oriented manifests
* governance-oriented manifests
* manifest validation
* reporting support
* CRUD sample API
* validation regression manifests

The implementation has been pressure-tested against a real Node.js task-management API using all six behavioral layers.

---

# Current near-term pressure areas

The next major areas of likely evolution are:

* capture/runtime state semantics
* reporting contract stabilization
* workflow continuity tooling
* manifest ergonomics
* review/report generation
* AI coaching integration
* additional real-world API pressure testing

The project is currently in a stabilization and semantic refinement phase rather than a rapid feature expansion phase.

---

# Architectural identity

TRAM is increasingly becoming:

* a behavioral operational modeling system
* a declarative workflow verification system
* a reviewable behavioral artifact system
* a coordination layer for humans and AI systems

The long-term direction is not merely a larger assertion engine.

The larger goal is readable, executable operational behavior modeling for distributed systems.
