# TRAM Repository Context Document

## Purpose

This document captures the current conceptual, architectural, operational, and pedagogical state of the TRAM project.

It is intended to support:
- future development
- future AI-assisted sessions
- architectural continuity
- coaching continuity
- documentation consistency
- implementation refinement

This document is intentionally broader than the README or roadmap.

It attempts to capture:
- project philosophy
- stable semantics
- validated runtime behavior
- unresolved tensions
- architectural direction
- important implementation discoveries

---

# Project identity

TRAM originally began as:

```text
a lightweight HTTP assertion runner
```

It is increasingly evolving into:

```text
a layered behavioral modeling system for HTTP APIs
```

This shift matters.

The project is no longer only about:
- endpoint verification
- request execution
- assertion mechanics

The system is increasingly about:
- observable behavior
- operational modeling
- workflow continuity
- governance constraints
- behavioral visibility
- executable operational narratives
- AI-assisted behavioral collaboration

---

# Core definition

TRAM stands for:

```text
Test Runner for Assertion Manifests
```

The core artifact is:

```text
the manifest
```

The manifest is simultaneously:
- executable
- inspectable
- reviewable
- portable
- composable

The manifest acts as:
- executable configuration
- operational documentation
- behavioral model

---

# Core philosophical position

TRAM treats API testing as behavioral modeling rather than framework scripting.

The emphasis is:
- observable runtime behavior
- explicit operational expectations
- readable assertions
- layered verification
- behavioral visibility

TRAM intentionally favors:
- declarative manifests
- inspectable runtime behavior
- low-noise execution
- predictable semantics
- human-readable operational intent

---

# Major conceptual shift

One of the most important project realizations is:

```text
behavioral expectations are themselves operational artifacts
```

Assertions are not merely:
- test details
- framework glue
- implementation scaffolding

Assertions become:
- inspectable operational statements
- reusable behavioral units
- portable verification artifacts
- collaborative coordination surfaces

---

# Layered behavioral model

TRAM now organizes behavioral verification into six progressive layers.

```text
Level 0 — Surface
Can the API be reached?

Level 1 — Shape
Do resources and affordances appear correctly?

Level 2 — Safe behavior
Do navigation, lookup, filtering, and query interactions behave correctly?

Level 3 — Unsafe behavior
Do isolated state-changing actions behave correctly?

Level 4 — Workflow
Can meaningful operational narratives be completed successfully?

Level 5 — Governance
Are policies, constraints, permissions, and semantic rules enforced correctly?
```

---

# Layering rationale

The layers exist because different assertions answer fundamentally different operational questions.

Examples:

```text
endpoint availability
≠
workflow continuity
```

```text
representation structure
≠
policy legitimacy
```

```text
isolated mutation
≠
accumulated operational continuity
```

Separating concerns improves:
- readability
- debugging
- collaboration
- reviewability
- coaching
- AI-assisted generation

---

# Debugging isolation

One of the strongest practical discoveries:

```text
behavioral layering narrows debugging scope
```

Example:

If:
- Levels 0–3 pass
- Level 4 fails

then the failure likely concerns:
- continuity
- sequencing
- accumulation
- workflow semantics

rather than:
- transport
- routing
- representation structure
- isolated mutation mechanics

This became operationally validated during manifest execution.

---

# Stable runtime semantics

Several semantics are now considered stable enough to treat as canonical.

---

# Traversal semantics

## Arrays vs object maps

TRAM distinguishes between:

```text
each
```

and:

```text
eachProperty
```

Rules:

```text
each
=> arrays
```

```text
eachProperty
=> object maps
```

Examples:

Array:

```json
[
  {...},
  {...}
]
```

Object map:

```json
{
  "self": {...},
  "edit": {...}
}
```

This distinction became foundational to:
- affordance validation
- hypermedia traversal
- nested assertions

---

# path vs property

TRAM also distinguishes between:

```text
path
=> structural traversal
```

and:

```text
property
=> scalar leaf assertions
```

Use `path` when:
- continuing traversal
- nesting assertions
- re-entering the assertion engine

Use `property` when:
- asserting direct scalar child values

Canonical nested traversal example:

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

Canonical scalar leaf example:

```json
{
  "path": "$",
  "each": {
    "property": "status",
    "equals": "active"
  }
}
```

This distinction emerged through real runtime debugging and should be preserved consistently across all documentation and coaching materials.

---

# Runtime interpolation semantics

TRAM distinguishes between:

```text
object injection
```

and:

```text
string interpolation
```

---

## Object injection

Use:

```json
"$data.someObject"
```

for:
- request bodies
- reusable structured runtime objects

Example:

```json
"body": "$data.createTask"
```

---

## String interpolation

Use:

```json
"${data.someValue}"
```

inside:
- paths
- strings
- assertions
- query parameters

Example:

```json
"path": "/tasks/${data.knownTaskId}"
```

This distinction became operationally important during workflow construction and debugging.

---

# Stable run-scoped variables

TRAM supports run-scoped runtime values.

Example:

```json
"stableId": "${randomId}"
```

initialized inside `data`.

These values:
- initialize once per run
- remain stable throughout execution
- support workflow continuity

This became essential for:
- workflow manifests
- accumulated-state verification
- continuity testing

---

# Workflow modeling

Workflow modeling emerged as one of the strongest conceptual directions in the project.

Earlier layers primarily verify:
- isolated capability
- isolated mutations

