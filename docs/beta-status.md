# TRAM 0.1.0 beta status

TRAM 0.1.0 is an initial beta release of the Test Runner for Assertion Manifests. It is intended for testing observable HTTP API behavior using declarative manifests.

## Supported environment

- Node.js 18 or later.
- No third-party runtime dependencies.
- Manifest formats `0.1` and `0.2`. Package version and manifest version are independent.
- CLI invocation: `tram <manifest-file> [options]`.

## Current capabilities

- Manifest validation and sequential HTTP request execution.
- HTTP status, header, and response-body assertions, including collection and object-map assertions.
- Run-scoped data generation and interpolation.
- Response capture and reuse in later requests (manifest `0.2`).
- Console results, JSON reports, and HTTP transcripts.
- Nonzero process exit status when a run fails.

## Limitations and security

- Header redaction in JSON reports and HTTP transcripts covers `Authorization`, `Cookie`, `Set-Cookie`, and `X-API-Key` (case-insensitive).
- Secrets in URLs, bodies, assertion evidence, and other header names may appear in output. Review artifacts before sharing them.
- HTTP responses and test results are observations of the target service; they do not establish correctness of unobservable side effects.
- The npm package contains the runner and selected documentation, not the sample API or sample manifests. Clone the source repository for tutorials.
- The beta may change in response to user feedback. Pin versions for repeatable installations.

Report problems at https://github.com/mamund/tram/issues.
