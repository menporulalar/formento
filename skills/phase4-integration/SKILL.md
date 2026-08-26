---
name: phase4-integration
description: This skill should be used when the user asks to "run Phase 4", "wire the frontend to the backend", "run the functional walkthrough", or invokes "/phase4-integration" for Integration & Wiring.
argument-hint: ""
allowed-tools: Task
---

Invoke the `integration-agent` subagent to connect Phase 2 frontend forms to the Phase 3 backend, add end-to-end validation, and wire notification/email hooks. If migration path with the old system staying live, also produce the coexistence/cutover strategy.

Before presenting the checkpoint, actually submit a real test entry end-to-end through the actual UI in a real browser (not just API calls) and confirm it works — this phase's checkpoint IS the functional walkthrough. A real browser walkthrough has repeatedly caught bugs that curl/API-contract review alone missed.

Invoke `review-coordinator` to run `integration-reviewer` (which independently checks the walkthrough actually happened, not just that it was claimed) and aggregate findings. Only invoke `checkpoint-reviewer` once no blocking findings remain. Do not proceed to the `phase5-deploy` skill until approved.
