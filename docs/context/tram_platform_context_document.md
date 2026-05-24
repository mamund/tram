# TRAM Platform Context Document

Version: 0.1
Author: Mike Amundsen
Project: TRAM (Test Runner for Assertion Manifests)
Purpose: Provide a durable architectural, conceptual, and implementation context document for maintaining and evolving the TRAM platform.

---

# Purpose

This document captures the current architectural direction, design philosophy, implementation assumptions, and behavioral testing model behind TRAM.

It is intended to support:

* long-term platform maintenance
* architectural consistency
* feature evaluation
* implementation decisions
* onboarding contributors
* documentation alignment
* future roadmap planning

This document is not a formal specification.

It is a project-level architectural and conceptual reference.

---

# What TRAM is

TRAM (Test Runner for Assertion Manifests) is a lightweight behavioral API testing platform.

TRAM combines:

* executable manifests
* a dependency-free assertion engine
* a lightweight HTTP runner
* behavioral operational assertions
* runtime interpolation
* machine-readable reporting

TRAM is intentionally conservative in scope.

The current project emphasis is:

```text
clarity
behavior visibility
predictability
reviewability
human understanding
```

TRAM is not intended to become a large framework ecosystem.

The design direction favors:

* inspectable behavior
* explicit configuration
* composable assertions
* readable manifests
* low operational complexity

---

# Architectural philosophy

## Behavioral testing over implementation testing

TRAM focuses on:

```text
observable operational behavior
```

rather than:

```text
internal implementation structure
```

This distinction is central.

APIs frequently remain structurally valid while operational behavior drifts.

Examples include:

* affordances disappearing
* bounded values becoming unstable
* representations losing meaning
* workflows drifting
* operational assumptions diverging
* collections violating expected invariants

TRAM attempts to expose these assumptions directly through executable manifests.

---

# Manifest-centric design

The manifest is the core artifact in TRAM.

A manifest acts simultaneously as:

* executable configuration
* behavioral model
* operational review artifact
* accumulated system knowledge

Example:

```json
{
  "path": "$.status",
  "equals": "active"
}
```

This assertion expresses:

```text
new tasks begin active
```

Similarly:

```json
{
  "path": "$.priority",
  "range": {
    "min": 1,
    "max": 5
  }
}
```

expresses:

```text
priority values remain operationally bounded
```

The manifest therefore becomes an executable behavioral specification.

---

# Core execution model

The current TRAM execution flow is:

```text
manifest
    ↓
request construction
    ↓
HTTP execution
    ↓
response parsing
    ↓
assertion traversal
    ↓
behavioral reporting
```

The runner intentionally remains lightweight.

The design goal is visible execution rather than hidden orchestration.

---

# Current project structure

Current recommended structure:

```text
.
├── README.md
├── package.json
├── api-tests.json
├── bin/
│   └── tram
├── lib/
│   └── assertions.js
├── docs/
└── sample-api/
```

## Structural principles

### bin/

Contains executable entry points only.

Example:

```text
bin/tram
```

The executable should remain thin.

Responsibilities:

* parse CLI arguments
* load manifests
* initialize runtime state
* invoke execution flow
* emit reports

### lib/

Contains reusable implementation modules.

Current example:

```text
lib/assertions.js
```

Future candidates:

```text
interpolation.js
reporting.js
traversal.js
manifest-loader.js
```

### docs/

Contains:

* specifications
* explainers
* tutorials
* roadmap
* context documents

### sample-api/

Contains:

* lightweight reference API
* smoke-test target
* tutorial support API
* behavioral experimentation target

---

# CLI philosophy

TRAM is intentionally evolving toward a tool-oriented CLI model.

The executable surface is:

```bash
tram api-tests.json
```

rather than:

```bash
node api-test-runner.js api-tests.json
```

This shift reflects:

* executable identity
* onboarding ergonomics
* portability
* packaging maturity
* operational simplicity

## package.json direction

TRAM uses npm CLI packaging.

Example:

```json
{
  "bin": {
    "tram": "./bin/tram"
  }
}
```

## Cross-platform assumptions

macOS/Linux:

```bash
chmod +x bin/tram
npm link
```

Windows:

```bash
npm link
```

npm manages platform-specific shims.

---

# Assertion philosophy

Assertions are intentionally composable.

The assertion system should scale through:

```text
deeper composition
```

rather than:

```text
multiple unrelated assertion systems
```

Current assertions:

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

The current design emphasis is:

* readability
* inspectability
* local reasoning
* composability
* behavioral expressiveness

---

