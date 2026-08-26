---
description: Run Phase 4 — Integration & Wiring
---

Invoke the `integration-agent` subagent to connect Phase 2 frontend forms to the Phase 3 backend, add end-to-end validation, and wire notification/email hooks. If migration path with the old system staying live, also produce the coexistence/cutover strategy.

Before presenting the checkpoint, actually submit a real test entry end-to-end and confirm it works — this phase's checkpoint IS the functional walkthrough.

Invoke `review-coordinator` to run `integration-reviewer` (which independently checks the walkthrough actually happened, not just that it was claimed) and aggregate findings. Only invoke `checkpoint-reviewer` once no blocking findings remain. Do not proceed to `/phase5-deploy` until approved.
