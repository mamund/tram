# shellcheck shell=bash
# Shared helpers for scripts/*/*.sh. Source it; do not run it.
#
#   source "$(dirname "${BASH_SOURCE[0]}")/../lib/_common.sh"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export ROOT

# Both sample APIs hardcode this port in api-samples/*/index.js.
SAMPLE_PORT=3000
SAMPLES=(tasks pokemon)

die() { printf 'error: %s\n' "$*" >&2; exit 1; }
info() { printf '==> %s\n' "$*"; }

# require_sample <name>: fail unless <name> is a known sample API.
require_sample() {
    local name="${1:-}" s
    for s in "${SAMPLES[@]}"; do [[ "$name" == "$s" ]] && return 0; done
    die "unknown sample '${name}'. Use one of: ${SAMPLES[*]}"
}

# sample_manifest <name>: print the manifest path of a sample API.
sample_manifest() {
    case "$1" in
        tasks) printf '%s\n' "$ROOT/api-samples/tasks/api-tests.json" ;;
        pokemon) printf '%s\n' "$ROOT/api-samples/pokemon/tram.json" ;;
    esac
}

# ensure_sample_deps <name>: npm ci the sample when express is missing.
ensure_sample_deps() {
    local dir="$ROOT/api-samples/$1"
    if [[ ! -d "$dir/node_modules/express" ]]; then
        info "installing $1 sample dependencies (npm ci)"
        npm ci --prefix "$dir" --no-audit --no-fund
    fi
}

# port_pids: print the PIDs listening on SAMPLE_PORT, one per line.
port_pids() {
    lsof -nP -t -iTCP:"$SAMPLE_PORT" -sTCP:LISTEN 2>/dev/null || true
}

# SERVER_PID is set by start_sample and read by stop_sample.
SERVER_PID=""

# start_sample <name>: start a sample API in the background and wait until it answers.
start_sample() {
    local name="$1" log i
    [[ -z "$(port_pids)" ]] || die "port $SAMPLE_PORT is in use. Run 'just sample stop' first"
    ensure_sample_deps "$name"
    log="$(mktemp -t "tram-$name-server.XXXXXX")"
    (cd "$ROOT/api-samples/$name" && exec node index.js) >"$log" 2>&1 &
    SERVER_PID=$!
    for ((i = 0; i < 100; i++)); do
        if ! kill -0 "$SERVER_PID" 2>/dev/null; then
            cat "$log" >&2
            die "$name sample exited before it answered"
        fi
        if curl -fsS -o /dev/null "http://127.0.0.1:$SAMPLE_PORT/"; then return 0; fi
        sleep 0.1
    done
    die "$name sample did not answer on :$SAMPLE_PORT within 10 seconds (log: $log)"
}

stop_sample() {
    if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    SERVER_PID=""
}
