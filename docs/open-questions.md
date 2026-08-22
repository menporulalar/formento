# Open Questions

Pulled from `spec.md` §10. Resolved 2026-08-21 — see decisions below.

## Resolved

1. **Checkpoint UI shape** — ✅ Chat-first for v1. Visual kanban phase-tracker deferred.
2. **Target user** — ✅ Solo devs. The conversational agent doesn't need to shield users from technical spec language for v1 — solo devs can engage with schema/field-level terminology directly. Revisit shielding/simplification once (if) the target expands to non-technical form owners.
3. **Extraction-only as a standalone hook** — ✅ Not built as a separate standalone/free-tier hook for v1. Simplicity call: a standalone hook is a second surface (its own entry point, its own UX, its own support burden) for a capability that already exists inside the main pipeline as Phase 0a. Ship extraction bundled into the full flow first; spin it out as a separate hook later only if usage data shows people want an audit-only path without committing to a build.
4. **Which 2–3 UI framework adapters to build first for v1** — ✅ shadcn/ui + Tailwind. (Narrower than the spec's original shadcn/ui + Bootstrap shortlist — Bootstrap adapter deferred; add once the adapter pattern is proven and there's demand.)

## Deferred

- **Naming** — Formento stays as-is for now. Formal trademark/domain check (IP India / USPTO TESS, domain & handle availability) deferred until the product is further along and has a few adoptions. Backup names if needed later: Formundo, Intakion.
