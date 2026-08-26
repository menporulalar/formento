# 0011 — Package as a Claude Code plugin; retire project-level `.claude/`

**Status:** Decided (2026-08-26)

## Decision

Formento is repackaged as an installable Claude Code plugin. The pipeline's payload — 15 subagents, 8 phase triggers, hooks, and MCP server config — now lives at the plugin root (`agents/`, `commands/`, `skills/`, `hooks/hooks.json`, `.mcp.json`, `.claude-plugin/plugin.json`) instead of project-level `.claude/agents/` and `.claude/commands/`. The old `.claude/agents/`, `.claude/commands/`, and `.claude/settings.json` are deleted from this repo; everything they held has a direct successor in the plugin layout below.

**Both `commands/` and `skills/` ship, for different jobs — they are not redundant with each other:**
- `commands/<name>.md` (8 files, one per phase trigger + `formento-status`) is the mechanism that gives literal `/phase1-schema`-style invocation. This is the primary, intended way to drive Formento: phase progression is meant to be a deliberate, user-triggered action, never something Claude decides to start on its own because a description happened to match. This matters specifically because Formento's whole discipline is "nothing proceeds without explicit approval" (0005) — an auto-triggering skill would be in tension with that discipline at the entry point of every phase.
- `skills/<name>/SKILL.md` (the same 8, converted) stays as a secondary, natural-language discovery path — e.g. a user who types "start a new Formento project" without knowing the exact command name still finds Phase 0. It does not replace `commands/`.

This corrects an assumption made earlier in the same conversion effort: the `plugin-dev:create-plugin` skill's own Phase 2 guidance describes `commands/` as a "legacy format" superseded by `skills/`, stating the two are "loaded identically." A `plugin-dev:plugin-validator` review of the resulting plugin found that claim doesn't hold for this pipeline's use case — skills only auto-activate via description-matching, they don't provide guaranteed literal slash-command invocation. Since deliberate phase-by-phase control is a hard requirement here (not a nice-to-have), `commands/` was restored alongside `skills/` rather than treating skills as a drop-in replacement.

## Why

The user asked, after the `formento`/`formento-engine` merge (0010), whether Formento could be packaged for reuse across other coding-agent environments. Packaging as a proper Claude Code plugin was chosen as the near-term, achievable step: it makes the pipeline installable (`claude --plugin-dir /path/to/formento`) and shareable without copying `.claude/` files into every new project by hand, which is what Milestone 1 actually required. True cross-vendor portability (Cursor, other agent CLIs) is a separate, larger effort gated on extracting the stateful/checkable parts of the pipeline into a standalone MCP server — not started, and out of scope for this decision.

## Effect on existing docs/tooling

- `agents/` (15 files) — copied from `.claude/agents/`, frontmatter normalized to the plugin schema (`tools:` as a YAML array, `color:` added per the green=generation/yellow=review/cyan=orchestration scheme), all bare `docs/decisions/NNNN` references rewritten to `$CLAUDE_PLUGIN_ROOT/docs/decisions/NNNN-full-filename.md`.
- `commands/` (8 files) — restored per this decision, same `$CLAUDE_PLUGIN_ROOT`-prefixed doc references as `agents/`; internal `/phaseN-*` cross-references between commands are left as literal slash-command names since that's exactly what they now are again.
- `skills/` (8 files) — the same 8 phase triggers as `commands/`, kept as a secondary discovery path per the decision above.
- `hooks/hooks.json` — the 3 hooks previously in `.claude/settings.json` (Prettier/Prisma format-on-write, Spec IR FK-relationships structural check, destructive-Bash-command guard), ported with two fixes, not a straight copy: the FK-checker's path pointed at a sibling `formento-engine/src/spec-ir/` repo that no longer exists post-0010, now resolved via `$CLAUDE_PLUGIN_ROOT/engine/src/spec-ir/check-fk-relationships.mjs`; and all three hooks were reading tool-call data from `$CLAUDE_TOOL_INPUT_FILE_PATH`/`$CLAUDE_TOOL_INPUT_COMMAND` env vars that don't exist in Claude Code's hook contract (tool input arrives as JSON on stdin) — a pre-existing bug in the original `.claude/settings.json` that silently no-op'd all three hooks for the entire project, caught by `plugin-dev:plugin-validator` during this conversion and fixed to `cat | jq -r '.tool_input.file_path // empty'` / `.tool_input.command`.
- `.mcp.json` — unchanged; already had no hardcoded credentials (Postgres uses a bare local-dev URL, GitHub uses `${GITHUB_TOKEN}` env substitution).
- `LICENSE` — added (MIT), matching `plugin.json`'s existing `"license": "MIT"` declaration, which previously had nothing backing it.
- `.claude/agents/`, `.claude/commands/`, `.claude/settings.json` — deleted. Nothing here loses coverage: every agent, command, and hook has a direct successor in the plugin layout above.
- `README.md` — "Using this as a Claude Code plugin" and "Repo layout" sections updated to describe `commands/` + `skills/` + `agents/` + `hooks/` + `.mcp.json` as the installable payload.