Workflow manifests verify:
- continuity
- sequencing
- accumulation
- survivability across interactions

Canonical workflow pattern:

```text
create
read after create
edit
update status
assign user
set due date
read final accumulated state
```

The important realization:

```text
workflow correctness is not reducible to isolated endpoint correctness
```

---

# Accumulated-state verification

One of the strongest runtime discoveries:

```text
final-state verification matters more than isolated mutation confirmation
```

Example:

```json
{
  "path": "$.assignedUser",
  "equals": "${data.workflowAssigneeUpdate.task.assignedUser}"
}
```

This validates:
- continuity
- accumulation
- workflow survivability

rather than:
- isolated request success

---

# Governance distinction

Another important conceptual distinction:

```text
shape
≠
semantic legitimacy
```

Example:

```json
{
  "status": "flying-purple-banana"
}
```

may:
- satisfy shape assertions
- violate governance expectations

Governance manifests focus on:
- allowed values
- ranges
- required fields
- permissions
- workflow legality
- policy constraints
- semantic validity

---

# Optional property semantics

Optional assertions became an important middle ground between:
- rigid schema enforcement
- loose payload inspection

Example:

```json
{
  "property": "description",
  "optional": true,
  "type": "string"
}
```

Meaning:

```text
property may be absent
if present, it must still validate
```

This became especially important for:
- sparse representations
- evolving systems
- hypermedia metadata
- conditional affordances
- permission-sensitive representations

---

# Hypermedia direction

TRAM increasingly aligns well with:
- affordance-oriented systems
- hypermedia APIs
- runtime discoverability

Important realization:

```text
runtime discoverability is observable behavior
```

Testing therefore expands beyond:
- endpoint correctness

into:
- navigability
- affordance exposure
- runtime coordination surfaces

TRAM’s object-map traversal support (`eachProperty`) became especially important here.

---

# AI Coach direction

The AI Coach has evolved substantially.

The current coaching model includes:
- layer-by-layer progression
- candidate assertion review
- manifest review cycles
- debugging guidance
- traversal guidance
- workflow coaching
- governance coaching
- interpolation guidance

The coaching model intentionally avoids:
- one-shot generation
- hidden reasoning
- fully automated authorship

The philosophy is:

```text
augmentation over automation
```

The human remains:
- reviewer
- decision-maker
- final authority

---

# Canonical learning/debugging moments

Several debugging discoveries became important pedagogically.

These should likely remain canonical examples.

---

## Wrong path vs property

Very common confusion.

Incorrect:

```json
{
  "property": "_links"
}
```

when structural traversal is intended.

---

## Wrong each vs eachProperty

Another common issue.

Arrays require:
- `each`

Object maps require:
- `eachProperty`

---

## Wrong interpolation mode

Incorrect:

```json
"body": "${data.someObject}"
```

Correct:

```json
"body": "$data.someObject"
```

---

## Header assertions

Headers use:

```json
{
  "name": "content-type"
}
```

not:

```json
{
  "path": "content-type"
}
```

---

# Current assertion vocabulary

Stable assertions currently include:

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

---

# Intentional exclusions

The current project intentionally avoids:
- schema engines
- setup/teardown orchestration
- custom scripting
- plugin systems
- framework coupling
- hidden runtime behavior

This is intentional.

The project currently values:
- clarity
- predictability
- inspectability
- behavioral visibility

over:
- maximal feature density

---

# Current documentation ecosystem

The documentation system now roughly separates responsibilities as follows:

| Document | Role |
|---|---|
| README | orientation |
| Quick Start | onboarding and mechanics |
| Manifest Spec | authoritative syntax/reference |
| Explainer | conceptual framing |
| Behavioral Modeling paper | architectural/theoretical framing |
| Roadmap | project direction |
| AI Coach | guided collaborative workflow |

This separation emerged gradually and now appears coherent.

---

# Current architectural direction

The project is increasingly converging around several core ideas:

```text
layered behavioral modeling
workflow continuity
governance visibility
hypermedia-aware traversal
behavioral operational artifacts
AI-assisted coaching
```

The project is becoming less about:
- building a generic test framework

and more about:
- creating readable executable behavioral models of HTTP APIs

---

# Important unresolved questions

Several important areas remain exploratory.

---

## Capture namespaces

Possible future namespaces:

```text
captures.*
env.*
```

Still unresolved:
- mutability rules
- visibility semantics
- reviewability implications

---

## Workflow scaling

Questions remain around:
- long-running workflows
- branching workflows
- workflow visualization
- workflow diffing
- continuity diagnostics

---

## Governance depth

Future areas may include:
- authorization modeling
- policy visualization
- permission-sensitive representations
- workflow legality modeling

---

## Reporting ergonomics

Possible future work:
- grouped failures
- workflow summaries
- governance summaries
- layer-oriented reporting

---

# Operational validation status

The current system has now been validated through:
- real layered manifest generation
- recursive traversal testing
- workflow execution
- governance assertions
- debugging sessions
- AI-assisted coaching sessions

This matters because many of the current semantics are no longer speculative.

They survived actual runtime pressure.

---

# Current development philosophy

TRAM is evolving conservatively.

The current emphasis remains:

```text
clarity
behavior visibility
workflow visibility
predictable execution
reviewability
human understanding
```

The long-term goal is not merely:
- a larger assertion engine

The larger goal is:

```text
readable executable behavioral models
of observable API behavior
```
