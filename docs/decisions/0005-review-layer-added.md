# 0005 — Independent reviewer layer + coordinator added

**Status:** Decided (2026-08-22)

## Decision

Added a dedicated reviewer subagent per phase, plus a `review-coordinator` that runs between a phase agent's output and `checkpoint-reviewer`:

| Phase | Reviewer |
|---|---|
| 0 / 0a | `extraction-reviewer` |
| 1 | `schema-reviewer` |
| 2 | `design-reviewer` (wraps `design:design-critique` + `design:accessibility-review` skills) |
| 3 | `backend-reviewer` |
| 4 | `integration-reviewer` |
| 5 | `deploy-reviewer` |

Each phase command (`/phase0-intent` through `/phase5-deploy`) now runs `review-coordinator` — which dispatches the matching reviewer(s), aggregates findings as **blocking**/**non-blocking** — before `checkpoint-reviewer` presents anything to the user. A checkpoint isn't presented as ready-to-approve while blocking findings remain.

`review-coordinator` also has a second, ongoing role: watching for recurring gaps across a project (or across projects over time) that a reusable skill, subagent, hook, or MCP server could close systematically, and proposing that addition to the user — as its own explicit, separate decision alongside (never bundled into) a phase checkpoint. Only once approved does it write the new tooling into `.claude/` for reuse.

## Why

The existing `checkpoint-reviewer` (added in the original tooling setup) is a *presentation* layer — it makes a phase's output legible for approval, but it was never meant to independently verify that output is actually correct. Without a separate review step, a phase agent's own mistakes (a workflow with no exit path, a missing server-side permission check, an unreachable deploy) could reach the user framed as "ready to approve" with no adversarial check in between. Splitting review (substantive, adversarial, phase-specific) from checkpoint presentation (legible, proposal-framed, user-facing) keeps each piece doing one job well — the same instinct behind Formento's own phase-agent structure.

Extending this role to also *propose* new tooling — rather than letting gaps just recur silently — turns Formento's own development into something that gets systematically easier project over project, not just phase over phase within one project. Gating that proposal behind explicit user approval (never auto-added) keeps it consistent with Formento's core checkpoint discipline applied reflexively to its own tooling.

## Effect on existing docs

- `.claude/agents/`: added `extraction-reviewer.md`, `schema-reviewer.md`, `design-reviewer.md`, `backend-reviewer.md`, `integration-reviewer.md`, `deploy-reviewer.md`, `review-coordinator.md`.
- `.claude/commands/phase0-intent.md` through `phase5-deploy.md`: each now runs `review-coordinator` before `checkpoint-reviewer`.
- `docs/tooling-setup.md`: updated with the new agents and the review-then-checkpoint sequencing.
