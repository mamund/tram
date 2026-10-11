# Changelog

## 0.2.0 — Node.js API

### Added
- Public Node.js API with `loadManifest()`, `validateManifest()`,
  and `run()`.
- Structured execution results for programmatic consumers.
- Installed-package acceptance tests for the public API.
- Node.js API documentation and runnable Tasks example.

### Changed
- Extracted manifest handling into `lib/manifest.js`.
- Extracted execution into `lib/runner.js`.
- Extracted reporting into `lib/reports.js`.
- Updated package exports to support Node.js module consumers.

### Compatibility
- Existing CLI commands and manifest format remain unchanged.
- No new runtime dependencies.

## 0.1.0 — Initial beta (unreleased)

- Dependency-free Node.js HTTP API test runner and assertion engine.
- Manifest validation and support for manifest versions `0.1` and `0.2`.
- Runtime data interpolation, generated values, and response capture.
- JSON reports and HTTP transcripts.
- Regression coverage and clean-package acceptance testing.
- Credential redaction for selected HTTP headers in report and transcript output.
- Structured failure reporting for unresolved runtime data and capture references.