# Progressive complexity model

TRAM intentionally follows a progressive complexity model.

The intended learning progression is:

```text
simple → deeper use of the same system
```

rather than:

```text
simple → completely different advanced framework
```

This principle affects:

* manifest structure
* assertion design
* traversal rules
* tutorials
* coaching workflows
* feature evaluation

Example progression:

```text
status assertion
    ↓
body assertion
    ↓
type assertion
    ↓
range assertion
    ↓
collection assertion
    ↓
object-map assertion
    ↓
hypermedia validation
```

The conceptual model remains stable throughout.

---

# Traversal philosophy

Traversal behavior is central to TRAM.

Current traversal patterns include:

```text
JSONPath-like body traversal
nested collection traversal
object-map traversal
runtime interpolation traversal
```

Current recursive structures:

```text
each
eachProperty
```

Areas requiring continued caution:

* nested recursion
* traversal context isolation
* failure readability
* null handling
* recursive reporting
* local reasoning

Traversal hardening remains an ongoing roadmap concern.

---

# Native type philosophy

TRAM currently supports native JSON/JavaScript type assertions only.

Supported values:

```text
string
number
boolean
array
object
null
```

The current design intentionally excludes semantic formats.

Out of scope:

```text
uuid
email
uri
date-time
regex formats
schema engines
```

The current philosophy is:

```text
keep the core assertion model small and predictable
```

rather than:

```text
expand toward schema-engine complexity
```

---

# Behavioral reading model

One of the core conceptual models in TRAM is reading tests behaviorally.

Tests are interpreted in three layers:

```text
protocol
metadata
body
```

## Protocol layer

Validates:

* status codes
* transport behavior
* request success/failure

## Metadata layer

Validates:

* headers
* content negotiation
* representation metadata
* response description

## Body layer

Validates:

* operational state
* invariants
* collections
* affordances
* representation meaning

This layered model scales naturally into more advanced behavioral validation.

---

# Hypermedia and affordance validation

TRAM aligns naturally with affordance-oriented APIs.

Affordances are treated as:

```text
behavioral surfaces
```

Tests should validate:

* discoverability
* available actions
* workflow transitions
* representation-driven behavior
* operational guidance

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

This validates operational affordance consistency.

---

# Runtime interpolation philosophy

TRAM supports stable runtime interpolation values.

Example:

```json
"stableId": "${randomId}"
```

Referenced later:

```json
"/tasks/${data.stableId}"
```

Design goal:

```text
coordinated runtime behavior without procedural scripting
```

Current namespace:

```text
data.*
```

Potential future namespaces:

```text
captures.*
env.*
```

Important design constraint:

```text
runtime behavior should remain visible and inspectable
```

---

# Failure readability

Failure readability is considered a core platform feature.

The reporting system should help users understand:

```text
what behavior failed
```

rather than merely:

```text
which assertion failed
```

Current design emphasis:

* concise output
* readable failures
* low-noise reporting
* visible operational assumptions
* machine-readable reports

---

# Tutorial and documentation philosophy

TRAM documentation should reinforce:

```text
behavioral modeling
```

rather than only:

```text
feature usage
```

Recommended pedagogical progression:

```text
run tests
    ↓
read tests
    ↓
modify tests
    ↓
model behavior
```

Tutorials should emphasize:

* observable behavior
* operational assumptions
* behavioral invariants
* composable assertions
* progressive complexity

---

# AI Coaching alignment

TRAM is intentionally compatible with augmentation-oriented AI Coaching workflows.

The long-term direction is:

```text
collaborative behavioral modeling
```

rather than:

```text
opaque one-shot generation
```

The AI layer should help users:

* identify operational behavior
* reason about invariants
* distinguish happy and sad paths
* refine assertions
* preserve architectural understanding

Human judgment remains authoritative.

---

# Current roadmap direction

Near-term priorities:

* traversal hardening
* reporting improvements
* manifest ergonomics
* namespace evolution
* CLI refinement
* tutorial development
* coaching integration

Potential future areas:

* manifest review generation
* governance workflows
* richer behavioral modeling
* AI-assisted refinement
* operational review tooling

---

# Intentionally deferred features

The following remain intentionally outside current scope:

```text
custom scripting
parallel execution
plugin systems
framework adapters
schema validation engines
browser automation
hidden orchestration systems
large runtime dependency trees
```

These exclusions are intentional architectural choices rather than missing features.

---

# Long-term architectural principle

The central TRAM principle should remain:

```text
behavioral expectations should remain
visible,
reviewable,
executable,
and understandable.
```

