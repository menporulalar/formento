---
name: phase2-ui
description: This skill should be used when the user asks to "run Phase 2", "scaffold the UI", "build the frontend forms", or invokes "/phase2-ui" to produce wireframe-level form layouts and list/detail/admin views on shadcn/ui + Tailwind (Formento's v1 default).
argument-hint: ""
allowed-tools: Task, AskUserQuestion
---

Confirm the UI framework is shadcn/ui + Tailwind (Formento's v1 default per `$CLAUDE_PLUGIN_ROOT/docs/decisions/0002-v1-open-questions-resolved.md`) unless the user explicitly wants to change it — if so, note that no other adapter is built yet in v1 and confirm they want to proceed anyway or defer.

Invoke the `ui-scaffold-agent` subagent with the approved Phase 1 Spec IR to produce wireframe-level form layouts and list/detail/admin views, delivered as a self-contained interactive HTML mockup (the standard visual-review artifact, not ASCII wireframes — see the agent's own instructions).

When ready, invoke `review-coordinator` to run `design-reviewer` (design critique + accessibility pass) and aggregate findings. Only invoke `checkpoint-reviewer` to present the Phase 2 visual review checkpoint (layout/reorder/approve) once no blocking findings remain. Do not proceed to the `phase3-backend` skill until approved.
