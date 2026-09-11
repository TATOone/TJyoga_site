#!/usr/bin/env bash
# Reversible deploy to Jino VPS. Default is inspect + frontend.
# Backend cutover: pg_dump → migrate while the old API stays up → brief pm2 reload.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SSH="$ROOT_DIR/scripts/jino/ssh.sh"
REMOTE_ROOT="/var/www/tjyoga"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
MODE="frontend"
SKIP_BUILD=0
LIVE_CWD=""
PM2_NAME=""

usage() {
  cat <<'EOF'
Usage: scripts/jino/deploy.sh [--inspect-only] [--frontend] [--backend] [--all] [--skip-build]

  --inspect-only  SSH + dump server layout, then exit
  --frontend      backup app/dist and sync a new Vite build (default)
  --backend       safe Postgres cutover: dump → migrate → promote → pm2 reload
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

read_backend_safety() {
  local safety
  safety="$(remote "bash -s" <<'REMOTE'
set -euo pipefail
python3 - <<'PY'
import json, pathlib, subprocess
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
    pathlib.Path("/var/www/tjyoga/app/backend/.env"),
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
    echo "This branch will not start without Postgres. Set DATABASE_URL on the server, then retry."
    exit 3
  fi
  LIVE_CWD="$(echo "$safety" | awk -F= '/^cwd=/{print $2; exit}')"
  PM2_NAME="$(echo "$safety" | awk -F= '/^pm2_name=/{print $2; exit}')"
  if [[ -z "$LIVE_CWD" ]]; then
    LIVE_CWD="$REMOTE_ROOT/app/backend"
  fi
  if [[ -z "$PM2_NAME" ]]; then
    PM2_NAME="tjyoga-api"
  fi
}

dump_postgres() {
  echo "== postgres dump (API still running) =="
  remote "bash -s" <<REMOTE
set -euo pipefail
LIVE='$LIVE_CWD'
STAMP='$STAMP'
DEST='$REMOTE_ROOT/backups/pg-predeploy-'"\$STAMP"'.dump'
python3 - "\$LIVE" "\$DEST" <<'PY'
import os, pathlib, subprocess, sys
from urllib.parse import unquote, urlparse
live = pathlib.Path(sys.argv[1])
dest = pathlib.Path(sys.argv[2])
url = None
env_path = live / ".env"
if env_path.is_file():
    for line in env_path.read_text(encoding="utf-8", errors="replace").splitlines():
        if line.startswith("DATABASE_URL="):
            value = line.split("=", 1)[1].strip().strip('"').strip("'")
            if value:
                url = value
            break
if not url:
    print("PG_DUMP_SKIP DATABASE_URL missing")
    sys.exit(0)
parsed = urlparse(url)
user = unquote(parsed.username or "tjyoga")
password = unquote(parsed.password or "")
database = (parsed.path or "/tjyoga").lstrip("/").split("?")[0]
dest.parent.mkdir(parents=True, exist_ok=True)
env = os.environ.copy()
env["PGPASSWORD"] = password
subprocess.check_call(
    [
        "pg_dump",
        "-h", parsed.hostname or "127.0.0.1",
        "-p", str(parsed.port or 5432),
        "-U", user,
        "-d", database,
        "-Fc",
        "-f", str(dest),
    ],
    env=env,
    stdout=subprocess.DEVNULL,
)
print("PG_DUMP", dest, "bytes", dest.stat().st_size)
PY
REMOTE
}

rollback_backend() {
  echo "== ROLLBACK backend tree $STAMP =="
  remote "bash -s" <<REMOTE
set -euo pipefail
LIVE='$LIVE_CWD'
STAMP='$STAMP'
PM2_NAME='$PM2_NAME'
BACKUP='$REMOTE_ROOT/backups/backend-tree-'"\$STAMP"'.tgz'
if [[ ! -f "\$BACKUP" ]]; then
  echo "ROLLBACK_MISSING \$BACKUP"
  exit 4
fi
python3 - "\$LIVE" "\$BACKUP" <<'PY'
import shutil, tarfile, pathlib, sys, tempfile
live = pathlib.Path(sys.argv[1])
backup = pathlib.Path(sys.argv[2])
keep_env = None
env_path = live / ".env"
if env_path.is_file():
    keep_env = env_path.read_bytes()
parent = live.parent
name = live.name
with tempfile.TemporaryDirectory(dir=str(parent)) as tmp:
    with tarfile.open(backup, "r:gz") as tar:
        tar.extractall(tmp)
    extracted = pathlib.Path(tmp) / name
    if not extracted.exists():
        children = list(pathlib.Path(tmp).iterdir())
        extracted = children[0] if children else extracted
    if live.exists():
        shutil.rmtree(live)
    shutil.move(str(extracted), str(live))
if keep_env is not None:
    (live / ".env").write_bytes(keep_env)
    (live / ".env").chmod(0o600)
print("RESTORED", live)
PY
if [[ -f /var/www/tjyoga/ecosystem.config.cjs ]]; then
  pm2 reload /var/www/tjyoga/ecosystem.config.cjs --update-env || pm2 start /var/www/tjyoga/ecosystem.config.cjs
else
  pm2 reload "\$PM2_NAME" || pm2 restart "\$PM2_NAME"
fi
sleep 2
curl -sS -m 8 -o /tmp/tjyoga-health-rollback.out -w 'ROLLBACK_HEALTH=%{http_code}\n' http://127.0.0.1:8787/health || true
head -c 400 /tmp/tjyoga-health-rollback.out; echo
REMOTE
}

wait_local_health() {
  local require_store="${1:-}"
  remote "bash -s" <<REMOTE || return 1
set -euo pipefail
REQUIRE_STORE='$require_store'
ok=0
for i in 1 2 3 4 5 6 8 10 12 15; do
  code="\$(curl -sS -m 5 -o /tmp/tjyoga-health.out -w '%{http_code}' http://127.0.0.1:8787/health || true)"
  echo "HEALTH_TRY=\$i HTTP=\$code"
  if [[ "\$code" == "200" ]] && python3 - "\$REQUIRE_STORE" <<'PY'
import json, pathlib, sys
require = sys.argv[1]
text = pathlib.Path("/tmp/tjyoga-health.out").read_text(encoding="utf-8", errors="replace")
print(text[:400])
payload = json.loads(text)
data = payload["data"]
assert data["status"] == "ok"
if require:
    store = data.get("store")
    database = data.get("database")
    if store != require:
        raise SystemExit(f"store={store!r} expected {require!r}")
    if require == "postgres" and database != "up":
        raise SystemExit(f"database={database!r} expected up")
print("HEALTH_OK")
PY
  then
    ok=1
    break
  fi
  sleep 1
done
if [[ "\$ok" -ne 1 ]]; then
  echo "HEALTH_FAILED"
  exit 5
fi
REMOTE
}

deploy_backend() {
  echo "== backend safety checks =="
  read_backend_safety
  echo "live_cwd=$LIVE_CWD pm2_name=$PM2_NAME"

  echo "== backend local build (avoid tsc RAM on 1.5GiB VPS) =="
  build_backend_local

  local release="$REMOTE_ROOT/releases/backend/$STAMP"
  dump_postgres
  backup_remote_path "$LIVE_CWD" "backend-tree"
  remote "mkdir -p '$release'"
  echo "== sync backend (dist included, no .env, no node_modules) to $release =="
  tar -C "$ROOT_DIR/backend" \
    --exclude node_modules \
    --exclude .env \
    --exclude .env.* \
    -czf - . | remote "tar -C '$release' -xzf -"

  echo "== install prod deps + migrate (old API still serving) =="
  remote "bash -s" <<REMOTE
set -euo pipefail
RELEASE='$release'
LIVE='$LIVE_CWD'
export NODE_OPTIONS='--max-old-space-size=384'
mkdir -p "\$LIVE"
if [[ -f "\$LIVE/.env" && ! -f "\$RELEASE/.env" ]]; then
  cp -a "\$LIVE/.env" "\$RELEASE/.env"
  chmod 600 "\$RELEASE/.env"
fi
cd "\$RELEASE"
if [[ -f package-lock.json ]]; then
  npm ci --omit=dev --no-audit --no-fund
else
  npm install --omit=dev --no-audit --no-fund
fi
if [[ ! -f dist/scripts/migrate.js ]]; then
  echo "dist/scripts/migrate.js missing after sync; refusing cutover"
  exit 6
fi
if [[ -f .env ]] && grep -qE '^DATABASE_URL=.+' .env; then
  echo 'RUN_MIGRATE=1'
  node dist/scripts/migrate.js
else
  echo 'RUN_MIGRATE=0'
fi
REMOTE

  echo "== promote release into live cwd (preserve .env) =="
  remote "bash -s" <<REMOTE
set -euo pipefail
python3 - <<'PY'
import shutil
from pathlib import Path
src = Path("$release")
dst = Path("$LIVE_CWD")
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
REMOTE

  echo "== pm2 reload (single fork, no dual Node) =="
  remote "bash -s" <<REMOTE
set -euo pipefail
PM2_NAME='$PM2_NAME'
if [[ -f /var/www/tjyoga/ecosystem.config.cjs ]]; then
  pm2 reload /var/www/tjyoga/ecosystem.config.cjs --update-env || pm2 start /var/www/tjyoga/ecosystem.config.cjs
else
  pm2 reload "\$PM2_NAME" || pm2 restart "\$PM2_NAME"
fi
pm2 save || true
REMOTE

  if ! wait_local_health postgres; then
    rollback_backend
    echo "Backend health failed after reload. Rolled back code. DB migrations are additive; see docs/ops/postgres-vps-architecture.md"
    exit 7
  fi
}

smoke_public() {
  local require_store="${1:-}"
  echo "== public smoke =="
  local code
  code="$(curl -sS -m 10 -o /tmp/tjyoga-public-health.json -w '%{http_code}' https://tjyoga.ru/health || true)"
  echo "PUBLIC_HEALTH=$code"
  python3 - "$code" "$require_store" <<'PY'
import json, pathlib, sys
http = sys.argv[1]
require = sys.argv[2]
text = pathlib.Path("/tmp/tjyoga-public-health.json").read_text(encoding="utf-8", errors="replace")
print(text[:400])
if http != "200":
    raise SystemExit(f"public /health HTTP {http}")
payload = json.loads(text)
data = payload["data"]
assert data["status"] == "ok"
if require:
    store = data.get("store")
    if store != require:
        raise SystemExit(f"public store={store!r} expected {require!r}")
    if require == "postgres" and data.get("database") != "up":
        raise SystemExit(f"public database={data.get('database')!r} expected up")
print("SMOKE_HEALTH_OK")
PY
  curl -sS -m 10 -o /tmp/tjyoga-public-api.json -w 'PUBLIC_API=%{http_code}\n' https://tjyoga.ru/api/v1 >/dev/null || true
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
    smoke_public postgres
    echo "Backend release $STAMP. Rollback: restore $REMOTE_ROOT/backups/backend-tree-${STAMP}.tgz and pm2 reload."
    echo "Postgres dump: $REMOTE_ROOT/backups/pg-predeploy-${STAMP}.dump"
    ;;
  all)
    "$ROOT_DIR/scripts/jino/inspect.sh"
    deploy_frontend
    deploy_backend
    smoke_public postgres
    ;;
  *)
    echo "Unknown mode $MODE" >&2
    exit 2
    ;;
esac
