#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
  cat <<'USAGE'
Start the local Hermes Agent development environment.

This script is the recommended way to start development. It will:
  1. Reuse or create the SSH tunnel for the dev router on 116
  2. Reuse or create the reverse SSH tunnel so 116 can reach the local model proxy
  3. Read development values from .env.development
  4. Ensure QS_KEY is available before starting the dev server

Optional overrides:
  DEV_ENV_FILE                 default: .env.development
  HERMES_DEV_ROUTER_REMOTE_HOST
                              default: HERMES_DEPLOY_HOST from dev env
  HERMES_DEV_ROUTER_REMOTE_PORT
                              default: port from HERMES_ROUTER_BASE_URL
  HERMES_DEV_MODEL_PROXY_REMOTE_PORT
                              default: 15173 on 116, forwarded back to local PORT
  HERMES_DEV_TUNNEL_DISABLE=1
                              skip automatic SSH tunnel setup

Examples:
  scripts/deploy-development.sh
  QS_KEY=... scripts/deploy-development.sh
  HERMES_DEV_TUNNEL_DISABLE=1 scripts/deploy-development.sh
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEV_ENV_FILE="${DEV_ENV_FILE:-$PROJECT_ROOT/.env.development}"
DEFAULT_NODE_BIN="/Users/xiamu/.nvm/versions/node/v20.19.5/bin"

log() {
  printf '[dev-deploy] %s\n' "$*"
}

