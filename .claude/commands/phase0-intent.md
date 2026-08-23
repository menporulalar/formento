---
description: Start Phase 0 (Intent Capture) — derived mode (extraction) is the current default; conversational/templated is deprioritized until Milestone 2
---

Per docs/decisions/0004, derived mode is the priority entry path right now — the first real project is built by pointing Formento at an existing codebase. Conversational/templated entry (Milestone 2) is deferred, not removed.

- Derived (default) → invoke the `extraction-agent` subagent to reverse-engineer the pointed-at codebase into a baseline Spec IR + gap/quality report. Remind the user v1 only supports codebase extraction (not DB-schema-alone, PDF, spreadsheet, or screenshot sources).
- Conversational or templated → only if the user explicitly asks for it ahead of schedule; invoke the `spec-interviewer` subagent to run the structured interview / template customization and produce the Project Brief + Spec IR.

When the agent's output is ready, invoke `review-coordinator` to run `extraction-reviewer` (checks extracted entities/fields against the real source, and that the gap report didn't miss anything obvious) and aggregate findings. Only invoke `checkpoint-reviewer` to present the Phase 0 checkpoint once no blocking findings remain.

At Phase 0b (derived mode only): only the fresh-rebuild outcome is implemented (docs/decisions/0003, 0004 — migration is deferred to Milestone 5). Confirm the user wants fresh-rebuild explicitly; if they ask for the migration path, tell them it isn't built yet and point to docs/decisions/0003 rather than attempting it.

Do not proceed to Phase 1 until the Phase 0 (and, for derived mode, Phase 0b) checkpoint is approved.

Arguments: $ARGUMENTS (optional — repo path for derived mode, or entry mode/template name if conversational/templated is explicitly requested)

