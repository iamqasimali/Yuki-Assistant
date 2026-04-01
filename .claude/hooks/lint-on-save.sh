#!/usr/bin/env bash
# PostToolUse (Edit|Write) — lance un lint ciblé si les outils existent (sortie sur stderr pour Claude).
set -euo pipefail
INPUT="$(cat)"
FILE="$(echo "$INPUT" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    ti = d.get('tool_input', {})
    print(ti.get('file_path', '') or ti.get('path', '') or '')
except Exception:
    print('')
" 2>/dev/null || true)"

[[ -z "$FILE" || ! -f "$FILE" ]] && exit 0

case "$FILE" in
  *.py)
    if command -v ruff >/dev/null 2>&1; then
      ruff check "$FILE" 2>&1 >&2 || true
    elif command -v uv >/dev/null 2>&1 && [[ -f pyproject.toml ]]; then
      uv run ruff check "$FILE" 2>&1 >&2 || true
    fi
    ;;
  *.ts|*.tsx|*.js|*.jsx)
    if [[ -f package.json ]] && command -v npx >/dev/null 2>&1; then
      if grep -q '"eslint"' package.json 2>/dev/null || [[ -f eslint.config.js ]] || [[ -f .eslintrc.cjs ]]; then
        npx eslint "$FILE" 2>&1 >&2 || true
      fi
    fi
    ;;
esac

exit 0
