#!/usr/bin/env python3
"""Materialize JINO_SSH_PRIVATE_KEY to a 0600 file. Prints only the path."""

from __future__ import annotations

import os
import re
import stat
import sys
from pathlib import Path


def normalize_pem(raw: str) -> str:
    text = raw.replace("\r\n", "\n").replace("\r", "\n").replace("\\n", "\n").strip()
    if not text:
        raise SystemExit("JINO_SSH_PRIVATE_KEY is empty")
    if "BEGIN" not in text or "PRIVATE KEY" not in text:
        raise SystemExit("JINO_SSH_PRIVATE_KEY does not look like a PEM private key")
    if "\n" in text:
        return text if text.endswith("\n") else f"{text}\n"

    match = re.match(r"(-----BEGIN [^-]+-----)\s*(.*?)\s*(-----END [^-]+-----)", text, re.S)
    if match is None:
        raise SystemExit("Unable to parse single-line PEM")

    header, body, footer = match.group(1), re.sub(r"\s+", "", match.group(2)), match.group(3)
    width = 70 if "OPENSSH" in header else 64
    wrapped = "\n".join(body[index : index + width] for index in range(0, len(body), width))
    return f"{header}\n{wrapped}\n{footer}\n"


def read_key_material() -> str:
    env_value = os.environ.get("JINO_SSH_PRIVATE_KEY")
    if env_value:
        return env_value

    file_hint = os.environ.get("JINO_SSH_PRIVATE_KEY_FILE")
    candidates = [
        Path(file_hint) if file_hint else None,
        Path("/run/cursor/secrets/JINO_SSH_PRIVATE_KEY"),
        Path("/run/secrets/JINO_SSH_PRIVATE_KEY"),
        Path.home() / ".cursor" / "secrets" / "JINO_SSH_PRIVATE_KEY",
    ]
    for candidate in candidates:
        if candidate is None:
            continue
        if candidate.is_file():
            return candidate.read_text(encoding="utf-8")

    raise SystemExit("JINO_SSH_PRIVATE_KEY is not set in the environment")


def main() -> None:
    dest = Path(os.environ.get("JINO_SSH_KEY_FILE", "/tmp/jino-ssh-key"))
    pem = normalize_pem(read_key_material())
    dest.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(dest, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, stat.S_IRUSR | stat.S_IWUSR)
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        handle.write(pem)
    os.chmod(dest, stat.S_IRUSR | stat.S_IWUSR)
    sys.stdout.write(f"{dest}\n")


if __name__ == "__main__":
    main()
