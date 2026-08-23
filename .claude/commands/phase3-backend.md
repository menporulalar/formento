---
description: Run Phase 3 — Backend & Data Provisioning
---

Invoke the `backend-provisioner` subagent with the approved Phase 1 spec (and Phase 2 UI for field-level wiring hints) to generate Prisma migrations, API routes, auth/roles, and seed/migration data in a sandbox/local env.

When ready, invoke `review-coordinator` to run `backend-reviewer` (correctness + security pass) and aggregate findings. Only invoke `checkpoint-reviewer` to present the Phase 3 checkpoint once no blocking findings remain — the user should be able to hit endpoints and inspect seed/migrated data before it's treated as real. Do not proceed to `/phase4-integration` until approved.

