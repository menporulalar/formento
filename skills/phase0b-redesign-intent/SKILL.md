---
name: phase0b-redesign-intent
description: This skill should be used when the user asks to "capture redesign intent", "choose migration or fresh rebuild", or invokes "/phase0b-redesign-intent" — runs after a derived-mode Phase 0a baseline is confirmed, to explicitly capture the migration-vs-fresh-rebuild choice.
argument-hint: ""
allowed-tools: Task, AskUserQuestion, Edit, Write
---

Only run this after the Phase 0a extraction checkpoint has been approved.

Ask the user explicitly which path they want:
- **Migration path** — evolve the existing system. Output will be a delta spec (diff vs. baseline); old data must carry forward; downstream phases (1, 3, 4) become migration-aware.
- **Fresh rebuild path** — use the old system only as reference/inspiration. Output is a new standalone spec; old data import is optional and decided field-by-field; downstream phases are identical to conversational/templated mode.

Do not default or infer this choice — it must be explicit. Record the choice in the project's Spec IR metadata so every later phase and subagent knows which mode it's operating in.

Once chosen, proceed to the `phase1-schema` skill.
