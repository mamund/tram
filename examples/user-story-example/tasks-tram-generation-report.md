# TRAM generation report

## Inputs

This generation pass uses:

1. the supplied user story;
2. the reviewed ERI analysis;
3. the implementation-derived OpenAPI 3.1 document; and
4. TRAM Manifest Specification v0.2.

### User story

> As a USER  
> I want to CREATE A NEW TASK  
> in order to KEEP TRACK OF MY WORK

## Generation rule

The ERI report supplies the behavioral claims. OpenAPI supplies HTTP bindings and
observable response mechanics. TRAM expresses selected observations as executable
evidence.

No additional behavioral requirements were invented from OpenAPI.

## Generated manifest

`tasks-tram-manifest.json`

The manifest contains three executable tests arranged in dependency order:

1. create a valid task and capture its identity;
2. retrieve that same task and compare its observable identity/data;
3. submit an invalid creation request and observe rejection.

## Traceability

| TRAM test | ERI source | Class | Behavioral claim | Evidence requirement | OpenAPI binding | TRAM evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `eri-001-create-task` | ERI-001, with ERI-002/004 support | Explicit / Required | A user can create a new task; creation can succeed with sufficient input and success is distinguishable. | Valid creation succeeds and returns an identifiable representation. | `POST /tasks`, request requires `task.id`, `task.title`, `task.status`; success `201`. | Assert `201`, JSON response, returned task properties; capture `body.id` and `body.title`. |
| `eri-003-retrieve-created-task` | ERI-003, ERI-005 | Required / Implied | The created task can be identified and subsequently observed. | The exact task created in the prior step can be retrieved. | `GET /tasks/{id}`, success `200`. | Use `${capture.createdTaskId}` in the path; assert returned id/title/status. |
| `eri-006-reject-invalid-create` | ERI-006 | Implied | An invalid creation request does not result in successful creation. | Omit a contract-required field and observe rejection. | `POST /tasks`, missing required field documented as `400`. | Submit task without `title`; assert `400` and the observed error representation. |

## ERI coverage

### ERI-001 — Explicit

**Claim:** A user can create a new task.

Covered directly by `eri-001-create-task`.

### ERI-002 — Required

**Claim:** A creation request contains enough information for the API to create a task.

Covered as supporting evidence in `eri-001-create-task`. The request supplies the
OpenAPI-required `id`, `title`, and `status`.

A separate test was not generated because ERI-002 describes a precondition of the
same successful creation behavior rather than an independent observable outcome.

### ERI-003 — Required

**Claim:** A successfully created task can be identified as the task that was created.

Covered by both the creation response and `eri-003-retrieve-created-task`. The
creation test captures the returned `id`; the workflow test uses that captured value
to retrieve and identify the same task.

### ERI-004 — Required

**Claim:** Successful creation can be distinguished from unsuccessful creation.

Covered by the `201` assertion in `eri-001-create-task`. The negative case is also
exercised by ERI-006.

A separate test was not generated because the success status is direct evidence
within the creation test.

### ERI-005 — Implied

**Claim:** The created task can subsequently be retrieved or otherwise observed.

Covered by `eri-003-retrieve-created-task`.

This remains tagged as Implied. The HTTP binding makes the behavior executable, but
the classification comes from the interpretation of “KEEP TRACK OF MY WORK.”

### ERI-006 — Implied

**Claim:** An invalid creation request does not result in successful task creation.

Covered by `eri-006-reject-invalid-create`.

The concrete missing-`title` case comes from the OpenAPI-required fields and observed
implementation error behavior. The broader behavioral expectation remains Implied.

## Important generation choices

### One creation supports several claims

The manifest does not create one test per ERI row. Several ERI claims concern the
same observable event. Combining them avoids duplicating state-changing requests while
retaining traceability in this report.

### Capture creates the evidence chain

The first test captures:

- `body.id` as `createdTaskId`
- `body.title` as `createdTaskTitle`

TRAM v0.2 makes captured response values available to later tests. The retrieval test
therefore establishes continuity between creation and subsequent observation instead
of retrieving an unrelated pre-existing task.

### Assertions stay within TRAM's native vocabulary

The manifest uses status, header `contains`, body `hasProperties`, and body `equals`.
It does not invent UUID, date-format, enum, or regex constraints that are absent from
the source contract or unsupported by the TRAM assertion vocabulary.

## What was not generated

No assertions were generated for:

- authentication or authorization;
- priority ranges;
- a fixed status enumeration;
- due-date formatting;
- editing, assignment, status-change, or due-date operations;
- filtering;
- API-home hypermedia navigation.

Those capabilities appear in the implementation-derived OpenAPI, but this user story
does not provide behavioral intent for them.

## Review boundary

This manifest is ready for TRAM validation, but it has not been executed against the
Node.js API as part of this generation step.

The next evidence step is:

`TRAM manifest → validate → execute against API → evidence report`

## Summary

Six ERI claims produced three executable TRAM tests.

The reduction is intentional. ERI identifies behavioral claims; generation groups
claims that can be substantiated by the same observation. The resulting manifest
preserves a trace from user intent through ERI classification and HTTP binding to
executable evidence.
