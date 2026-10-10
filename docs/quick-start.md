# TRAM quick start

Run your first TRAM behavioral API test against a public endpoint. This walkthrough requires Node.js 18+, an internet connection, and no local API server.

TRAM executes a JSON manifest containing HTTP requests and assertions. It records the observed responses and evaluates them against the expected behavior.

## 1. Install TRAM

Once the beta is published to npm, install it with:

```bash
npm install -g @mamund/tram@beta
```

Check the command:

```bash
tram --help
```

Before npm publication, use the source checkout instead: `npm link` from the repository root.

## 2. Create a manifest

Create a file named `quick-start.json` containing:

```json
{
  "manifestVersion": "0.2",
  "name": "JSONPlaceholder quick start",
  "config": {
    "baseUrl": "https://jsonplaceholder.typicode.com"
  },
  "tests": [
    {
      "id": "todo-1",
      "name": "Retrieve a known todo",
      "method": "GET",
      "path": "/todos/1",
      "expect": {
        "status": 200,
        "headers": [
          { "name": "content-type", "contains": "application/json" }
        ],
        "body": [
          { "path": "$.id", "equals": 1 },
          { "path": "$.userId", "type": "number" },
          { "path": "$.completed", "type": "boolean" }
        ]
      }
    }
  ]
}
```

This example uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/), a public demonstration REST API. It tests the HTTP response and selected JSON fields without requiring credentials or modifying server state.

## 3. Validate the manifest

```bash
tram quick-start.json --validate
```

Validation checks the manifest structure without sending an HTTP request. A successful validation confirms that the manifest can be parsed; it does not establish that the API behaves as expected.

## 4. Run the test and collect evidence

```bash
tram quick-start.json --report results.json --transcript transcript.http
```

TRAM requests `/todos/1`, checks the HTTP status, response header, and JSON body, and writes two evidence files. A successful run exits with status `0`; failed tests return a nonzero exit status.

The endpoint is an external service. A network outage, service change, or rate limit can cause this example to fail independently of TRAM.

## 5. Inspect the results

Open `results.json` to examine assertion results and the test summary. Open `transcript.http` to review the HTTP exchange.

The evidence chain is:

```text
Manifest → HTTP request/response → Assertions → Report and transcript
```

Try changing `"equals": 1` to `"equals": 999` and rerun the manifest. The test should fail and the report should preserve the observed value alongside the failed assertion. Restore the original value afterward.

## Continue learning

The [manifest specification](manifest-spec.md) documents available assertion operators, runtime data, and capture. For a stateful API example involving writes and reuse of captured values, see the [Tasks API tutorial](tasks-api-tutorial.md) (planned for the next documentation round). The Tasks API runs locally from the [TRAM repository](https://github.com/mamund/tram).

**Security note:** Reports and transcripts may contain API data. TRAM redacts a defined set of sensitive HTTP headers, but does not automatically remove secrets from URLs, bodies, or all assertion evidence. See [beta status](beta-status.md).
