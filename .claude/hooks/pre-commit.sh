#!/usr/bin/env bash
# PreToolUse (Bash) — bloque les commandes jugées trop destructrices.
set -euo pipefail
INPUT="$(cat)"
CMD="$(echo "$INPUT" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('command', '') or '')
except Exception:
    print('')
" 2>/dev/null || true)"

deny() {
  python3 -c "import json, sys; print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny', 'permissionDecisionReason': sys.argv[1]}}))" "$1"
  exit 0
}

# rm -rf vers /, /* ou /. uniquement (pas rm -rf /tmp/...)
if printf '%s' "$CMD" | python3 -c "
import re, sys
cmd = sys.stdin.read()
if re.search(r'rm\s+-rf\s+(?:/\s*$|/\*\s*$|/\.\s*$)', cmd):
    sys.exit(1)
sys.exit(0)
" 2>/dev/null; then
  :
else
  deny "Commande rm -rf vers la racine du système de fichiers bloquée."
fi

case "$CMD" in
  *"mkfs"*) deny "Commande mkfs bloquée." ;;
esac

if echo "$CMD" | grep -qE 'dd[[:space:]]+if=' && echo "$CMD" | grep -qE 'of=/dev/'; then
  deny "dd vers un périphérique bloc bloquée."
fi

if echo "$CMD" | grep -qE 'git[[:space:]]+push[[:space:]]+(-f|--force)'; then
  deny "git push --force bloqué par la politique du projet."
fi

exit 0
