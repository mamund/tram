# TRAM Assertion Generator Context Kit

## Purpose

Use this context kit to generate a TRAM assertion collection and generation report from:

1. an API Story
2. the associated OpenAPI document

The generator should work for any API domain, such as tasks, persons, orders, inventory, reservations, accounts, or other HTTP APIs.

Behavioral IDs are optional and are not required by this workflow.

---

# Goal

Given an API Story and an OpenAPI document, produce:

1. a runnable TRAM v0.2 assertion manifest
2. a generation report explaining:
   - what was generated
   - what source material justified each class of assertion
   - source conflicts
   - unsupported or missing behavior
   - assumptions that were deliberately avoided

The generated TRAM collection should express observable API behavior without inventing requirements that are absent from the supplied sources.

---

# Required inputs

The user should supply:

- `api-story.md`
- `openapi.yaml` or `openapi.json`

The following supporting files should also be supplied when available:

- current `manifest-spec.md`
- one known-good TRAM manifest, such as `api-tests.json`

If the TRAM manifest specification and example manifest are already included in the working context and are known to be current, they do not need to be supplied again.

---

# Source authority

Use the supplied sources in this order.

## 1. API Story

The API Story is the normative behavioral source.

Use it to determine:

- domain resources
- actions
- action intent
- safe vs unsafe behavior
- required inputs
- optional inputs
- valid values
- ranges
- constraints
- invariants
- business rules
- meaningful workflows
- expected state transitions

When the API Story clearly states what the API MUST or SHOULD do, treat that as the intended behavior.

Do not silently weaken a Story requirement merely because OpenAPI fails to describe it.

---

## 2. OpenAPI

The OpenAPI document is the HTTP implementation map.

Use it to determine:

- paths
- HTTP methods
- query parameters
- request bodies
- request content types
- response status codes
- response content types
- schemas
- required representation properties
- operation identifiers
- documented error responses

OpenAPI describes how the intended behavior is exposed over HTTP.

Do not infer business intent from OpenAPI when the API Story provides a more explicit semantic rule.

---

## 3. TRAM manifest specification

The current TRAM manifest specification is authoritative for:

- manifest version
- legal manifest structure
- supported HTTP methods
- supported assertions
- data references
- interpolation
- capture
- execution ordering
- supported body types
- behavioral levels
- validation constraints

Never generate syntax or assertions unsupported by the current TRAM specification.

---

## 4. Existing TRAM manifest

A known-good TRAM manifest is a style and idiom reference.

Use it for:

- naming style
- tag style
- data organization
- happy-path and sad-path conventions
- typical assertion combinations
- formatting
- practical runner conventions

Do not inherit API-specific assumptions from the example manifest unless they are independently supported by the current API Story or OpenAPI document.

For example, do not add `_links`, pagination fields, authentication behavior, or required properties merely because they appear in the example manifest.

---

# Conflict policy

Do not silently reconcile contradictory sources.

When the API Story and OpenAPI disagree:

1. preserve the Story's normative intent
2. use OpenAPI for the executable HTTP mapping where possible
3. tag affected tests with `openapi-conflict`
4. explain the conflict in the generation report
5. do not invent missing HTTP details

Example:

```text
Story:
CreatePerson requires name but allows id to be omitted.
Service MUST generate id when omitted.

OpenAPI:
POST /persons requires both id and name.
```

Generated treatment:

- generate a governance assertion that attempts creation without `id`
- use the OpenAPI POST path and documented success/error status where possible
- mark the test `story-normative` and `openapi-conflict`
- record the discrepancy in the report

If a conflict prevents a runnable assertion, report it instead of fabricating a solution.

---

# Generation procedure

## Step 1 — Extract the behavioral model

Read the API Story and identify:

- resources
- actions
- action types
- action inputs
- required inputs
- return resources
- valid values
- numeric ranges
- invariants
- explicit rules
- candidate workflows

Create an internal behavior inventory before producing tests.

Behavioral IDs are not required.

Use human-readable behavior names when IDs are absent.

---

## Step 2 — Extract the HTTP model

Read OpenAPI and identify for every operation:

- operationId
- path
- method
- parameters
- request schema
- required request properties
- response status codes
- response schema
- response headers/content type when available

