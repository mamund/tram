#!/usr/bin/env bash
# Create the annotated git tag v<version> for the version in package.json. Does not push.
#
#   scripts/release/tag.sh
#
# Refuses when the working tree is dirty, when the tag exists, or when CHANGELOG.md
# has no "## <version>" section. Undo with: git tag -d v<version>
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib/_common.sh"
cd "$ROOT"

version="$(node -p "require('./package.json').version")"
tag="v$version"

[[ -z "$(git status --porcelain)" ]] || die "working tree is dirty; commit first"
! git rev-parse -q --verify "refs/tags/$tag" >/dev/null || die "tag $tag already exists"
grep -qE "^## ${version//./\\.}([^0-9.]|$)" CHANGELOG.md || die "CHANGELOG.md has no '## $version' section"

git tag -a "$tag" -m "TRAM $version"
info "tagged $tag at $(git rev-parse --short HEAD)"
printf 'push with: git push origin %s\n' "$tag"
