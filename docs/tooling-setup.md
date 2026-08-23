# Formento — Claude Code Tooling Setup

This documents everything added under `.claude/` and `.mcp.json` to support building Formento with Claude Code: subagents mapped to the 6-phase pipeline, slash commands to drive each phase, guardrail hooks, and the MCP servers the pipeline needs. Nothing here required a marketplace plugin — Formento's tooling is project-specific enough that it's built as plain `.claude/` config rather than a packaged plugin. Revisit that if this ever needs to ship to other people's machines.

**Repo note (docs/decisions/0006):** this `.claude/` setup is authored here in the `formento` docs repo, and a copy was made into `formento-engine` (2026-08-22) so Claude Code picks it up when run from there — which is where you'll actually be working from Milestone 0 onward. If you change an agent/command/hook, update both copies (or treat `formento` as the source of truth and re-copy into `formento-engine` after each change) until/unless this gets consolidated into one location later.

## Subagents (`.claude/agents/`)

Mapped 1:1 to the spec's "Agent orchestration layer" (§7) and the 6-phase pipeline (§6):

| Agent | Phase | Role |
|---|---|---|
| `spec-interviewer` | 0 | Conversational + templated entry modes → Project Brief + Spec IR |
| `extraction-agent` | 0a | Derived mode (codebase extraction only, v1) → baseline Spec IR + gap report |
| `schema-workflow-designer` | 1 | Entities/fields/workflow/roles + ER diagram; delta spec + breaking-change flagging for migration path |
| `ui-scaffold-agent` | 2 | Form layouts + views via the shadcn/ui + Tailwind adapter (v1) |
| `backend-provisioner` | 3 | Prisma migrations, API routes, auth/roles, seed or migration data |
| `integration-agent` | 4 | Wires frontend to backend, e2e validation, notifications, cutover strategy |
| `deploy-agent` | 5 | Docker/VPS provisioning, env config, handoff docs |
| `checkpoint-reviewer` | every phase boundary | Prepares the chat + inline-diff checkpoint; never decides, only presents |

Each agent's system prompt encodes the guardrails already decided in the spec and its decision records — e.g. `schema-workflow-designer` enforces the proactive breaking-change flagging from `docs/decisions/0001-...`, and `ui-scaffold-agent` is pinned to shadcn/ui + Tailwind per `docs/decisions/0002-...`. If either decision changes, update the corresponding agent file too.

### Reviewers (docs/decisions/0005)

A dedicated reviewer per phase, independent of the agent that produced the output, plus a coordinator that dispatches them:

| Agent | Phase | Role |
|---|---|---|
| `extraction-reviewer` | 0 / 0a | Checks extracted entities/fields against the real source repo; checks the gap report for obvious misses |
| `schema-reviewer` | 1 | Checks entity/relationship/role/workflow consistency, workflow-completeness (no dead ends), ER-diagram/spec drift |
| `design-reviewer` | 2 | Wraps `design:design-critique` + `design:accessibility-review` skills, plus Spec IR ↔ UI and role/permission checks |
| `backend-reviewer` | 3 | Prisma schema/migration correctness, server-side permission enforcement, secret leakage, resettability |
| `integration-reviewer` | 4 | Frontend/backend validation drift, notification wiring, verifies the "functional walkthrough" actually ran |
| `deploy-reviewer` | 5 | Secret leakage, deployment convention consistency, handoff-doc completeness, actual URL reachability |
| `review-coordinator` | every phase boundary, before `checkpoint-reviewer` | Dispatches the matching reviewer(s), aggregates blocking/non-blocking findings, blocks the checkpoint from presenting as ready-to-approve while blocking findings remain. Also watches for recurring gaps across phases/projects and proposes new skills/subagents/hooks/MCP servers — as its own explicit decision, never bundled into a phase approval, and never writing new tooling until the user approves it. |

