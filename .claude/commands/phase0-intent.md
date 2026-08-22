---
description: Start Phase 0 (Intent Capture) — conversational/templated interview or codebase extraction
---

Determine entry mode with the user first if not already stated: conversational, templated, or derived (existing codebase).

- Conversational or templated → invoke the `spec-interviewer` subagent to run the structured interview / template customization and produce the Project Brief + Spec IR.
- Derived → invoke the `extraction-agent` subagent to reverse-engineer the pointed-at codebase into a baseline Spec IR + gap/quality report. Remind the user v1 only supports codebase extraction (not DB-schema-alone, PDF, spreadsheet, or screenshot sources).

When the agent's output is ready, invoke `checkpoint-reviewer` to present the Phase 0 checkpoint. Do not proceed to Phase 1 (or, for derived mode, to the Phase 0b migration/fresh-rebuild choice) until the user approves.

Arguments: $ARGUMENTS (optional — entry mode or template name if the user already specified one)

