# TRAM task runner. Run `just` for the command summary, `just help <group> <cmd>` for one command.
# Help is rendered by justz from config/commands.json; `just check` keeps the two in step.
import 'just/preamble.just'

sh := justfile_directory() / "scripts"

[group('commands')]
[doc('Validate the manifest corpus and run the example programs')]
mod examples 'just/examples.just'

[group('commands')]
[doc('Serve and test the Tasks and Pokemon sample APIs')]
mod sample 'just/sample.just'

[group('commands')]
[doc('Pack, accept, version, tag and publish the npm package')]
mod release 'just/release.just'

[group('commands')]
[doc('Preview and deploy the landing page in site/')]
mod site 'just/site.just'

_default:
    @justz help

[doc('Full command reference, or the focused docs of one group or command (help [group] [term]); -b browses, -j emits JSON')]
[group('core')]
[no-exit-message]
help *ARGS:
    #!/usr/bin/env bash
    set -euo pipefail
    # No words: the full reference. Otherwise zoom, with -b, -j and -w.
    if [[ $# -eq 0 ]]; then exec justz help --expanded; fi
    exec justz help "$@"

[doc('Run the unit tests in test/*.test.js; extra args go to node --test')]
[group('core')]
test *ARGS:
    @node --test "$@" test/*.test.js

[doc('Run tram from this checkout; all args go to bin/tram (manifest first, then flags)')]
[group('core')]
[no-exit-message]
[no-cd]
run *ARGS:
    @node {{ quote(justfile_directory() / "bin/tram") }} "$@"

[doc('Validate one or more manifests without sending HTTP requests')]
[group('core')]
[no-exit-message]
[no-cd]
validate +MANIFESTS:
    @{{ sh }}/core/validate.sh "$@"

[doc('Offline gate: unit tests, manifest corpus, assertion smoke test, command docs')]
[group('core')]
check: test examples::check examples::smoke
    justz check
    justz fmt --check

[doc('Full gate: check, packed-package test, then the Tasks API integration test on port 3000')]
[group('core')]
ci: check release::accept
    node test/tasks-integration.js

[doc('Check node, npm, just, justz and the other tools a contributor needs')]
[group('dev')]
doctor:
    @{{ sh }}/core/doctor.sh

[doc('Link this checkout as the global tram command (npm link)')]
[group('dev')]
link:
    npm link

[doc('Remove the global tram link made by just link')]
[group('dev')]
unlink:
    npm rm --global @mamund/tram

[doc('Delete dist/ and .tram/ (packed tarballs and sample evidence)')]
[group('dev')]
clean:
    rm -rf dist .tram
