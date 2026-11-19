#!/usr/bin/env bash
# Check the tools a TRAM contributor needs. Optional gaps warn; required gaps fail.
#
#   scripts/core/doctor.sh
#
# Exit 0 when every required tool is present, 1 otherwise.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib/_common.sh"

ok=1

# check <required|optional> <tool> <install-hint> [version-args...]
check() {
    local need="$1" tool="$2" hint="$3"
    shift 3
    if command -v "$tool" &>/dev/null; then
        printf '  ok    %-10s %s\n' "$tool" "$("$tool" "${@:---version}" 2>&1 | head -1)"
    elif [[ "$need" == required ]]; then
        printf '  FAIL  %-10s not found: %s\n' "$tool" "$hint"
        ok=0
    else
        printf '  warn  %-10s not found (optional): %s\n' "$tool" "$hint"
    fi
}

info "required"
check required node "https://nodejs.org (18 or later)"
check required npm "ships with node"
check required just "brew install just"
check required justz "brew install igorlino/tap/justz"
check required curl "used to wait for the sample APIs"
check required lsof "used to find the process on :$SAMPLE_PORT"

if command -v node &>/dev/null; then
    major="$(node -p 'process.versions.node.split(".")[0]')"
    if ((major < 18)); then
        printf '  FAIL  node %s is older than 18 (package.json engines)\n' "$major"
        ok=0
    fi
fi

info "optional"
check optional gh "brew install gh (site deploy)"
check optional python3 "brew install python (site serve)"
check optional shellcheck "brew install shellcheck (lint scripts/)"

info "state"
if [[ -n "$(port_pids)" ]]; then
    printf '  warn  port %s is in use; sample recipes need it (just sample stop)\n' "$SAMPLE_PORT"
else
    printf '  ok    port %s is free\n' "$SAMPLE_PORT"
fi
for s in "${SAMPLES[@]}"; do
    if [[ -d "$ROOT/api-samples/$s/node_modules/express" ]]; then
        printf '  ok    %s sample dependencies installed\n' "$s"
    else
        printf '  warn  %s sample dependencies missing; installed on first use\n' "$s"
    fi
done

((ok)) || exit 1
