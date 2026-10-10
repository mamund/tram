# OpenAPI generation report

## Source

Generated from `index.js`, a Node.js/Express Task Management API.

The goal of this pass is to describe the implementation as supplied. No user story,
external API description, or intended domain contract was used to fill gaps.

## Summary

The implementation exposes eight HTTP operations across seven paths:

| Method | Path | Classification |
| --- | --- | --- |
| GET | `/` | Observed |
| GET | `/tasks` | Observed |
| POST | `/tasks` | Observed |
| GET | `/tasks/{id}` | Observed |
| POST | `/tasks/{id}/edit` | Observed |
| PUT | `/tasks/{id}/status` | Observed |
| PUT | `/tasks/{id}/assignee` | Observed |
| PUT | `/tasks/{id}/due-date` | Observed |

The generated document targets OpenAPI 3.1.0 and uses `http://localhost:3000` as
the server because the implementation listens on port 3000.

## Provenance categories

**Observed** means the information is directly represented by executable code.

**Inferred** means the information is strongly suggested by examples or implementation
structure but is not explicitly enforced.

**Undetermined** means the implementation does not provide enough evidence to define
the contract safely.

## Observed contract

### Routes and methods

All paths and HTTP methods in the OpenAPI document come directly from Express route
declarations.

### Task properties

The supplied task data uses these properties:

- `id`
- `title`
- `description`
- `dueDate`
- `status`
- `priority`
- `assignedUser`

Responses add a `_links` property containing hypermedia controls.

### Task creation

`POST /tasks` expects a JSON body containing a `task` object. The implementation
requires `id`, `title`, and `status`. Missing required values produce HTTP 400.
Successful creation produces HTTP 201 and returns the task with links.

### Retrieval

`GET /tasks/{id}` returns the task with links when found and HTTP 404 with an error
object when the identifier is not found.

### Updates

The implementation exposes separate operations for general editing, status, assignee,
and due date changes. The status, assignee, and due-date operations require their
corresponding value and return HTTP 400 when it is absent. All update operations
return HTTP 404 when the target task does not exist.

### Filtering

`GET /tasks` examines every supplied query parameter and performs a case-insensitive
substring comparison against the corresponding task property.

The OpenAPI document lists the properties visible in the supplied task representation
as query parameters. This is partly an OpenAPI modeling choice: the implementation
itself does not maintain a fixed allow-list of filter names.

## Inferred information

### Schema types

Types are inferred from the supplied task values and their use in the implementation:

| Property | Generated type | Basis |
| --- | --- | --- |
| `id` | string | UUID/string values in sample data and route lookup |
| `title` | string | sample values |
| `description` | string | sample values |
| `dueDate` | string | sample values |
| `status` | string | sample values and update logic |
| `priority` | number | numeric sample values |
| `assignedUser` | string | sample values and update logic |

These types describe the implementation examples. With the exception of truthiness
checks on selected fields, the code performs little runtime type validation.

### Operation IDs and descriptions

`operationId`, summaries, and descriptive prose are generated documentation labels.
They do not originate in the implementation.

### Request-body requirement

Express/body-parser makes JSON bodies available to the handlers. Where a handler
dereferences `req.body.task` or explicitly tests for values, the generated OpenAPI
models the corresponding JSON request body. The implementation does not provide a
formal schema validator.

## Deliberately not inferred

### Status enumeration

The sample data contains `active` and `completed`, but the implementation accepts any
truthy status value. The generated OpenAPI therefore defines `status` as a string and
does not add an enum.

### Due-date format

The examples resemble ISO calendar dates, but the implementation does not validate
the value. The generated schema uses `type: string` without `format: date`.

### UUID constraint

Some task IDs are UUIDs, but creation accepts any truthy `id`. The generated schema
therefore uses `type: string` without `format: uuid`.

### Priority constraints

The examples use numeric priority values, but no range, integer requirement, or
enumeration is enforced. No minimum or maximum is included.

### Authentication and authorization

No authentication or authorization mechanism appears in the supplied implementation.
No OpenAPI security scheme is generated.

### General edit validation

`POST /tasks/{id}/edit` merges `req.body.task` into the existing task without defining
which properties may or must be supplied. The generated update schema therefore does
not impose required task properties.

## Undetermined

The implementation does not establish:

- intended API title, public version, licensing, or ownership metadata;
- domain descriptions for task fields;
- whether arbitrary task properties are contractually allowed;
- intended status vocabulary;
- date semantics or validation rules;
- priority semantics or bounds;
- authentication or authorization requirements beyond the supplied code;
- whether the hypermedia link structure is a stable public contract;
- production server URLs;
- additional error conditions that may be intended but are not implemented.

## Generation assessment

This OpenAPI document should be treated as an **implementation-derived description**,
not as an authoritative statement of intended API behavior.

That distinction matters for the next experiment. The OpenAPI document can provide
the HTTP bindings and observable interface mechanics, while a user story can provide
behavioral intent. Comparing those two sources should make it possible to identify
where a TRAM assertion is supported by implementation mechanics, behavioral intent,
or both.
