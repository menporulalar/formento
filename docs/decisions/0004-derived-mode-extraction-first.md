# 0004 — Derived-mode extraction moves to the top of the build order

**Status:** Decided (2026-08-22)

## Decision

The first real project built through the pipeline will use **derived mode** — pointing Formento at an existing codebase, extracting a baseline Spec IR via Phase 0a, then treating it as a **fresh-rebuild** (old system as reference only, no migration). Accordingly, Phase 0a extraction + its gap report move up in the build order, ahead of the conversational/templated entry modes and ahead of "the next milestone" generically.

**Scope stays narrow, per the follow-up clarification:** this reprioritization is extraction-only. It does **not** reopen the migration path — delta-spec generation, breaking-change resolution, and migration-aware Phase 3/4 stay exactly where decision 0003 left them: deferred, pending the rename-vs-add+orphan diffing algorithm discussion. Extraction feeding a fresh-rebuild never touches `DeltaSpec`.

## Why

The user's actual first hands-on build in Claude Code is against an existing project, not a from-scratch template pick — so the pipeline needs Phase 0a working before conversational/templated entry is strictly necessary. Building extraction first also means the fresh-rebuild path (Milestones 0–3) gets exercised end-to-end against a real, messy codebase rather than only against clean seeded templates — a better test of whether the Spec IR and later phases actually hold up.

## Effect on build-plan.md

- Phase 0a extraction + gap report (previously M4.1–M4.3) move into the milestone immediately after M0, ahead of conversational/templated interview work.
- Conversational/templated entry (previously M1.1–M1.3) is deprioritized, not cancelled — it becomes a later milestone once the derived-mode-first project has gone through the full pipeline.
- Phase 0b, delta-spec generation, and migration-aware Phase 3/4 (previously M4.4–M4.8) remain deferred exactly as decision 0003 specified — renumbered but otherwise unchanged in scope or entry gate.
- See the renumbered `build-plan.md` for the concrete milestone list.
