#!/usr/bin/env bash
# Reversible deploy to Jino VPS. Default is inspect + frontend.
# Backend is opt-in because the live process has long uptime and this branch
# refuses to start in NODE_ENV=production without DATABASE_URL.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SSH="$ROOT_DIR/scripts/jino/ssh.sh"
REMOTE_ROOT="/var/www/tjyoga"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
MODE="frontend"
SKIP_BUILD=0

usage() {
  cat <<'EOF'
Usage: scripts/jino/deploy.sh [--inspect-only] [--frontend] [--backend] [--all] [--skip-build]

  --inspect-only  SSH + dump server layout, then exit
  --frontend      backup app/dist and sync a new Vite build (default)
  --backend       copy backend sources into a release, build on server, pm2 reload
  --all           frontend + backend
  --skip-build    reuse already built dist/ and backend/dist

Secrets stay in env / server .env. This script never prints key material.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --inspect-only) MODE="inspect" ;;
    --frontend) MODE="frontend" ;;
    --backend) MODE="backend" ;;
    --all) MODE="all" ;;
    --skip-build) SKIP_BUILD=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 2 ;;
  esac
  shift
done

remote() {
  "$SSH" "$@"
}

ensure_ssh() {
  KEY_FILE="$(python3 "$ROOT_DIR/scripts/jino/write-key.py")"
  export JINO_SSH_KEY_FILE="$KEY_FILE"
  chmod 600 "$KEY_FILE"
  remote 'echo SSH_OK'
}

backup_remote_path() {
  local src="$1"
  local label="$2"
  remote "bash -s" <<REMOTE
set -euo pipefail
mkdir -p '$REMOTE_ROOT/backups' '$REMOTE_ROOT/releases' '$REMOTE_ROOT/logs'
if [[ -e '$src' ]]; then
  tar -C '$(dirname "$src")' -czf '$REMOTE_ROOT/backups/${label}-${STAMP}.tgz' '$(basename "$src")'
  echo "BACKUP $REMOTE_ROOT/backups/${label}-${STAMP}.tgz"
else
  echo "BACKUP_SKIP missing $src"
fi
REMOTE
}

build_frontend() {
  if [[ "$SKIP_BUILD" -eq 1 ]]; then
    [[ -d "$ROOT_DIR/dist" ]] || { echo "dist/ missing"; exit 1; }
    return
  fi
  (
    cd "$ROOT_DIR"
    if [[ -f package-lock.json ]]; then
      npm ci
    else
      npm install
    fi
    VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://tjyoga.ru/api/v1}" npm run build
  )
}

build_backend_local() {
  if [[ "$SKIP_BUILD" -eq 1 ]]; then
    [[ -d "$ROOT_DIR/backend/dist" ]] || { echo "backend/dist missing"; exit 1; }
    return
  fi
  (
    cd "$ROOT_DIR/backend"
    npm ci
    npm run build
  )
}

deploy_frontend() {
  echo "== frontend build =="
  build_frontend
  backup_remote_path "$REMOTE_ROOT/app/dist" "frontend-dist"
  remote "mkdir -p '$REMOTE_ROOT/releases/frontend/$STAMP' '$REMOTE_ROOT/app/dist'"
  echo "== sync dist -> releases/frontend/$STAMP =="
  tar -C "$ROOT_DIR/dist" -czf - . | remote "tar -C '$REMOTE_ROOT/releases/frontend/$STAMP' -xzf -"
  echo "== promote release into nginx root =="
  remote "bash -s" <<REMOTE
set -euo pipefail
python3 - <<'PY'
import shutil
from pathlib import Path
src = Path('$REMOTE_ROOT/releases/frontend/$STAMP')
dst = Path('$REMOTE_ROOT/app/dist')
dst.parent.mkdir(parents=True, exist_ok=True)
if dst.exists():
    shutil.rmtree(dst)
shutil.copytree(src, dst)
print('PROMOTED_FRONTEND', dst)
PY
REMOTE
}

