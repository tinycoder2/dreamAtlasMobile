---
name: commit
description: "Stage changes, run lint, and commit on the current branch. Does NOT push."
disable-model-invocation: true
---

Commit changes in this repo. Validates state, runs lint, commits. **Does NOT push.**

**Authorize git writes for this run:** `ROOT=$(git rev-parse --show-toplevel) && date +%s > "$ROOT/.claude/.git-authorized"`

## Step 1: Assess current state

```bash
git status
git diff --stat
git diff --staged --stat
git log --oneline -5
```

If HEAD is detached: **STOP.** Report: "Detached HEAD — checkout a branch first."
If there are no uncommitted changes: **STOP.** Report: "Nothing to commit."

## Step 2: Stage and lint

1. Show a summary of the changes and the proposed commit scope.
2. Stage all changed files EXCEPT `.env*`, secrets, and anything clearly not meant to be committed.
3. Run `npm run lint` if the diff touches any `.ts`/`.tsx` file. Fix reported issues, re-run (up to 3 times) if it modifies files.
4. If lint fails on real code errors after 3 attempts, stop and report — do not commit broken code.

## Step 3: Commit (no push)

1. Write a short, imperative commit message (Conventional Commits prefix optional — `feat:`, `fix:`, `chore:`, etc.).
2. Commit using a HEREDOC for the message.
3. **Do NOT push.** Pushing is a separate, explicitly requested action.

## Step 4: Report

```
## Commit Summary

### Pipeline
| Step  | Status |
|-------|--------|
| Lint  | [pass / N iterations] |
| Commit| [SHA] |

[git log --oneline -3]

Did NOT push.
```

**Revoke:** `rm -f "$(git rev-parse --show-toplevel)/.claude/.git-authorized"`

## Non-Negotiable Rules

1. **NEVER push.** Push is a separate, explicitly-requested step.
2. **NEVER skip lint** on a commit touching source files.
3. **NEVER commit secrets** (`.env*`, credentials, API keys).
