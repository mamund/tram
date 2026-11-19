#!/usr/bin/env bash
# Validate the whole manifest corpus: good manifests must pass, must-fail ones must fail.
#
#   scripts/examples/check.sh
#
# Must-fail manifests: examples/bad-manifests/*.json and examples/capture/bad-*.json.
# Skipped: package*.json, node_modules/ and *-report.json (TRAM output, not a manifest).
# Sends no HTTP requests. Exit 0 when the corpus behaves, 1 otherwise.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib/_common.sh"
cd "$ROOT"

good=()
bad=()
while IFS= read -r f; do
    case "$f" in
        examples/bad-manifests/* | examples/capture/bad-*) bad+=("$f") ;;
        *) good+=("$f") ;;
    esac
done < <(find examples api-samples -name '*.json' \
    -not -path '*/node_modules/*' -not -name 'package*.json' -not -name '*-report.json' | sort)

failed=0
info "manifests that must validate (${#good[@]})"
for f in "${good[@]}"; do
    if out="$(node bin/tram "$f" --validate 2>&1)"; then
        printf '  ok    %s\n' "$f"
    else
        printf '  FAIL  %s\n' "$f"
        printf '%s\n' "$out" | sed 's/^/        /'
        failed=1
    fi
done

info "manifests that must be rejected (${#bad[@]})"
for f in "${bad[@]}"; do
    if node bin/tram "$f" --validate >/dev/null 2>&1; then
        printf '  FAIL  %s (accepted, expected a validation error)\n' "$f"
        failed=1
    else
        printf '  ok    %s\n' "$f"
    fi
done

exit "$failed"
