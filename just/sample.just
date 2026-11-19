import 'preamble.just'
set working-directory := '..'

sh := justfile_directory() / "scripts/sample"

_default:
    @justz help sample

[doc('Install the npm dependencies of one sample API (npm ci)')]
[arg('NAME', pattern='tasks|pokemon')]
install NAME:
    npm ci --prefix "api-samples/$1" --no-audit --no-fund

[doc('Serve one sample API in the foreground on port 3000; Ctrl-C stops it')]
[arg('NAME', pattern='tasks|pokemon')]
[no-exit-message]
serve NAME:
    @{{ sh }}/serve.sh "$1"

[doc('Start a sample API, run its manifest, save the report and transcript under .tram/')]
[arg('NAME', pattern='tasks|pokemon')]
[no-exit-message]
test NAME:
    @{{ sh }}/test.sh "$1"

[doc('Kill every process that listens on port 3000, sample API or not')]
[confirm('Kill every process listening on port 3000?')]
[no-exit-message]
stop:
    @{{ sh }}/stop.sh
