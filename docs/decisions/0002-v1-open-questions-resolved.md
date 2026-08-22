# 0002 — v1 open questions resolved

**Status:** Decided (2026-08-21)

## Decisions

**Checkpoint UI shape:** Chat-first for v1, per the spec's own recommendation (lower build cost). Visual kanban phase-tracker deferred.

**Target user:** Solo devs. The conversational agent does not need to shield users from technical spec language (schema/field-level terms) for v1.

**Extraction-only as standalone hook:** Not built separately for v1. Extraction/audit stays bundled into the main pipeline as Phase 0a rather than exposed as its own free-tier entry point. A second standalone surface (own UX, own support burden) isn't justified until usage data shows demand for an audit-only path.

**UI framework adapters for v1:** shadcn/ui + Tailwind only. Narrower than the spec's original shadcn/ui + Bootstrap shortlist (§6.1, §8) — Bootstrap adapter deferred until the adapter pattern is proven and there's demand for it.

**Naming:** Formento stays as-is. Formal trademark/domain check (IP India, USPTO TESS, domain/handle availability) deferred until the product is further along with a few adoptions, not before initial commitment as originally suggested in spec §11.

## Why
Consistent theme across all five: bias toward the narrowest defensible v1 surface area, deferring anything (a second entry point, a second UI adapter, a formal legal check) that isn't blocking early usage. Revisit each once real usage data or adoption exists.