Map Story actions to OpenAPI operations primarily by:

1. matching semantic/action names
2. operationId
3. summary/description
4. path and method semantics

If an action cannot be mapped confidently, report it as unmapped.

---

## Step 3 — Compare Story and OpenAPI

Before generating assertions, identify:

- missing OpenAPI operations
- missing Story actions
- required-field disagreements
- method/type disagreements
- representation disagreements
- enum/value-set gaps
- range gaps
- missing schemas
- undocumented errors
- undocumented rules
- implementation details present only in OpenAPI

Preserve this list for the generation report.

---

# TRAM level generation rules

Generate tests only when supported by the source material.

Tests may be tagged by level even when runtime dependencies require a different execution order.

## Level 0 — Surface

Question:

> Can the API be reached?

Generate high-confidence checks for reachable operations, especially safe entry points.

Typical assertions:

- expected success status
- JSON content type when documented

Examples:

```json
{
  "method": "GET",
  "path": "/persons",
  "expect": {
    "status": 200,
    "headers": [
      {
        "name": "content-type",
        "contains": "application/json"
      }
    ]
  }
}
```

Avoid requiring body structure at Level 0.

---

## Level 1 — Shape

Question:

> Do resources and affordances appear correctly?

Generate assertions from Story properties plus OpenAPI schemas.

Typical assertions:

- `isArray`
- `hasProperties`
- `type`
- `oneOf`
- `range`
- optional-property type checks
- nested structural checks when explicitly defined

Required properties should come from the strongest supported combination of Story and OpenAPI.

Do not require optional Story properties merely because an older example manifest required them.

TRAM native `type` checks must use only supported native types:

```text
string
number
boolean
array
object
null
```

Do not invent UUID, email, URI, date, date-time, or regex assertions when the TRAM specification does not support them.

---

## Level 2 — Safe behavior

Question:

> Do navigation, lookup, filtering, and query interactions behave correctly?

Generate tests for Story actions classified as safe and mapped to GET or another documented safe HTTP interaction.

Typical behavior:

- retrieve collection
- retrieve single item
- lookup by identifier
- filter by individual supported fields
- query interactions
- unknown-resource lookup where OpenAPI documents an error

For filters, use source-defined semantics.

Do not assume whether string matching is exact, partial, prefix, fuzzy, or case-insensitive unless the sources say so.

If a generated positive filter test necessarily assumes equality because TRAM must assert an observable result, note that assumption in the generation report.

---

## Level 3 — Unsafe behavior

Question:

> Do isolated state-changing actions behave correctly?

Generate tests for:

- create
- edit
- update
- assignment
- state changes
- other mutating operations explicitly described in the sources

Use the HTTP method actually documented by OpenAPI, even when that creates a semantic conflict with the Story.

Mark such cases `openapi-conflict`.

Where later tests require known state, generate seed/setup operations using run-scoped data.

Prefer stable values initialized under `data`:

```json
"data": {
  "seed": {
    "id": "${uuid}"
  }
}
```

Do not add unsupported setup/teardown scripting.

---

## Level 4 — Workflow

Question:

> Can meaningful operational narratives be completed successfully?

Construct workflows only from sequences supported by the Story.

Typical pattern:

```text
create
read after create
edit/update
apply additional mutation
read final state
verify accumulated state
```

Workflow tests should read like an operational narrative.

Because TRAM executes tests sequentially, place tests in dependency order.

Do not force numeric level ordering when a Level 3 setup action must precede a Level 2 or Level 4 assertion.

Use tags to preserve level classification.

Prefer final-state verification over merely checking every intermediate response.

---

## Level 5 — Governance

Question:

> Are policies, constraints, permissions, and semantic rules enforced correctly?

Generate governance assertions from explicit Story rules and clearly supported OpenAPI error behavior.

Candidate governance areas include:

- required inputs
- generated identifiers
- duplicate identifiers
- allowed value sets
- numeric ranges
- invalid transitions
- invariants
- ownership constraints
- permissions
- semantic legitimacy
- error consistency

Do not invent authorization or permission rules if none are supplied.

When Story specifies invalid behavior but OpenAPI only supplies a generic `400 Invalid input`, it is acceptable to use status 400 while documenting that the exact error-body contract is unspecified.

