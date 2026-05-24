# Executable Behavioral Modeling for APIs

## A layered approach to modeling observable API behavior

Most API test suites accumulate over time. A smoke test is added to verify deployment. A schema check appears later. Workflow scenarios arrive after production failures. Authorization checks are folded in after a security review. Eventually the entire collection becomes difficult to reason about because unrelated concerns sit side-by-side with little distinction between them.

A route existence check and a workflow continuity check may both be called “tests,” but they answer very different questions.

TRAM began as an exploratory attempt to simplify executable API assertions. Along the way, another pattern started to emerge. API assertions appeared to fall naturally into layers of observable behavior. Some assertions focused on whether an endpoint existed at all. Others focused on resource shape, action semantics, workflow continuity, or governance constraints.

This document outlines one possible way to think about those layers.

The goal here is not to define a formal testing taxonomy. The layers described below overlap in places and will likely evolve over time. The intent is simpler than that: separate concerns clearly enough that manifests become easier to generate, review, reason about, and maintain.

## A progressive model

The layers described in this document can be viewed as a progression from basic API capability verification toward operational and policy modeling.

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

Levels 0–2 primarily verify observable API capability. Workflow and governance layers move closer to operational narratives, domain constraints, and business intent.

## Two dimensions of TRAM assertions

One of the most useful distinctions to emerge from this work is that behavioral intent and assertion location are not the same thing.

Behavioral layers describe what kind of question an assertion is asking. Assertion targets describe where observations occur during the HTTP interaction.

For example, a governance assertion may inspect:
- a protocol status code
- a metadata header
- a body representation

while still remaining fundamentally a governance concern.

Similarly, a shape assertion may verify:
- JSON structure in the response body
- media type metadata
- pagination headers

without becoming a workflow assertion.

In practice, TRAM assertions tend to inspect three observable locations.

### Protocol

Protocol assertions focus on HTTP-level mechanics:
- methods
- status codes
- redirects
- content negotiation
- caching behavior

Examples:

```json
{ "assert": "status", "value": 200 }
{ "assert": "method", "value": "GET" }
```

### Metadata

Metadata assertions focus on information carried outside the primary representation:
- headers
- links
- pagination controls
- authentication challenges
- ETags
- continuation tokens
- rate-limit information

In hypermedia-oriented systems, metadata often carries important runtime behavior. Affordances may appear in headers, link maps, or negotiated representations rather than inside resource bodies alone.

### Body

Body assertions focus on the representation itself:
- resource properties
- collections
- embedded affordances
- payload content
- returned state

These assertion targets exist independently from the behavioral layers described below.

## Level 0: Surface — what is exposed?

The simplest TRAM assertion asks a minimal question:

> Does the published endpoint respond?

A surface manifest verifies the observable API surface:
- published routes
- supported methods
- callable interfaces

For example:

```json
{
  "request": {
    "method": "GET",
    "path": "/tasks"
  },
  "expect": {
    "status": 200
  }
}
```

Surface assertions are intentionally lightweight. They do not verify business correctness, workflow continuity, or resource semantics. They simply confirm that the advertised interface exists and responds as expected.

This level is useful for:
- smoke testing
- deployment validation
- route inventory verification
- documentation cross-checking

Surface assertions also help separate observed capability from assumed capability. A system may support editing resources while intentionally omitting deletion. A surface manifest makes that distinction visible immediately.

## Level 1: Shape — what is represented?

Shape assertions move from endpoint existence to representation structure.

At this layer, the question becomes:

> Does this resemble the advertised resource?

Shape assertions typically verify:
- expected properties
- collection structures
- embedded affordances
- representation composition
- basic typing expectations

Examples:

```json
{ "path": "id", "assert": "isString" }
{ "path": "priority", "assert": "isNumber" }
{ "path": "_links", "assert": "isObject" }
```

Shape manifests often verify affordance presence explicitly:

```json
{
  "path": "$._links",
  "hasProperties": [
    "self",
    "edit",
    "updateStatus",
    "assignUser"
  ]
}
```

This layer maps closely to the RESOURCE concepts used in API Stories. The focus is on representation shape rather than behavioral correctness.

That distinction matters.

A representation may be structurally valid while still violating domain rules. For example:

```json
{
  "status": "flying-purple-banana"
}
```

may satisfy basic shape assertions while remaining semantically invalid within the domain.

Shape assertions focus on structural validity and recognizable representation patterns. Governance assertions, discussed later, address semantic legitimacy and policy constraints.

This distinction is especially important for type assertions.

```json
{ "path": "priority", "assert": "isNumber" }
```

is primarily a shape concern because it verifies structural form.

Meanwhile:

```json
{ "path": "priority", "assert": "range", "min": 1, "max": 5 }
```

is fundamentally a governance concern because it expresses domain legitimacy rather than representation structure.

## Level 2a: Safe behavior — what can be observed?

Safe behavior assertions verify interactions that do not intentionally change server state.

Examples include:
- navigation
- filtering
- search
- affordance traversal
- query operations

Examples:

```json
{
  "request": {
    "method": "GET",
    "path": "/tasks?status=completed"
  }
}
```

or:

```json
{
  "path": "_links.goTaskList.href",
  "assert": "equals",
  "value": "/tasks"
}
```

Safe behavior manifests verify semantic interaction rather than HTTP mechanics alone.

This distinction becomes especially useful in hypermedia-oriented systems where meaningful actions may be expressed through:
- links
- forms
- metadata
- affordances
- negotiated runtime state

rather than through static route catalogs alone.

## Level 2b: Unsafe behavior — what can be changed?

Unsafe behavior assertions focus on isolated state-changing operations:
- create
- update
- assignment
- status transitions
- workflow advancement

Examples:

```json
{
  "request": {
    "method": "PUT",
    "path": "/tasks/123/status"
  }
}
```

At this layer, assertions typically verify:
- the action succeeds
- the expected state change appears
- the returned representation reflects the mutation

Unsafe behavior manifests intentionally avoid accumulated continuity assumptions. They focus on isolated semantic actions rather than long-running narratives.

This layer maps closely to the ACTION elements used in API Stories.

## Level 3: Workflow — what holds together over time?

Workflow assertions verify continuity across multiple interactions.

Many systems pass isolated behavior assertions while still failing real workflows. State may drift. Side effects may accumulate incorrectly. One valid action may unintentionally invalidate another.

Workflow manifests focus on coordinated sequences such as:

```text
create → edit → complete
```

or:

```text
search → select → update
```

At this layer, the system is evaluated across:
- sequencing
- accumulated state
- continuity
- state preservation
- cross-action assumptions

Workflow assertions are especially valuable in distributed systems where correctness often depends on interaction over time rather than isolated request handling.

This layer also begins to intersect strongly with:
- user stories
- operational scenarios
- BDD narratives
- API Story scenarios

Earlier layers primarily ask:

> Does the API function correctly?

Workflow manifests ask:

> Can users accomplish meaningful goals successfully?

That shift is important. Workflow manifests are often organized around operational narratives rather than around individual endpoints.

Examples:
- task lifecycle workflow
- assignment workflow
- completion workflow
- review workflow

rather than:
- PUT status tests
- POST edit tests

Workflow manifests are also effectively unbounded. As systems evolve, new operational narratives emerge naturally.

## Level 4: Governance — what is permitted?

Governance assertions verify constraints, permissions, invariants, and policy rules.

Historically, these concerns are often grouped under “negative testing” or “sad path testing.” That framing is useful in some contexts but too limited here. Governance assertions are broader than failure conditions alone.

Governance assertions may verify:
- required fields
- ownership rules
- authorization
- legal state transitions
- read-only restrictions
- policy invariants
- rate limits

Examples:

```json
{
  "assert": "status",
  "value": 400
}
```

or:

```json
{
  "path": "error",
  "assert": "equals",
  "value": "Missing required field: status"
}
```

The distinction between shape and governance becomes important at this layer.

Shape asks:

> What form does this representation take?

Governance asks:

> What meanings and constraints apply to it?

Governance manifests may describe:
- currently enforced rules
- proposed future rules
- expected policy boundaries

For exploratory systems, this distinction can be useful:

```text
Observed governance
Rules enforced by the running API.

Proposed governance
Rules suggested by the domain model, API Story, or operational requirements.
```

Governance assertions help make implicit policies observable and executable.

## Why separate the layers?

Separating behavioral concerns into layers offers several practical advantages.

First, manifests become easier to reason about. A failed surface assertion tells a very different story from a failed workflow assertion. Separating those concerns improves failure visibility and reduces debugging noise.

Second, layered manifests are easier to review collaboratively. A resource designer may focus primarily on shape assertions while a security reviewer focuses on governance assertions.

Third, the separation reduces scenario explosion. Traditional behavioral suites often accumulate large, overlapping workflows that combine representation concerns, policy checks, state transitions, and authorization rules into single scenarios. Smaller layered assertions are easier to compose and evolve over time.

The model also appears to align naturally with AI-assisted manifest generation. Surface and shape assertions can often be inferred from static descriptions such as OpenAPI documents, ALPS profiles, API Stories, or source scanning. Workflow and governance assertions usually require deeper domain understanding and runtime knowledge.

## Additive manifests and long-term evolution

TRAM manifests also compose well operationally.

New API features can ship with new manifests without requiring older manifests to be rewritten. Existing manifests remain as cumulative regression coverage.

For example:

```text
surface manifest
+ shape manifest
+ safe behavior manifest
+ unsafe behavior manifest
+ workflow manifests
+ governance manifests
+ feature-specific manifests
```

A pipeline may simply execute all manifests as part of deployment validation:

```bash
tram manifests/*.json
```

This allows manifests to evolve incrementally alongside the API itself.

Viewed this way, TRAM manifests become not only executable verification artifacts, but also a growing behavioral record of the system over time.

## Closing notes

The layers described here are intentionally exploratory rather than prescriptive. Different systems may organize manifests differently. Some assertions will overlap multiple layers. Other systems may discover entirely different organizational patterns over time.

The value of the model lies less in strict categorization and more in separating concerns clearly enough that observable system behavior becomes easier to describe and verify.

Viewed this way, TRAM manifests become more than executable tests alone. They also become readable behavioral models of running systems.