deploy_backend() {
  echo "== backend safety checks =="
  local safety
  safety="$(remote "bash -s" <<'REMOTE'
set -euo pipefail
python3 - <<'PY'
import json, os, pathlib, subprocess
node_env = None
database_set = False
cwd = ""
name = ""
try:
    apps = json.loads(subprocess.check_output(["pm2", "jlist"], text=True))
except Exception:
    apps = []
for app in apps:
    env = app.get("pm2_env") or {}
    node_env = env.get("NODE_ENV") or node_env
    database_set = database_set or bool(env.get("DATABASE_URL"))
    cwd = env.get("pm_cwd") or cwd
    name = app.get("name") or name

for env_path in [
    pathlib.Path(cwd) / ".env" if cwd else None,
    pathlib.Path("/var/www/tjyoga/backend/.env"),
    pathlib.Path("/var/www/tjyoga/.env"),
]:
    if env_path is None or not env_path.is_file():
        continue
    for line in env_path.read_text(encoding="utf-8", errors="replace").splitlines():
        if line.startswith("NODE_ENV=") and node_env is None:
            node_env = line.split("=", 1)[1].strip().strip('"')
        if line.startswith("DATABASE_URL=") and line.split("=", 1)[1].strip():
            database_set = True

print(f"pm2_name={name}")
print(f"cwd={cwd}")
print(f"NODE_ENV={node_env or 'unset'}")
print(f"DATABASE_URL_set={'yes' if database_set else 'no'}")
if (node_env == "production") and not database_set:
    print("BLOCK_BACKEND=1")
else:
    print("BLOCK_BACKEND=0")
PY
REMOTE
)"
  echo "$safety"
  if echo "$safety" | grep -q 'BLOCK_BACKEND=1'; then
    echo "Refusing backend deploy: NODE_ENV=production and DATABASE_URL is not set."
    echo "This branch will not start without Postgres. Set DATABASE_URL on the server, migrate, then retry."
    exit 3
  fi

  build_backend_local
  local live_cwd
  live_cwd="$(echo "$safety" | awk -F= '/^cwd=/{print $2; exit}')"
  if [[ -z "$live_cwd" || "$live_cwd" == "" ]]; then
    live_cwd="$REMOTE_ROOT/backend"
  fi
  local release="$REMOTE_ROOT/releases/backend/$STAMP"
  backup_remote_path "$live_cwd" "backend-tree"
  remote "mkdir -p '$release'"
  echo "== sync backend sources to $release (no .env, no node_modules) =="
  tar -C "$ROOT_DIR/backend" \
    --exclude node_modules \
    --exclude dist \
    --exclude .env \
    --exclude .env.* \
    -czf - . | remote "tar -C '$release' -xzf -"

  remote "bash -s" <<REMOTE
set -euo pipefail
RELEASE='$release'
LIVE='$live_cwd'
mkdir -p "\$LIVE"
if [[ -f "\$LIVE/.env" && ! -f "\$RELEASE/.env" ]]; then
  cp -a "\$LIVE/.env" "\$RELEASE/.env"
fi
cd "\$RELEASE"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
npm run build
if [[ -f .env ]] && grep -qE '^DATABASE_URL=.+' .env; then
  echo 'RUN_MIGRATE=1'
  npm run migrate
else
  echo 'RUN_MIGRATE=0'
fi
python3 - <<'PY'
import shutil
from pathlib import Path
src = Path("$release")
dst = Path("$live_cwd")
dst.mkdir(parents=True, exist_ok=True)
skip = {".env", ".env.local", ".env.production"}
for item in src.iterdir():
    if item.name in skip:
        continue
    target = dst / item.name
    if target.exists():
        if target.is_dir():
            shutil.rmtree(target)
        else:
            target.unlink()
    if item.is_dir():
        shutil.copytree(item, target)
    else:
        shutil.copy2(item, target)
print("PROMOTED_BACKEND", dst)
PY
if command -v pm2 >/dev/null 2>&1; then
  if [[ -f /var/www/tjyoga/ecosystem.config.cjs ]]; then
    pm2 reload /var/www/tjyoga/ecosystem.config.cjs --update-env || pm2 start /var/www/tjyoga/ecosystem.config.cjs
  else
    pm2 reload all || pm2 restart all
  fi
  pm2 save || true
fi
sleep 1
curl -sS -m 5 -o /tmp/tjyoga-health.out -w 'HEALTH_HTTP=%{http_code}\n' http://127.0.0.1:8787/health || true
head -c 400 /tmp/tjyoga-health.out; echo
REMOTE
}

smoke_public() {
  echo "== public smoke =="
  curl -sS -m 10 -o /tmp/tjyoga-public-health.json -w 'PUBLIC_HEALTH=%{http_code}\n' https://tjyoga.ru/health || true
  python3 - <<'PY'
import json, pathlib
text = pathlib.Path("/tmp/tjyoga-public-health.json").read_text(encoding="utf-8", errors="replace")
print(text[:400])
try:
    payload = json.loads(text)
    assert payload["data"]["status"] == "ok"
    print("SMOKE_HEALTH_OK")
except Exception as exc:
    print("SMOKE_HEALTH_PARSE", type(exc).__name__)
PY
}

ensure_ssh

case "$MODE" in
  inspect)
    "$ROOT_DIR/scripts/jino/inspect.sh"
    ;;
  frontend)
    "$ROOT_DIR/scripts/jino/inspect.sh"
    deploy_frontend
    smoke_public
    echo "Frontend deployed. Rollback: tar -C $REMOTE_ROOT/app -xzf $REMOTE_ROOT/backups/frontend-dist-${STAMP}.tgz"
    ;;
  backend)
    "$ROOT_DIR/scripts/jino/inspect.sh"
    deploy_backend
    smoke_public
    echo "Backend release $STAMP. Rollback: restore $REMOTE_ROOT/backups/backend-tree-${STAMP}.tgz and pm2 reload."
    ;;
  all)
    "$ROOT_DIR/scripts/jino/inspect.sh"
    deploy_frontend
    deploy_backend
    smoke_public
    ;;
  *)
    echo "Unknown mode $MODE" >&2
    exit 2
    ;;
esac
