#!/usr/bin/env bash
# Serve a sample API in the foreground on :3000. Stop it with Ctrl-C.
#
#   scripts/sample/serve.sh <tasks|pokemon>
#
# Installs the sample's dependencies first when they are missing.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib/_common.sh"

name="${1:-}"
require_sample "$name"
[[ -z "$(port_pids)" ]] || die "port $SAMPLE_PORT is in use. Run 'just sample stop' first"
ensure_sample_deps "$name"
cd "$ROOT/api-samples/$name"
exec node index.js
