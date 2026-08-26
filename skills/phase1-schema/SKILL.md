---
name: phase1-schema
description: This skill should be used when the user asks to "run Phase 1", "design the schema", "design entities and workflow", or invokes "/phase1-schema" to turn an approved Phase 0 Project Brief / Spec IR into entities, fields, relationships, workflow states, and roles.
argument-hint: ""
allowed-tools: Task
---

Invoke the `schema-workflow-designer` subagent with the approved Phase 0 Project Brief / Spec IR (and, if migration path, the baseline Spec IR + redesign intent from Phase 0b). This subagent also handles mid-project spec revisions to an already-approved fresh-rebuild spec — see its own instructions for that case.

If migration path (or a mid-project revision with breaking changes): require every flagged breaking change to be individually resolved before calling `checkpoint-reviewer`. Do not batch-approve breaking changes.

When the spec doc + ER diagram (and delta/breaking-change list, if applicable) are ready, invoke `review-coordinator` to run `schema-reviewer` and aggregate findings. Only invoke `checkpoint-reviewer` once review-coordinator reports no blocking findings (or the phase agent has addressed them). Do not proceed to the `phase2-ui` skill until the checkpoint is approved.
