---
name: phase3-backend
description: This skill should be used when the user asks to "run Phase 3", "provision the backend", "generate migrations and API routes", or invokes "/phase3-backend" for Backend & Data Provisioning.
argument-hint: ""
allowed-tools: Task
---

Invoke the `backend-provisioner` subagent with the approved Phase 1 spec (and Phase 2 UI for field-level wiring hints) to generate database migrations, API routes, and auth/roles in a sandbox/local env. Stack is determined per-project from the Spec IR's `techStackPreference` (Next.js + Prisma by default, or a plain PHP + MySQL profile when the project's confirmed stack calls for it) — see `backend-provisioner`'s own instructions for the full split, do not assume Prisma unconditionally.

When ready, invoke `review-coordinator` to run `backend-reviewer` (correctness + security pass, stack-aware) and aggregate findings. Only invoke `checkpoint-reviewer` to present the Phase 3 checkpoint once no blocking findings remain — the user should be able to hit endpoints and inspect seed/migrated data before it's treated as real. Do not proceed to the `phase4-integration` skill until approved.
