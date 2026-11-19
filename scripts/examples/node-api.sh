#!/usr/bin/env bash
# Run the Node.js API example against a temporary Tasks sample server.
#
#   scripts/examples/node-api.sh
#
# Starts api-samples/tasks on :3000, runs examples/node-api/run-tasks.cjs, then stops
# the server. Fails if :3000 is already in use. Exit code is the example's exit code.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib/_common.sh"

trap stop_sample EXIT
start_sample tasks
node "$ROOT/examples/node-api/run-tasks.cjs"
