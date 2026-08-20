@AGENTS.md

# my-app - Claude Code Instructions

**Project:** Expo/React Native learning app (file-based routing via `expo-router`)
**Stack:** Expo SDK 54 + React Native 0.81 + React 19 + TypeScript (strict) + expo-router 6

---

## Agent Dispatch

Task touches React Native components, screens, or navigation -> `.claude/agents/rn-frontend-architect.md`.
Task is reviewing a diff before commit -> `.claude/agents/code-reviewer.md`.
Task is a build/runtime error, Metro bundler issue, or "why won't this run" -> `.claude/agents/troubleshooter.md`.
Task touches `app.json`, native config, EAS, or adding/upgrading a dependency -> `.claude/agents/expo-config-specialist.md`.
Anything else (small edits, exploration, questions): handle directly, no agent needed.

---

## Working Principles

- **Explain before changing.** State what you're about to change and why for anything beyond a trivial edit.
- **Git safety.** Never `git commit` or `git push` unless explicitly asked in the current message. No force push, no `--no-verify`.
- **Versioned Expo docs only.** Per `AGENTS.md`, Expo has changed recently — check `https://docs.expo.dev/versions/v54.0.0/` before writing Expo-specific code instead of relying on training data.
- **No unnecessary abstraction.** This is a small, single-developer app — don't add layers, config, or process that doesn't pay for itself yet.

---

## Git & Commits

- Single-developer repo, `main` is the working branch — no enforced feature-branch workflow.
- Commit style: short, imperative subject line (Conventional Commits prefix optional, e.g. `fix: correct tab icon color`).
- Use `/commit` to stage, lint, and commit. It never pushes — pushing is a separate explicit request.

---

## OVERRIDES (Non-Negotiable)

1. **No commit/push without explicit request in the current message.** Mechanically backed by `.claude/hooks/git-guard.sh`.
2. **No destructive git/filesystem operations** (`reset --hard`, force push, `rm -rf`, deleting branches) without explicit request.
3. **No emojis** in code, commits, or comments unless asked.
4. **No new files** (docs, READMEs, config) unless the task calls for them.
5. **Lint before commit.** Run `npm run lint` (`expo lint`) on any commit that touches source files.
