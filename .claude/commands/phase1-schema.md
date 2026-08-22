---
description: Run Phase 1 — Schema & Workflow Design
---

Invoke the `schema-workflow-designer` subagent with the approved Phase 0 Project Brief / Spec IR (and, if migration path, the baseline Spec IR + redesign intent from Phase 0b).

If migration path: require every flagged breaking change to be individually resolved before calling `checkpoint-reviewer`. Do not batch-approve breaking changes.

When the spec doc + ER diagram (and delta/breaking-change list, if applicable) are ready, invoke `checkpoint-reviewer` to present the Phase 1 checkpoint. Do not proceed to `/phase2-ui` until approved.

