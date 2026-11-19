import 'preamble.just'
set working-directory := '..'

sh := justfile_directory() / "scripts/examples"

_default:
    @justz help examples

[doc('Validate every manifest in examples/ and api-samples/; must-fail manifests must be rejected')]
[no-exit-message]
check:
    @{{ sh }}/check.sh

[doc('Run the assertion engine smoke test against fake responses (no HTTP)')]
smoke:
    node examples/assertions-smoke-test.js

[doc('Run the Node.js API example against a temporary Tasks server on port 3000')]
[no-exit-message]
node-api:
    @{{ sh }}/node-api.sh
