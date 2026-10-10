# Tasks API tutorial

This tutorial uses the local Tasks API included in the [TRAM source repository](https://github.com/mamund/tram). It builds on the [public API quick start](quick-start.md) by testing a service that supports both retrieval and state-changing requests.

**What you'll learn:** run a local API, execute a multi-test manifest, inspect passing and failing assertions, use runtime data, and review HTTP evidence.

## Prerequisites

- Node.js 18 or later and npm.
- TRAM installed from npm (`npm install -g tram@beta` after publication), or linked from a source checkout with `npm link`.
- A local checkout of the repository, because the Tasks API and its manifest are not included in the npm package.

```bash
git clone https://github.com/mamund/tram.git
cd tram
```

If you already have a checkout, use it rather than cloning again. The sample is in `api-samples/tasks/`.

## 1. Start the Tasks API

From the repository root:

```bash
cd api-samples/tasks
npm install
npm start
```

Keep this terminal open. The server listens at `http://localhost:3000`. In a second terminal, check it:

```bash
curl http://localhost:3000/
```

The root response includes `_links` with `taskList` and `createTask` affordances. If port 3000 is occupied, stop the conflicting service; the sample currently uses a fixed port.

## 2. Inspect the supplied manifest

From the repository root, the manifest is `api-samples/tasks/api-tests.json`. It declares `manifestVersion: "0.1"` and a `config.baseUrl` of `http://localhost:3000`.

The `tests` array covers these behaviors:

| Test ID | Expected behavior |
| --- | --- |
| `root-get` | API root exposes navigational links |
| `tasks-list` | Task collection has the expected shape |
| `task-get-single` | A known task can be retrieved |
| `task-get-missing` | Unknown task returns HTTP 404 |
| `task-create-valid` | Valid task creation returns HTTP 201 |
| `task-create-missing-title` | Missing title returns HTTP 400 |
| `task-create-invalid-status` | Missing status returns HTTP 400 |
| `task-update-status` | Updating a task's status succeeds |
| `task-filter-active` | Active tasks can be filtered |
| `task-filter-completed` | Completed tasks can be filtered |

The `task-create-invalid-status` identifier is historical: the payload actually omits `status`, and the server checks for a missing required field. The sample does **not** currently enforce an enumeration of permitted status values.

## 3. Validate the manifest

Open another terminal at the repository root:

```bash
tram api-samples/tasks/api-tests.json --validate
```

Validation checks the manifest's structure without contacting the API. This is useful even when the sample server is stopped.

## 4. Execute the tests and collect evidence

```bash
tram api-samples/tasks/api-tests.json \
  --report tasks-results.json \
  --transcript tasks-transcript.http
```

With a fresh sample server, the expected summary is **10 passed, 0 failed, 0 skipped**. TRAM writes the JSON report and HTTP transcript into the current working directory. A failed test causes a nonzero exit code.

The sample changes server state. Restart the server to restore its initial in-memory task collection before repeating the full suite. Repeated runs without a restart can add duplicate sample tasks and affect collection-based assertions.

## 5. Read an assertion

The `root-get` test requests `GET /`. Its assertions check HTTP 200, a JSON content type, and the presence and structure of `_links`. This tests an observable contract: clients can discover the available operations from the API root.

The `task-get-missing` test expects HTTP **404**. A passing test here means the API correctly rejected the lookup. TRAM's pass/fail result describes whether the **observed response matched the expectation**, rather than whether the HTTP status was in the 2xx range.

## 6. Understand runtime data

In the manifest's `data` section, the entry `stable.guid` contains the known identifier of an initial task. The test `task-get-single` uses it in its path:

```json
"path": "/tasks/${data.stable.guid}"
```

The `task-create-valid` test uses a data reference as its request body:

```json
"body": "$data.task.valid"
```

This keeps example values in one place and allows TRAM to interpolate them when requests are constructed. The sample also uses `${randomId}` to generate identifiers.

## 7. Inspect the evidence

Open `tasks-results.json` to examine the suite summary, individual test results, and assertion outcomes. Open `tasks-transcript.http` to inspect the requests and responses. The transcript is evidence of what the API returned during this particular run.

Try changing the `task-get-missing` test's expected HTTP status from `404` to `200`. Run the suite again against a restarted server. The assertion should fail and the report should record the observed status. Restore `404` afterward.

## 8. Where to go next

The sample manifest uses format `0.1`. TRAM also supports manifest `0.2`, which adds **response capture**: a test can extract a value from a response and use it in a later request. This existing Tasks API manifest does not exercise capture. See the [manifest specification](manifest-spec.md) for capture syntax and the [beta status](beta-status.md) for current limitations.

For a useful follow-on exercise, add a `0.2` test that creates a task, captures its returned `id`, and uses that value in a subsequent `GET /tasks/{id}` request. Keep that experiment separate from the baseline suite until its assertions are verified.

**Security:** Reports and transcripts can contain request and response data. TRAM redacts selected sensitive HTTP headers, but does not automatically remove secrets from URLs, bodies, or all assertion evidence. Review artifacts before sharing them.
