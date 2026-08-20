#!/usr/bin/env bash
# PreToolUse hook for the Bash tool.
#
# Backstop for CLAUDE.md's "no commit/push without explicit request" rule.
# Blocks `git commit` / `git push` (any form, any flags, anywhere in a
# compound command) UNLESS the /commit skill dropped a fresh (<30 min)
# `.git-authorized` marker as its first step.
#
# CONTRACT (skill side): /commit creates the marker as its first step:
#   ROOT=$(git rev-parse --show-toplevel) && date +%s > "$ROOT/.claude/.git-authorized"
# and removes it as its last step:
#   rm -f "$(git rev-parse --show-toplevel)/.claude/.git-authorized"
#
# Read-only git (status/diff/log/fetch/branch/show/etc.) is never touched --
# only `git commit` and `git push` trip this hook.

set -euo pipefail
export LC_ALL=C

ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
MARKER="$ROOT/.claude/.git-authorized"
MAX_AGE_SECONDS=1800

input=$(cat 2>/dev/null || true)
[ -n "$input" ] || exit 0

command_str=""
if command -v jq >/dev/null 2>&1; then
  if extracted=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null); then
    command_str="$extracted"
  fi
else
  if extracted=$(printf '%s' "$input" | grep -o '"command"[[:space:]]*:[[:space:]]*"\([^"\\]\|\\.\)*"' | head -1 | sed -E 's/^"command"[[:space:]]*:[[:space:]]*"(.*)"$/\1/'); then
    command_str="$extracted"
  fi
fi

pattern='(^|[^a-zA-Z0-9_-])git([[:space:]]+-[^[:space:]]*([[:space:]]+[^-][^[:space:]]*)?)*[[:space:]]+(commit|push)([^a-zA-Z0-9_-]|$)'

haystack="$command_str"
[ -n "$haystack" ] || haystack="$input"

if ! printf '%s' "$haystack" | grep -Eq "$pattern"; then
  exit 0
fi

if [ -f "$MARKER" ]; then
  marker_epoch=$(cat "$MARKER" 2>/dev/null || echo 0)
  case "$marker_epoch" in
    ''|*[!0-9]*) marker_epoch=0 ;;
  esac
  now_epoch=$(date +%s)
  age=$(( now_epoch - marker_epoch ))
  if [ "$age" -ge 0 ] && [ "$age" -lt "$MAX_AGE_SECONDS" ]; then
    exit 0
  fi
fi

echo "git write blocked — run /commit after explicit user instruction (the skill drops the authorization marker)." >&2
exit 2
