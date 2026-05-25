# TRAM Project Context

## Project overview

TRAM (Test Runner for Assertion Manifests) is a lightweight, dependency-free HTTP behavioral testing platform for Node.js.

Repository:

```text
https://github.com/mamund/2026-05-tram
```

The project emphasizes:

* behavioral API testing
* manifest-driven execution
* readable operational assertions
* low-noise reporting
* hypermedia-oriented validation
* executable behavioral modeling
* augmentation-oriented AI workflows

The broader direction is not simply test automation.

The project increasingly frames manifests as:

```text
executable behavioral models of running systems
```

rather than merely collections of endpoint tests.

---

# Architectural direction

## Core philosophy

TRAM intentionally occupies a middle space between:

```text
simple assertion runner
```

and:

```text
full schema validation engine
```

The project emphasizes:

* observable behavior
* operational expectations
* affordance validation
* workflow continuity
* governance assertions
* readable manifests

while intentionally avoiding:

* schema-engine complexity
* custom scripting
* plugin ecosystems
* hidden runtime behavior
* framework lock-in

---

# Manifest structure

Primary artifact:

```text
api-tests.json
```

Current manifest capabilities include:

* request definitions
* runtime interpolation
* shared data
* stable run-scoped variables
* behavioral assertions
* collection traversal
* object-map traversal
* native type validation
* optional property assertions
* range assertions
* JSON/form/text body support

---

# Assertion model

## Current assertion support

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

## Native type support

```text
string
number
boolean
array
object
null
```

The current model intentionally avoids semantic format validation.

Out of scope:

```text
uuid
email
uri
date-time
schema validation
```

---

# Optional property assertions

## Feature summary

TRAM now supports:

```json
{
  "path": "$",
  "each": {
    "property": "description",
    "optional": true,
    "type": "string"
  }
}
```

Semantics:

```text
property may be absent
if present, it must still validate successfully
```

Default behavior:

```json
"optional": false
```

## Supported scope

Optional assertions currently apply only to:

```text
each.property.equals
each.property.contains
each.property.oneOf
each.property.type
each.property.range
nested eachProperty path assertions
```

Optional assertions intentionally do not apply to:

```text
status
exists
isArray
each
eachProperty
hasProperties
```

## Architectural significance

This feature reinforced several emerging TRAM principles:

* behavioral validity differs from rigid structural completeness
* conditional representations are legitimate behavior
* affordance metadata may appear conditionally
* sparse representations should remain testable
* evolving APIs should remain behaviorally verifiable

The feature aligns strongly with hypermedia-oriented thinking.

Key conceptual distinction:

```text
A missing field may still represent correct behavior.
A present field with invalid semantics does not.
```

---

# Implementation notes

## Implementation location

The optional feature required changes only to:

```text
lib/assertions.js
```

The CLI runner architecture already separated:

```text
HTTP execution
```

from:

```text
assertion semantics
```

which allowed the feature to remain localized.

## Key implementation points

Modified functions:

```text
assertJson()
assertEach()
```

Added helper:

```text
optionalAbsent()
```

The implementation works because:

```js
selectPath()
```

already returns:

```js
{
  exists,
  value
}
```

This separation between:

```text
path existence
```

and:

```text
value validation
```

made optional-property semantics straightforward.

## Important implementation decision

Optional handling occurs at:

```text
property/path lookup time
```

rather than inside individual assertions like:

```text
type
range
oneOf
```

This preserved cleaner assertion semantics.

---

# Manifest examples added

## Optional collection property

```json
{
  "path": "$",
  "each": {
    "property": "description",
    "optional": true,
    "type": "string"
  }
}
```

## Optional affordance metadata

```json
{
  "path": "$._links",
  "eachProperty": {
    "path": "$.title",
    "optional": true,
    "type": "string"
  }
}
```

These examples now appear throughout:

* Manifest Spec
* Quick Start
* README
* Explainer
* Tutorial outline

---

# Behavioral layering model

TRAM currently frames assertions across layered behavioral concerns:

```text
Level 0 — Surface
Can the API be reached?

Level 1 — Shape
Do resources and affordances appear correctly?

Level 2a — Safe behavior
Do navigation and query interactions behave correctly?

Level 2b — Unsafe behavior
Do isolated state-changing actions behave correctly?

Level 3 — Workflow
Can meaningful operational narratives be completed successfully?

Level 4 — Governance
Are policies, constraints, and permissions enforced correctly?
```

Important conceptual distinction:

```text
behavioral layers
```

are different from:

```text
assertion targets
```

Assertion targets include:

* protocol
* metadata
* body

Optional assertions strengthened the distinction between:

```text
shape
```

and:

```text
governance
```

because conditional visibility itself may now represent valid operational behavior.

---

# Hypermedia direction

TRAM increasingly supports affordance-centric validation.

Current capabilities include:

* `_links` object-map traversal
* affordance property validation
* nested `eachProperty` assertions
* conditional affordance metadata validation

Example:

```json
{
  "path": "$._links",
  "eachProperty": {
    "hasProperties": ["href", "method"]
  }
}
```

Optional affordance metadata:

```json
{
  "path": "$._links",
  "eachProperty": {
    "path": "$.title",
    "optional": true,
    "type": "string"
  }
}
```

This aligns with the broader affordance-centric direction already present in:

* GRAIL
* hypermedia runtime coordination
* emergent workflows
* state-dependent affordance exposure

---

# AI coaching direction

Long-term direction includes AI-assisted manifest generation and coaching.

Key principle:

```text
augmentation rather than automation
```

The AI Coach should:

* inspect APIs and stories
* identify behaviors
* propose assertions
* distinguish happy/sad paths
* collaboratively refine manifests
* teach behavioral API modeling

The optional assertion feature is especially important for future AI coaching because the coach must understand the distinction between:

```text
required property
optional property
nullable property
```

without collapsing all representation behavior into rigid schemas.

---

# Documentation updated

The following documents were updated to include optional assertions:

```text
Manifest Specification
Quick Start
README
Explainer
Behavioral Modeling Brief
Tutorial Outline
```

Key conceptual additions across the docs:

* conditional representation behavior
* sparse representations
* evolving APIs
* conditional affordance metadata
* behavioral validity vs structural completeness
* hypermedia-oriented runtime visibility

---

# Current design stance

Current direction favors:

```text
small composable behavioral assertions
```

rather than:

```text
large monolithic workflow scripts
```

The assertion model continues to evolve incrementally while preserving:

* readability
* inspectability
* portability
* declarative structure
* reviewability

The optional-property feature was considered successful because:

* it required minimal implementation change
* it composed naturally with existing assertions
* it reinforced the architectural direction
* it strengthened hypermedia-oriented modeling
* it avoided schema-engine complexity

---

# Suggested future discussion areas

Potential future work:

* nullable semantics
* richer object-map traversal
* collection invariants
* affordance-state modeling
* governance manifests
* manifest composition
* markdown-to-manifest authoring
* AI-assisted manifest review
* workflow-generation heuristics
* behavioral diffing between API versions

No commitment has been made yet on these directions.

