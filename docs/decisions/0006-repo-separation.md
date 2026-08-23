# 0006 — Three-way repo separation: docs, engine, and generated projects

**Status:** Decided (2026-08-22)

## Decision

Formento's own work is split across three kinds of repos/folders, never mixed:

1. **`formento`** (this repo, github.com/menporulalar/formento) — spec, PRD, Spec IR schema doc, build plan, decision records, and the `.claude/` agents/commands/hooks/MCP config that drive Claude Code through the build. Docs and tooling only, no implementation code.
2. **`formento-engine`** (new, local at `~/Documents/Product/Nanda-Projects/formento-engine`, sibling folder to this one) — the actual TypeScript implementation: Spec IR types + zod validators, the checkpoint state machine, and the phase compiler logic. This is where Milestone 0 onward actually gets built. Scaffolded 2026-08-22 (package.json, tsconfig, src/spec-ir, src/checkpoint, test/, git-initialized locally); no GitHub remote set up yet — local only for now, by choice, until there's real content worth pushing.
3. **Generated projects** — every real form-heavy app Formento produces (starting with the Milestone 1 derived-mode project) lives in its own separate folder/repo, dedicated to that project alone. Never nested inside `formento` or `formento-engine`.

## Why

Each of the three has a different lifecycle and audience: the docs repo is planning/decision history that rarely needs code review; the engine repo is the actual product under active development with its own dependency graph, test suite, and release cadence; a generated project is someone's real internal tool with its own deployment lifecycle entirely disconnected from Formento's own development. Mixing any of these would make `git log`, dependency management, and deployment boundaries all confusing — a change to a generated project's `package.json` shouldn't touch Formento's own repos, and a Formento engine refactor shouldn't require touching every generated project's history.

## Effect on existing docs

- `build-plan.md`'s Milestone 0 (Spec IR types, checkpoint state machine, unit tests) now lands in `formento-engine`, not this repo.
- `docs/tooling-setup.md` and `README.md` updated to point to the new repo and clarify the three-way split.
- The Milestone 1 derived-mode source codebase (the project Formento extracts from) will be a path shared separately, distinct from both `formento` and `formento-engine` — and its own rebuild output will land in yet another dedicated folder/repo, not inside either.
- `.claude/` and `.mcp.json` are authored in `formento` (this repo) but copied into `formento-engine` (2026-08-22) so Claude Code picks them up when run from there, since that's where actual development happens. Treat `formento` as the source of truth for tooling changes and re-copy into `formento-engine` after edits, until/unless this gets consolidated into a single location later.
