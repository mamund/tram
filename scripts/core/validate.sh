#!/usr/bin/env bash
# Validate one or more TRAM manifests without sending HTTP requests.
#
#   scripts/core/validate.sh <manifest>...
#
# Runs `bin/tram <manifest> --validate` for each file and prints one line per file.
# Exit 0 when every manifest is valid, 1 when at least one is not, 2 on usage error.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib/_common.sh"

if [[ $# -eq 0 ]]; then
    printf 'usage: just validate <manifest>...\n' >&2
    exit 2
fi

failed=0
for manifest in "$@"; do
    if out="$(node "$ROOT/bin/tram" "$manifest" --validate 2>&1)"; then
        printf '  ok    %s\n' "$manifest"
    else
        printf '  FAIL  %s\n' "$manifest"
        printf '%s\n' "$out" | sed 's/^/        /'
        failed=1
    fi
done
exit "$failed"