Review now sits between agent output and checkpoint presentation for every phase: phase agent → `review-coordinator` (dispatches the phase's reviewer) → `checkpoint-reviewer` (presents to the user) → user approves/modifies. See `docs/decisions/0005-review-layer-added.md` for the rationale.

## Slash commands (`.claude/commands/`)

- `/phase0-intent` — start Phase 0 (routes to `spec-interviewer` or `extraction-agent` by entry mode)
- `/phase0b-redesign-intent` — derived-mode-only: capture migration-vs-fresh-rebuild choice
- `/phase1-schema` through `/phase5-deploy` — run each phase's agent, then the checkpoint
- `/formento-status` — quick "where are we in the pipeline" summary

Commands are intentionally thin — they just sequence "run the phase agent → run review-coordinator → run the checkpoint reviewer" and enforce that the next phase doesn't start until the current checkpoint is approved. The actual pipeline logic lives in the agents.

## Hooks (`.claude/settings.json`)

- **PostToolUse (Edit/Write on `.prisma`/`.ts`/`.tsx`/`.js`/`.jsx`)** — auto-runs `prisma format` or `prettier` on generated files, if installed. No-ops silently if the tool isn't present, so it won't break a machine that hasn't installed them yet.
- **PreToolUse (Bash)** — blocks a short list of destructive commands (`prisma migrate reset`, `docker compose down -v`, `rm -rf` on `node_modules`/`.git`) from running unattended, given Phase 3 onward touches real data/infra. This is a safety net, not a substitute for the phase checkpoints.

Extend the destructive-command pattern as more infra work lands (e.g. once Phase 5 adds real deploy commands, consider guarding `docker system prune`, force-pushes, etc.).

## MCP servers (`.mcp.json`)

| Server | Why it's needed | Used by |
|---|---|---|
| `postgres` | Inspect schema, verify migrations against the Spec IR | `backend-provisioner` (Phase 3); later, DB-schema-alone extraction (v2) |
| `github` | Read an existing repo for derived-mode extraction; optionally push the generated project | `extraction-agent` (Phase 0a); `deploy-agent` (Phase 5) handoff |
| `filesystem` | Scoped read/write on the generated project directory once real app code exists (Phase 2+) | `ui-scaffold-agent`, `backend-provisioner`, `integration-agent` |

**Before this works, you need to:**
1. Have Postgres running locally (or point the connection string at wherever the dev DB lives) and update the URL in `.mcp.json` — better yet, move it to an env var (`${DATABASE_URL}`) once a real `.env` exists, rather than leaving a literal connection string in a committed file.
2. Set a `GITHUB_TOKEN` in your shell environment (`.mcp.json` reads it via `${GITHUB_TOKEN}`, never hardcode a token in the file).
3. Run `npx -y @modelcontextprotocol/server-postgres`, `...server-github`, and `...server-filesystem` once manually (or just start a Claude Code session in this folder) to confirm each installs cleanly — they're fetched via `npx` on first use, no separate install step needed.

None of these are wired up yet in this environment (no local Postgres, no GitHub token here) — `.mcp.json` is committed as configuration for when you start actual Phase 0–5 work locally in Claude Code, not something this session activated.

## Skills

No packaged Claude skill fits Formento's own pipeline logic (it's bespoke orchestration, not a document/spreadsheet/slide format), so none is added at that level. The general-purpose `docx`/`pdf`/`xlsx` skills remain available for incidental deliverables (e.g. if a stakeholder wants the spec exported as a Word doc) but aren't part of the build pipeline itself.

`design-reviewer` (Phase 2) does invoke two of Anthropic's own design skills directly: `design:design-critique` and `design:accessibility-review` — these are legitimate, vetted skills already available in this environment, unlike a third-party skill considered and declined earlier (unverifiable claims, no reason to trust the supply chain) in favor of these.

A third-party "UI UX Pro Max" skill was evaluated and declined (2026-08-22) — its README claimed 119k+ GitHub stars for an npm package published roughly two months prior, which doesn't hold up, and installing it means running an unverified third-party global installer. Not wired into Formento; revisit only if the user independently verifies it first.

## What's deliberately not included

- **Qdrant/pgvector MCP** — spec explicitly keeps this out of the default path (§7); only add if/when a project's Spec IR has an AI-assisted field.
- **Redis/BullMQ MCP** — no widely-used MCP server for this exists; the `backend-provisioner` agent writes queue code directly instead.
- **A packaged plugin** — this tooling is specific to building Formento itself, not something to distribute yet. If Formento later needs to hand this workflow to other contributors, package `.claude/` into a proper plugin at that point.
