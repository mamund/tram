# AGENTS.md

TRAM is a dependency-free Node.js (18+) HTTP API test runner. The CLI is `bin/tram`, the public API is `index.js`, and the engine is in `lib/`.

## Running Tasks (just)

Development tasks use `just`. The help is rendered by `justz` from `config/commands.json`.

- **Discover tasks from the CLI, not from `scripts/*/*.sh`.** Run `just` for the summary and `just <group>` for one group. Run `justz help <group> <cmd> -j` for one command's options, exit codes and `tags`.
- **Read a command's `tags` before you run it.** Do not run `asks-first` or `production` commands (`release publish`, `site deploy`, `sample stop`) unless the user asks. A command without tags is not known to be safe.
- **Pass flags directly, without `--`**: `just run api-samples/tasks/api-tests.json -v -r report.json`.
- **Single-quote free-text arguments** that contain `!`, `$`, `*` or spaces.

| Goal | Command |
|---|---|
| Fast offline gate before a commit | `just check` |
| Full gate, as run in CI (needs port 3000) | `just ci` |
| Unit tests only | `just test` |
| Run or validate a manifest from source | `just run <manifest> [-v] [-r file] [-t file]`, `just validate <manifest>...` |
| Run a sample API's manifest and keep the evidence | `just sample test <tasks\|pokemon>` (writes `.tram/<name>/`) |
| Check the npm package | `just release contents`, `just release accept` |

Both sample APIs listen on port 3000. Run only one sample recipe at a time.

## Conventions

- Put a new must-fail manifest in `examples/bad-manifests/`. `just examples check` expects every manifest there to be rejected and every other manifest under `examples/` and `api-samples/` to validate.
- Put a new recipe body longer than one command in `scripts/<group>/<name>.sh`. Add a `[doc]` that matches the `desc` in `config/commands.json`, then run `justz fmt` and `just check`.

## Why the `rich` justfile shape

The help lives in `config/commands.json` (the `rich` shape of the justfile-authoring skill) and not only in `[doc]` attributes. The registry carries argument rows, enum values, exit codes and safety tags (`asks-first`, `production`, `destructive`), which agents read with `justz help -j`. `justz check`, run by `just check`, fails when a recipe and its registry entry disagree.
