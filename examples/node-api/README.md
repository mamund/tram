# Tasks API — Node.js module example

This example executes the **existing** Tasks API manifest through TRAM's public Node.js API. The manifest is also used by the CLI; no separate Node-specific manifest is needed.

Requires Node.js 18+ and a source checkout that includes `index.js` (the public API is not yet in npm 0.1.0).

## Run

From the repository root, install the sample service dependencies once:

```bash
cd api-samples/tasks
npm ci
npm start
```

Keep that terminal running. The sample service listens on `http://localhost:3000`, as configured in `api-samples/tasks/api-tests.json`.

In another terminal, from the repository root:

```bash
node examples/node-api/run-tasks.cjs
```

The script loads `api-samples/tasks/api-tests.json`, executes the assertions, prints the summary and individual outcomes, and sets a nonzero exit code when assertions fail or an error occurs.

For comparison, run the same manifest through the CLI:

```bash
node bin/tram api-samples/tasks/api-tests.json
```

The Tasks sample maintains in-memory state. Restart the service before repeating runs if you want a fresh dataset. The example imports the local source checkout via `require('../../')`; installed consumers should use `require('@mamund/tram')` instead.

See the [Node.js API guide](../../docs/node-api.md) for the public interface.
