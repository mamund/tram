#!/usr/bin/env bash
# Pack the npm tarball into dist/ and run the installed-package acceptance test on it.
#
#   scripts/release/accept.sh
#
# Replaces dist/ on every run. The test installs the tarball into a temporary
# project and checks the CLI and the public API. Exit 0 pass, 1 fail.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib/_common.sh"
cd "$ROOT"

rm -rf dist
mkdir -p dist
tarball="dist/$(npm pack --silent --pack-destination dist)"
info "packed $tarball"
node test/package-acceptance.js "$tarball"
