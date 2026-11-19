#!/usr/bin/env bash
# Stop every process that listens on :3000, the port of both sample APIs.
#
#   scripts/sample/stop.sh
#
# Prints each process before it sends SIGTERM. The process need not be a sample API.
# Exit 0 when the port is free afterwards, 1 when it is still in use.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib/_common.sh"

pids="$(port_pids)"
if [[ -z "$pids" ]]; then
    info "nothing listens on :$SAMPLE_PORT"
    exit 0
fi

for pid in $pids; do
    printf '  stopping %s  %s\n' "$pid" "$(ps -o command= -p "$pid" 2>/dev/null || true)"
    kill "$pid" 2>/dev/null || true
done
sleep 0.5
[[ -z "$(port_pids)" ]] || die "port $SAMPLE_PORT is still in use"
info "port $SAMPLE_PORT is free"
