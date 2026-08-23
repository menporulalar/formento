---
description: Run Phase 2 — UI/UX Scaffold (shadcn/ui + Tailwind for v1)
---

Confirm the UI framework is shadcn/ui + Tailwind (Formento's v1 default per docs/decisions/0002-v1-open-questions-resolved.md) unless the user explicitly wants to change it — if so, note that no other adapter is built yet in v1 and confirm they want to proceed anyway or defer.

Invoke the `ui-scaffold-agent` subagent with the approved Phase 1 Spec IR to produce wireframe-level form layouts and list/detail/admin views.

When ready, invoke `review-coordinator` to run `design-reviewer` (design critique + accessibility pass) and aggregate findings. Only invoke `checkpoint-reviewer` to present the Phase 2 visual review checkpoint (layout/reorder/approve) once no blocking findings remain. Do not proceed to `/phase3-backend` until approved.