Do not assert error-body text unless the API Story or OpenAPI defines it.

---

# Test data rules

Use deterministic, readable test data.

Use TRAM runtime tokens where useful:

```text
${randomId}
${timestamp}
${uuid}
${randomEmail}
```

Prefer run-scoped data for values reused across tests.

Example:

```json
"data": {
  "seed": {
    "id": "${uuid}",
    "name": "TRAM generated person"
  }
}
```

Use:

```json
"$data.someObject"
```

for object injection.

Use:

```json
"${data.someValue}"
```

for string/value interpolation.

Use response capture only when the response shape makes capture reliable and the workflow needs server-generated values.

Do not use capture merely because it is available.

---

# Capture guidance

Capture is especially useful when:

- the server generates an identifier
- a later operation must address the newly created resource
- the create response directly exposes the generated value
- the response exposes an affordance needed later

Example:

```json
"capture": {
  "personId": "body.id"
}
```

Later:

```json
"path": "/persons/${capture.personId}"
```

If the create operation returns a collection rather than a single created object and there is no reliable direct path to the generated id, do not invent a capture expression.

Use another supported observable operation, such as filtering by a unique test title/name, when justified.

---

# Assertion strength rules

Prefer the strongest assertion justified by the sources, but no stronger.

Examples:

Source says:

```text
status is active or completed
```

Generate:

```json
{
  "path": "$.status",
  "oneOf": ["active", "completed"]
}
```

Source says:

```text
priority is a number between 1 and 5
```

Generate:

```json
{
  "path": "$.priority",
  "type": "number"
}
```

and:

```json
{
  "path": "$.priority",
  "range": {
    "min": 1,
    "max": 5
  }
}
```

Source only says:

```text
description is optional text
```

Generate an optional string assertion.

Do not turn descriptive examples into normative rules unless the source clearly treats them as rules.

---

# Naming and tagging

Use stable, readable test IDs even when behavioral IDs are absent.

Recommended pattern:

```text
surface-...
shape-...
safe-...
unsafe-...
workflow-...
governance-...
```

Example:

```text
surface-person-collection
shape-person-collection
safe-get-person
unsafe-create-person
workflow-create-update-person
governance-reject-duplicate-id
```

Recommended tags:

```text
level-0
level-1
level-2
level-3
level-4
level-5

surface
shape
safe
unsafe
workflow
governance

happy-path
sad-path
setup

story-normative
openapi-conflict
openapi-gap
```

---

# Execution ordering

TRAM tests execute sequentially.

Order tests by runtime dependency, not merely by level number.

For example:

```text
Level 0 surface checks
Level 1 collection shape
Level 3 create seed
Level 2 single-item lookup
Level 2 filters
Level 3 mutations
Level 4 workflow
Level 5 governance
```

A generated report should explicitly state when execution order differs from behavioral level order.

---

# Cleanup

TRAM currently does not provide dedicated setup/teardown orchestration.

If the API defines DELETE:

- cleanup tests may be generated when appropriate
- do not let cleanup obscure the behavioral assertion being tested

If DELETE is absent:

- use run-scoped unique identifiers to avoid collisions
- report that successful test runs may leave test records behind
- do not invent a cleanup mechanism

---

# Base URL

If OpenAPI contains `servers`, use the appropriate server URL only when it clearly represents the intended test target.

If no server is supplied:

- use a user-provided base URL when available
- otherwise use the base URL from the supplied known-good TRAM manifest
- clearly report that choice

Do not silently invent a production endpoint.

A local default such as:

```text
http://localhost:3000
```

may be used only when supported by the supplied TRAM context/example or explicitly requested.

---

# Output 1 — TRAM assertion manifest

Generate one JSON manifest conforming to the current TRAM manifest specification.

Recommended filename:

```text
<api-name>-tram-assertions.json
```

Recommended top-level form:

```json
{
  "manifestVersion": "0.2",
  "version": "1.0.0",
  "name": "<API Name> — Generated TRAM Assertion Collection",
  "description": "...",
  "config": {
    "baseUrl": "..."
  },
  "data": {},
  "tests": []
}
```

