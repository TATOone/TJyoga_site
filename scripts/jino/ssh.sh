#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
KEY_FILE="${JINO_SSH_KEY_FILE:-/tmp/jino-ssh-key}"
HOST="${JINO_SSH_HOST:-da38d1308862.vps.myjino.ru}"
PORT="${JINO_SSH_PORT:-49242}"
USER_NAME="${JINO_SSH_USER:-root}"
KNOWN_HOSTS="${JINO_SSH_KNOWN_HOSTS:-/tmp/jino-known-hosts}"

if [[ ! -f "$KEY_FILE" ]]; then
  KEY_FILE="$(python3 "$ROOT_DIR/scripts/jino/write-key.py")"
fi

chmod 600 "$KEY_FILE"

exec ssh \
  -i "$KEY_FILE" \
  -p "$PORT" \
  -o BatchMode=yes \
  -o IdentitiesOnly=yes \
  -o PreferredAuthentications=publickey \
  -o StrictHostKeyChecking=accept-new \
  -o UserKnownHostsFile="$KNOWN_HOSTS" \
  -o ConnectTimeout=15 \
  "${USER_NAME}@${HOST}" \
  "$@"
