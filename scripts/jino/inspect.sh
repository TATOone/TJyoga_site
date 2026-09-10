#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SSH="$ROOT_DIR/scripts/jino/ssh.sh"

echo "== local: materialize key and BatchMode SSH =="
KEY_FILE="$(python3 "$ROOT_DIR/scripts/jino/write-key.py")"
export JINO_SSH_KEY_FILE="$KEY_FILE"
echo "key_file=$KEY_FILE mode=$(stat -c '%a' "$KEY_FILE")"

"$SSH" 'echo SSH_OK; uname -a; node -v; which pm2 nginx; date -Is'

echo
echo "== remote: /var/www/tjyoga layout =="
"$SSH" 'bash -s' <<'REMOTE'
set -euo pipefail
echo "--- tree ---"
if command -v tree >/dev/null 2>&1; then
  tree -L 3 -a --noreport /var/www/tjyoga | sed '/\.env/d'
else
  find /var/www/tjyoga -maxdepth 3 \( -name '.env' -o -name '*.pem' \) -prune -o -print | sort
fi

echo "--- top-level ---"
ls -la /var/www/tjyoga

echo "--- dist / uploads / releases / backups ---"
ls -ld /var/www/tjyoga/app /var/www/tjyoga/app/dist /var/www/tjyoga/uploads \
  /var/www/tjyoga/backups /var/www/tjyoga/releases /var/www/tjyoga/logs 2>/dev/null || true
ls -la /var/www/tjyoga/app/dist 2>/dev/null | head
ls -la /var/www/tjyoga/backups 2>/dev/null | tail
ls -la /var/www/tjyoga/releases 2>/dev/null | tail

echo "--- pm2 ---"
if command -v pm2 >/dev/null 2>&1; then
  pm2 ping || true
  pm2 list
  echo "--- pm2 jlist cwd/script/env keys ---"
  python3 - <<'PY'
import json, subprocess
raw = subprocess.check_output(["pm2", "jlist"], text=True)
for app in json.loads(raw):
    env = app.get("pm2_env") or {}
    env_keys = sorted(k for k in env.keys() if k in {
        "NODE_ENV","PORT","HOST","DATABASE_URL","AUTH_DEV_BYPASS_ENABLED",
        "APP_ALLOWED_ORIGINS","PWD","exec_mode"
    } or k.endswith("_URL") or "SECRET" in k or "KEY" in k)
    print("name=", app.get("name"))
    print("  status=", env.get("status"))
    print("  cwd=", env.get("pm_cwd") or env.get("cwd"))
    print("  script=", env.get("pm_exec_path") or env.get("script"))
    print("  interpreter=", env.get("exec_interpreter"))
    print("  NODE_ENV=", env.get("NODE_ENV"))
    print("  PORT=", env.get("PORT"))
    print("  DATABASE_URL_set=", "yes" if env.get("DATABASE_URL") else "no")
    print("  AUTH_DEV_BYPASS_ENABLED=", env.get("AUTH_DEV_BYPASS_ENABLED"))
    print("  env_secretish_keys=", [k for k in env_keys if "SECRET" in k or "KEY" in k or k=="DATABASE_URL"])
PY
else
  echo "pm2 not found"
fi

echo "--- ecosystem.config.cjs ---"
for candidate in \
  /var/www/tjyoga/ecosystem.config.cjs \
  /var/www/tjyoga/ecosystem.config.js \
  /var/www/tjyoga/backend/ecosystem.config.cjs \
  /var/www/tjyoga/app/ecosystem.config.cjs
do
  if [[ -f "$candidate" ]]; then
    echo "FOUND $candidate"
    python3 - "$candidate" <<'PY'
import pathlib, re, sys
text = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace")
redacted = re.sub(r"(SECRET|PASSWORD|TOKEN|KEY|DATABASE_URL)(\s*[:=]\s*)(['\"]).*?\3",
                  r"\1\2\3***\3", text, flags=re.I|re.S)
print(redacted)
PY
  fi
done

echo "--- listening 8787 ---"
ss -lntp | grep -E ':8787|:80|:443' || netstat -lntp | grep -E ':8787|:80|:443' || true

echo "--- nginx site tjyoga ---"
nginx -T 2>/dev/null | awk '
  /server_name/ || /root / || /proxy_pass/ || /location/ || /listen/ {print}
' | head -n 80
ls -la /etc/nginx/sites-enabled /etc/nginx/sites-available 2>/dev/null || true

echo "--- backend env files (names only, values redacted) ---"
find /var/www/tjyoga -maxdepth 4 -name '.env' -o -name '.env.production' -o -name '.env.local' | while read -r envfile; do
  echo "FILE $envfile mode=$(stat -c '%a' "$envfile")"
  python3 - "$envfile" <<'PY'
import pathlib, sys
path = pathlib.Path(sys.argv[1])
for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
    stripped = line.strip()
    if not stripped or stripped.startswith("#") or "=" not in stripped:
        continue
    key, value = stripped.split("=", 1)
    set_flag = "set" if value.strip() else "empty"
    print(f"  {key}={set_flag}")
PY
done

echo "--- postgres local? ---"
(command -v psql && psql --version) || echo "psql_absent"
systemctl is-active postgresql 2>/dev/null || true
ss -lntp | grep 5432 || true

echo "--- health local ---"
curl -sS -m 5 -i http://127.0.0.1:8787/health | head -n 20 || true
REMOTE
