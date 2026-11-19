import 'preamble.just'
set working-directory := '..'

sh := justfile_directory() / "scripts/release"

_default:
    @justz help release

[doc('List the files the npm tarball would contain, without writing it')]
contents:
    npm pack --dry-run

[doc('Pack the tarball into dist/ and test it installed in a clean temporary project')]
accept:
    @{{ sh }}/accept.sh

[doc('Raise the version in package.json; does not commit, tag or edit CHANGELOG.md')]
[arg('LEVEL', pattern='patch|minor|major')]
[no-exit-message]
bump LEVEL:
    @{{ sh }}/bump.sh "$1"

[doc('Create the local git tag v<version> from package.json; refuses on a dirty tree; does not push')]
[no-exit-message]
tag:
    @{{ sh }}/tag.sh

[doc('Publish to npm under the beta dist-tag after the acceptance test; extra args go to npm publish')]
[confirm('Publish @mamund/tram to the npm registry?')]
publish *ARGS: accept
    npm publish --tag beta "$@"
