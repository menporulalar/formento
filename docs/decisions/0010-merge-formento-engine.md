# 0010 — Merge formento-engine into formento

**Status:** Decided (2026-08-24)

## Decision

`formento-engine` (the separate implementation repo introduced by decision 0006) is merged into this repo under `engine/`, and the standalone `formento-engine` GitHub repo is archived (kept, read-only, history intact — not deleted). Decision 0006's other half — generated projects always live in their own separate repo, never nested in `formento` or its `engine/` subdirectory — is unaffected and still stands.

## Why

`formento-engine` was still pure scaffold: no Spec IR types, no checkpoint state machine, no compiler logic — Milestone 0 never landed. Every real phase execution to date (the full Milestone 1 project, Phase 0 through 5, the mid-project revision cascade) ran entirely through `.claude/` agent definitions reading and writing Spec IR JSON directly in the generated project's own repo — `formento-engine`'s TypeScript code was never actually invoked for any of it. The spec/implementation split that motivated 0006 is a real distinction in principle, but it was premature for a solo project at this stage: two repos meant two READMEs to keep in sync, cross-repo links, and anyone (including a future me) needing both open to get the full picture, for a benefit — independent versioning/publishing of a real engine package — that doesn't exist yet.

The split would earn its keep again if `engine/`'s Spec IR types/checkpoint state machine become a real, tested, semantically-versioned package published independently of the docs. That's a legitimate reason to split later; un-merging is cheap. Merging back an active split is the expensive direction, so defaulting to one repo now and re-splitting only when the engine is real is the lower-risk order of operations.

## Effect on existing docs/tooling

- `engine/` — `formento-engine`'s full scaffold (src/, test/, package.json, tsconfig.json), copied in fresh (not history-preserving; `formento-engine` only had 3 commits with no real implementation to lose) via `git subtree`/plain copy per the user's own choice. `engine/README.md` scoped to that directory.
- `.github/workflows/engine-ci.yml` — the engine's CI (typecheck, tests, FK-relationships check), adapted to run scoped to `engine/` (path-filtered triggers, `working-directory: engine`) rather than repo-root.
- `README.md` — repo-layout section rewritten to describe the merged structure instead of the two-repo split.
- `.gitignore` — added `coverage/` (needed by the engine's vitest suite, wasn't previously relevant to this repo).
- The standalone `formento-engine` GitHub repo is archived, not deleted — its history and URL stay intact and reversible if a future split is ever warranted.
