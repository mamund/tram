#!/usr/bin/env bash
# Raise the version in package.json. Does not commit, tag or touch CHANGELOG.md.
#
#   scripts/release/bump.sh <patch|minor|major>
#
# Undo with: git checkout package.json
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib/_common.sh"
cd "$ROOT"

case "${1:-}" in
    patch | minor | major) ;;
    *) printf 'usage: just release bump <patch|minor|major>\n' >&2; exit 2 ;;
esac

npm version "$1" --no-git-tag-version >/dev/null
version="$(node -p "require('./package.json').version")"
info "package.json is now $version"
printf 'next:\n  1. add a "## %s" section to CHANGELOG.md\n' "$version"
printf '  2. commit: chore: prepare TRAM %s release\n' "$version"
printf '  3. just release tag\n'
