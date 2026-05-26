# TRAM Manifest Specification Update Notes

The specification document was already strong, but the completed Level 0–5 manifest work surfaced several operational semantics that are now stable enough to document explicitly.

The updated specification should now include:

- behavioral layering model
- traversal semantics (`each` vs `eachProperty`)
- `path` vs `property` semantics
- object injection vs interpolation semantics
- workflow-oriented behavioral modeling guidance
- clearer governance examples
- clarified optional assertion behavior
- nested traversal examples validated against the runtime

Recommended additions include:

## Behavioral layering

Document the six progressive testing layers:

- Level 0 — Surface
- Level 1 — Shape
- Level 2 — Safe behavior
- Level 3 — Unsafe behavior
- Level 4 — Workflow
- Level 5 — Governance

## Traversal semantics

Clarify:

- `each` operates on arrays
- `eachProperty` operates on object maps

## path vs property semantics

Clarify:

- `path` => structural traversal
- `property` => scalar leaf checks

## Runtime interpolation semantics

Clarify:

- `$data.*` => object injection
- `${data.*}` => string interpolation

## Workflow modeling

Add examples showing:
- accumulated state
- reusable workflow-scoped IDs
- final-state verification

## Governance semantics

Clarify distinction between:
- representation shape
- semantic legitimacy

The completed layered manifests now provide canonical examples for the specification itself.


The existing manifest specification is already structurally sound. Most required changes are clarifications based on validated runtime behavior rather than redesigns of the manifest model.
