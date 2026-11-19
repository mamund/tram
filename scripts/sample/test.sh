#!/usr/bin/env bash
# Run a sample API's manifest against a temporary server and keep the evidence.
#
#   scripts/sample/test.sh <tasks|pokemon>
#
# Starts the sample on :3000, runs its manifest with bin/tram, writes
# .tram/<name>/report.json and .tram/<name>/transcript.http, then stops the server.
# Exit code is TRAM's: 0 all passed, 1 a failure or an error.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib/_common.sh"

name="${1:-}"
require_sample "$name"
out="$ROOT/.tram/$name"
mkdir -p "$out"

trap stop_sample EXIT
start_sample "$name"

status=0
node "$ROOT/bin/tram" "$(sample_manifest "$name")" \
    --report "$out/report.json" --transcript "$out/transcript.http" || status=$?
info "evidence: ${out#"$ROOT"/}/report.json, ${out#"$ROOT"/}/transcript.http"
exit "$status"