The collection should contain all justified Levels 0–5 assertions that can be expressed by the current TRAM specification.

A "full set" means:

> all assertions reasonably supported by the supplied Story, OpenAPI, and TRAM capabilities

It does not mean manufacturing a test for every possible edge case.

---

# Output 2 — Generation report

Generate:

```text
generation-report.md
```

The report should contain the following sections.

## Inputs

List all source artifacts and their authority.

## Generated collection

Provide a summary table:

| TRAM level | Generated tests | Main coverage |
|---|---:|---|

## Story-to-OpenAPI mapping

Provide a concise table:

| Story action | OpenAPI operation | Result |
|---|---|---|

Results may include:

```text
Mapped
Conflict
Partial
Unmapped
```

## Source conflicts preserved

For each conflict state:

1. what the Story says
2. what OpenAPI says
3. generated treatment

## OpenAPI gaps

Examples:

- missing schema
- missing enum
- missing range
- undocumented error body
- missing server
- inconsistent required flag

## Deliberately not generated

Explain assertions that might appear tempting but lack source support.

Examples:

- hypermedia links not specified
- authentication not specified
- DELETE not specified
- semantic format validation unsupported by TRAM
- exact error text unspecified

## Execution notes

Document:

- dependency ordering
- seed data
- capture usage
- cleanup limitations
- persistent test records
- base URL choice

## Review candidates

List assertions that deserve human review because they rely on:

- Story/OpenAPI conflict
- ambiguous filter semantics
- generic OpenAPI error responses
- partially specified workflows

---

# Validation checklist

Before delivering the manifest, verify:

- `manifestVersion` matches the current specification
- all required top-level fields exist
- every test has `name`, `method`, `path`, and `expect`
- test IDs are unique
- all HTTP methods are supported by TRAM
- all body types are supported
- all assertions exist in the current TRAM assertion reference
- `each` is used only for arrays
- `eachProperty` is used only for object maps
- `oneOf` is used for scalar allowed values
- `anyOf`, `allOf`, and `noneOf` are used only for arrays
- `range` is used only for numeric values
- optional assertions follow current TRAM optional semantics
- object injection uses `$data.x`
- interpolation uses `${data.x}` or `${capture.x}`
- tests are in dependency order
- Story/OpenAPI conflicts are tagged and reported
- no behavior unsupported by the sources has been invented

When possible, run structural validation with:

```bash
tram <generated-manifest>.json --validate
```

If the TRAM executable is unavailable, perform best-effort structural validation against the supplied manifest specification and state that runtime validation was not performed.

---

# Generator behavior

When performing this task:

1. read all supplied files before generation
2. do not ask for behavioral IDs
3. do not require ALPS
4. do not require an existing TRAM suite
5. use the API Story and OpenAPI as the minimum viable input pair
6. use current TRAM documentation when supplied
7. surface inconsistencies instead of silently correcting them
8. generate runnable assertions where the sources provide enough information
9. report gaps where they do not
10. provide downloadable output files

---

# Reusable invocation prompt

Use this prompt with the context kit:

```text
Generate a TRAM assertion collection from the attached API Story and OpenAPI document.

Use the TRAM Assertion Generator Context Kit as the generation procedure.

Treat the API Story as the normative behavioral source and OpenAPI as the HTTP implementation map.

Generate:
1. <api-name>-tram-assertions.json
2. generation-report.md

Generate all justified TRAM Levels 0–5 assertions supported by the supplied sources.

Do not require behavioral IDs.

Do not silently reconcile Story/OpenAPI conflicts. Preserve them in the generated assertions where executable, tag them appropriately, and document them in the generation report.

Do not invent behaviors, schemas, error bodies, permissions, workflow rules, or representation details absent from the supplied sources.

Use runtime dependency order for the test collection while preserving TRAM level classifications through tags.
```

---

# Minimal future workflow

For future APIs, supply:

```text
TRAM Assertion Generator Context Kit
+
API Story
+
OpenAPI
```

Optionally add:

```text
current TRAM manifest spec
+
known-good TRAM manifest
```

Then request:

```text
Generate the TRAM assertion collection and generation report.
```

Expected outputs:

```text
<api-name>-tram-assertions.json
generation-report.md
```