fail() {
  printf '[dev-deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

read_env_value() {
  local key="$1"
  local file="$2"
  [[ -f "$file" ]] || return 1

  local line
  line="$(grep -E "^${key}=" "$file" | tail -n 1 || true)"
  [[ -n "$line" ]] || return 1

  line="${line#*=}"
  line="${line%$'\r'}"
  printf '%s' "$line"
}

ensure_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

ensure_command ssh
ensure_command curl
ensure_command npm

[[ -f "$DEV_ENV_FILE" ]] || fail "Development env file not found: $DEV_ENV_FILE"

DEV_DEPLOY_HOST="${HERMES_DEV_ROUTER_REMOTE_HOST:-$(read_env_value HERMES_DEPLOY_HOST "$DEV_ENV_FILE" || true)}"
DEV_DEPLOY_PORT="$(read_env_value HERMES_DEPLOY_PORT "$DEV_ENV_FILE" || true)"
DEV_DEPLOY_USERNAME="$(read_env_value HERMES_DEPLOY_USERNAME "$DEV_ENV_FILE" || true)"
DEV_DEPLOY_KEY="${HERMES_DEPLOY_PRIVATE_KEY_PATH:-$(read_env_value HERMES_DEPLOY_PRIVATE_KEY_PATH "$DEV_ENV_FILE" || true)}"
DEV_ROUTER_BASE_URL="$(read_env_value HERMES_ROUTER_BASE_URL "$DEV_ENV_FILE" || true)"
DEV_ROUTER_SHARED_TOKEN="${HERMES_ROUTER_SHARED_TOKEN:-$(read_env_value HERMES_ROUTER_SHARED_TOKEN "$DEV_ENV_FILE" || true)}"
DEV_QS_KEY="${QS_KEY:-$(read_env_value QS_KEY "$DEV_ENV_FILE" || true)}"
LOCAL_APP_PORT="$(read_env_value PORT "$DEV_ENV_FILE" || true)"

[[ -n "$DEV_DEPLOY_HOST" ]] || fail "HERMES_DEPLOY_HOST is missing in $DEV_ENV_FILE"
[[ -n "$DEV_DEPLOY_USERNAME" ]] || fail "HERMES_DEPLOY_USERNAME is missing in $DEV_ENV_FILE"
[[ -n "$DEV_DEPLOY_KEY" ]] || fail "HERMES_DEPLOY_PRIVATE_KEY_PATH is missing in $DEV_ENV_FILE"
[[ -f "$DEV_DEPLOY_KEY" ]] || fail "Deploy key not found: $DEV_DEPLOY_KEY"
[[ -n "$DEV_ROUTER_BASE_URL" ]] || fail "HERMES_ROUTER_BASE_URL is missing in $DEV_ENV_FILE"
[[ -n "$DEV_ROUTER_SHARED_TOKEN" ]] || fail "HERMES_ROUTER_SHARED_TOKEN is missing in $DEV_ENV_FILE"

DEV_ROUTER_BASE_URL="${DEV_ROUTER_BASE_URL#http://}"
DEV_ROUTER_BASE_URL="${DEV_ROUTER_BASE_URL#https://}"
DEV_ROUTER_BASE_URL="${DEV_ROUTER_BASE_URL%%/*}"
LOCAL_ROUTER_HOST="${DEV_ROUTER_BASE_URL%%:*}"
LOCAL_ROUTER_PORT="${DEV_ROUTER_BASE_URL##*:}"
REMOTE_ROUTER_PORT="${HERMES_DEV_ROUTER_REMOTE_PORT:-$LOCAL_ROUTER_PORT}"
LOCAL_APP_PORT="${LOCAL_APP_PORT:-5173}"
REMOTE_MODEL_PROXY_PORT="${HERMES_DEV_MODEL_PROXY_REMOTE_PORT:-15173}"

[[ -n "$LOCAL_ROUTER_HOST" && -n "$LOCAL_ROUTER_PORT" ]] || fail "Unable to parse HERMES_ROUTER_BASE_URL from $DEV_ENV_FILE"

[[ -n "$DEV_QS_KEY" ]] || fail "QS_KEY is required. Set it in $DEV_ENV_FILE or export it in the shell"
export QS_KEY="$DEV_QS_KEY"
export HERMES_MODEL_PROXY_INTERNAL_BASE_URL="${HERMES_MODEL_PROXY_INTERNAL_BASE_URL:-http://127.0.0.1:${REMOTE_MODEL_PROXY_PORT}/api/internal/model-proxy}"

if [[ -d "$DEFAULT_NODE_BIN" ]]; then
  export PATH="$DEFAULT_NODE_BIN:$PATH"
fi

SSH_TUNNEL_ARGS=(
  -N
  -o ExitOnForwardFailure=yes
  -o ServerAliveInterval=30
  -o ServerAliveCountMax=3
  -o StrictHostKeyChecking=no
  -i "$DEV_DEPLOY_KEY"
)

if [[ -n "$DEV_DEPLOY_PORT" ]]; then
  SSH_TUNNEL_ARGS+=(-p "$DEV_DEPLOY_PORT")
fi

TUNNEL_PID=""
cleanup() {
  if [[ -n "$TUNNEL_PID" ]] && kill -0 "$TUNNEL_PID" >/dev/null 2>&1; then
    log "Stopping dev router tunnel (pid=$TUNNEL_PID)"
    kill "$TUNNEL_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

check_router_health() {
  curl -fsS \
    -H "x-hermes-router-token: $DEV_ROUTER_SHARED_TOKEN" \
    "http://${LOCAL_ROUTER_HOST}:${LOCAL_ROUTER_PORT}/healthz" >/dev/null 2>&1
}

if [[ "${HERMES_DEV_TUNNEL_DISABLE:-0}" != "1" && "$LOCAL_ROUTER_HOST" == "127.0.0.1" ]]; then
  if check_router_health; then
    log "Reusing existing dev router tunnel at http://${LOCAL_ROUTER_HOST}:${LOCAL_ROUTER_PORT}"
  else
    log "Opening SSH tunnels: local router ${LOCAL_ROUTER_HOST}:${LOCAL_ROUTER_PORT} -> ${DEV_DEPLOY_HOST}:${REMOTE_ROUTER_PORT}, remote model proxy 127.0.0.1:${REMOTE_MODEL_PROXY_PORT} -> local 127.0.0.1:${LOCAL_APP_PORT}"
    ssh \
      "${SSH_TUNNEL_ARGS[@]}" \
      -L "${LOCAL_ROUTER_PORT}:127.0.0.1:${REMOTE_ROUTER_PORT}" \
      -R "${REMOTE_MODEL_PROXY_PORT}:127.0.0.1:${LOCAL_APP_PORT}" \
      "${DEV_DEPLOY_USERNAME}@${DEV_DEPLOY_HOST}" &
    TUNNEL_PID=$!

    for _ in $(seq 1 20); do
      if check_router_health; then
        break
      fi
      sleep 1
    done

    check_router_health || fail "Dev router tunnel did not become healthy on http://${LOCAL_ROUTER_HOST}:${LOCAL_ROUTER_PORT}"
  fi
fi

log "Starting local development server via npm run dev"
(cd "$PROJECT_ROOT" && npm run dev)
