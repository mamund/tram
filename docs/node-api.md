# Using TRAM as a Node.js module

TRAM supports a command-line interface and a public CommonJS Node.js API. Both use the same manifest format and execution engine. The API is available from version 0.2.0, published under the `beta` distribution tag; the `latest` tag can still point to 0.1.0, which **does not include the API**.

## Installation

Install the beta, which contains the public API:

```bash
npm install @mamund/tram@beta
```

Import the module with `require`:

```js
const { loadManifest, validateManifest, run } = require('@mamund/tram');
```

To try the API before publication, use the source checkout and the [Tasks example](../examples/node-api/README.md).

## API reference

| Function | Behavior |
| --- | --- |
| `loadManifest(path)` | Reads and parses a JSON manifest from a filesystem path; throws if the file cannot be read or parsed. |
| `validateManifest(manifest)` | Validates a manifest object; throws on validation errors; returns `undefined` on success. |
| `run(manifest)` | Validates the supplied manifest, executes its tests, and resolves to a structured result object. |

`run` accepts an **already-loaded manifest object**, not a path. The returned object contains `summary` and `results` along with manifest metadata. `summary` contains `total`, `passed`, `failed`, and `skipped` counts. Each result includes the outcome and available HTTP evidence.

```js
const { loadManifest, run } = require('@mamund/tram');

async function main() {
  const manifest = loadManifest('./api-tests.json');
  const outcome = await run(manifest);
  console.log(outcome.summary);
  if (outcome.summary.failed > 0) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
```

## Errors and results

Manifest loading or validation errors throw. Execution returns structured test results, including failed assertions, rather than setting the process exit code. Callers decide how to display or persist evidence and whether to mark their process as failed. The API does not call `process.exit()` or write a report file automatically.

The result object may contain request and response details, including potentially sensitive data. Review it before logging or uploading it.

## Working example

The [Tasks API example](../examples/node-api/README.md) uses the existing `api-samples/tasks/api-tests.json` manifest and `api-samples/tasks/index.js` service. It demonstrates that the same manifest works with the CLI and Node.js API without duplication.
