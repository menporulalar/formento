---
name: formento-status
description: This skill should be used when the user asks "where are we", "what's the status", "what phase are we in", or invokes "/formento-status" to check where the current Formento project stands in the phase pipeline.
argument-hint: ""
allowed-tools: Read, Glob, Grep
---

Read the project's Spec IR and docs to determine: current phase, entry mode used (derived/conversational/templated), migration vs. fresh-rebuild (if derived), and which checkpoints are approved vs. pending.

Summarize in a short status line plus a one-line note on what the next action is (which phaseN skill to invoke next, e.g. `/phase1-schema`, or what decision is blocking progress).
