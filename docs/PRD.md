# Formento — Product Requirements Document (v1)

**Status:** Finalized for initial development (2026-08-22) — supersedes the narrative framing in `spec.md` with concrete, buildable requirements. `spec.md` remains the vision/rationale document; this PRD is what Claude Code should build against, alongside `spec-ir-schema.md` and `build-plan.md`. **Initial development scope is fresh-rebuild only** (see docs/decisions/0003) — the migration path is confirmed, deliberately deferred, and out of scope until Milestone 4 gets its own dedicated discussion.
**Author:** Thiru (Janakiraman Veerappan)
**Date:** August 22, 2026

---

## Problem Statement

Form-heavy applications — intake systems, admin panels, approval workflows, registration flows, case management tools — share massive structural overlap (entities, fields, validation, workflow states, roles), but teams rebuild this same schema-to-UI-to-API pattern from scratch on nearly every project. Redesigning an *existing* form-heavy system is worse: there's no fast way to understand what already exists before changing it, so teams either avoid needed rebuilds or take on high-risk, poorly-scoped migrations. Solo developers feel this most acutely — they don't have a platform team to build internal tooling for them, and every hour spent re-deriving a schema/CRUD/auth layer is an hour not spent on what makes their project unique.

## Goals

1. **Time to deployed app**: A solo dev takes a templated or conversational project from intent capture to a deployed, working URL in under a few hours for a moderately complex form system (spec.md §9 target, carried forward as the primary success metric).
2. **Checkpoint trust**: Every phase boundary is a genuine decision point — the user should be able to reject or modify any phase's output without the pipeline having already committed to something irreversible downstream.
3. **Migration safety**: For derived-mode migration projects, zero silently-applied breaking changes reach generated code — every breaking change in the delta spec is either explicitly accepted or rejected by the user before Phase 1 can be marked approved.
4. **Extraction accuracy**: Codebase extraction (Phase 0a) reconstructs a baseline spec accurate enough that a manual audit finds no missed entities and no more than a small, bounded rate of field/type errors (see Success Metrics for the target).
5. **Adapter isolation**: Adding a second UI framework adapter post-v1 requires touching only the adapter layer, not the Spec IR, the compiler core, or the other phases — validated by the fact that v1 ships with exactly one adapter (shadcn/ui + Tailwind) built behind that isolation boundary from day one.

## Non-Goals (v1)

1. **PDF/spreadsheet/screenshot extraction** — derived mode is codebase-extraction-only in v1 (highest fidelity, most tractable per spec.md §8). Revisit once codebase extraction is proven.
2. **Multiple output stacks** — no Rails/Django compiler targets. The backend stack (Next.js/Postgres/Prisma/Docker) is fixed for v1; only the UI framework layer is pluggable.
3. **Multiple UI adapters at launch** — shadcn/ui + Tailwind only (docs/decisions/0002). Bootstrap and Material UI are deferred until the adapter pattern is proven with real usage.
4. **Multi-tenant / team collaboration on a single spec** — v1 targets solo devs working on one project at a time; no concurrent-edit conflict resolution, no shared-workspace permissions model for the Formento tool itself (distinct from the roles/permissions *generated* into the output app, which are in scope).
5. **Non-technical checkpoint UX** — since v1's target user is a solo dev, the checkpoint UI doesn't need to hide schema/field-level terminology behind a simplified abstraction. A visual kanban phase-tracker is also out of scope; chat + inline-diff is the whole v1 checkpoint UX (docs/decisions/0002).
6. **Standalone extraction-only product surface** — Phase 0a extraction stays bundled inside the main pipeline; it is not exposed as an independent free-tier entry point in v1 (docs/decisions/0002).

## User Stories

Ordered by priority. Persona: solo developer building or rebuilding an internal form-heavy tool.

**Entry & spec generation**
- As a solo dev, I want to answer a structured set of interview questions about my entities, fields, and workflow so that I get a usable baseline spec without having to write one by hand.
- As a solo dev, I want to start from a template (e.g. vendor/RFP intake) and only be asked about what's different from the template so that I don't repeat obvious setup.
- As a solo dev, I want to point Formento at my existing repo and get a baseline spec extracted so that I can rebuild or audit a system I didn't originally design cleanly.
- As a solo dev auditing an existing system, I want a gap/quality report (missing validation, duplicate-looking fields, workflows with no exit path) so that extraction has value even if I never proceed to a rebuild.

**Migration decision**
- As a solo dev evolving an existing system, I want to explicitly choose migration vs. fresh-rebuild so that Formento never assumes which one I want.
- As a solo dev on the migration path, I want every breaking change (removed field, retyped field, ambiguous rename, workflow-state removal with in-flight records) surfaced individually so that nothing destructive to my real data slips through unnoticed.
- As a solo dev on the migration path, I want to resolve an ambiguous rename (instead of it silently becoming an orphaned field + an unrelated new field) so that my intent is captured correctly.

**Schema, UI, backend, integration**
- As a solo dev, I want to review and edit the generated entity/field/workflow spec (with an ER diagram) before anything is built so that mistakes get caught before they become code.
- As a solo dev, I want the generated forms and views built on shadcn/ui + Tailwind so that they match a stack I'm comfortable maintaining.
- As a solo dev, I want to hit the generated API endpoints and inspect seed data in a sandbox before it's treated as real so that I can catch backend issues early.
- As a solo dev, I want to submit one real end-to-end test entry through the fully wired app before final approval so that I know the whole system actually works, not just its parts in isolation.

**Deploy & handoff**
- As a solo dev, I want a working Docker/VPS deployment with documented env config so that going from "approved" to "live" doesn't require me to reverse-engineer my own generated project.
- As a solo dev, I want generated docs describing how to run migrations, reset seed data, and roll back a deploy so that I can maintain the app after Formento's job is done.

**Cross-cutting / error states**
- As a solo dev, I want to be told clearly when I've asked for something out of v1 scope (e.g. PDF extraction, a second UI framework) rather than have Formento silently degrade or guess so that I'm not surprised later.
- As a solo dev, I want to resume a project from wherever I left off (last approved checkpoint) so that a session ending mid-pipeline doesn't lose my progress.

## Requirements

### P0 — Must-Have

**R1. Canonical Spec IR** — implement the schema in `spec-ir-schema.md` exactly, including `ProjectMeta`, `Entity`/`Field`/`Relationship`, `Role`/`Permission`, `Workflow`/`WorkflowState`/`WorkflowTransition`, and `DeltaSpec` for migration projects.
- *Acceptance:* A Spec IR document produced by any entry mode (conversational, templated, derived) validates against the schema; all three entry modes emit no fields outside the defined `FieldType` union.

**R2. Checkpoint gate enforcement** — no phase's output can be marked `approved` while unresolved blocking conditions exist.
- *Acceptance (Given/When/Then):*
  - Given a Phase 1 delta spec with at least one `DeltaChange` where `breaking: true` and `resolution` is absent, when the user attempts to approve the Phase 1 checkpoint, then the approval is rejected and the specific unresolved change(s) are listed.
  - Given all breaking changes have a `resolution`, when the user approves, then the checkpoint's status becomes `approved` and Phase 2 becomes available.

**R3. Phase 0 — conversational & templated entry** — structured interview producing a Project Brief + Spec IR; template library seeded with the 7 archetypes from spec.md §4.2 (job application, patient intake, event registration, expense approval, survey/feedback, onboarding checklist, vendor/RFP intake).
- *Acceptance:* Each template ships with a pre-filled Spec IR (entities/fields/workflow) that the interview only asks deltas against; a from-scratch conversational session produces a complete Spec IR with no field lacking a `type` and `validations` (empty array is acceptable only if explicit).

**R4. Phase 0a — codebase extraction** — parse an existing repo's ORM models, form components, and API validation schemas into a baseline Spec IR + gap report.
- *Acceptance:* Given a repo using Prisma models + zod validation, extraction produces a Spec IR entity per Prisma model, a `Field` per column with best-effort `FieldType` mapping, and a gap report entry for any field with no corresponding validation; every extracted field/entity cites the source file it came from.

**R5. Phase 0b — migration/fresh-rebuild choice + delta spec generation** — explicit user choice, no default; migration path generates a `DeltaSpec` against the confirmed baseline.
- *Acceptance:* The choice is persisted in `ProjectMeta.mode`; attempting to proceed to Phase 1 without an explicit choice blocks with a clear prompt (never silently defaults to fresh-rebuild).

**R6. Phase 1 — schema/workflow design + ER diagram** — produces the finalized `Entity`/`Role`/`Workflow` spec and a Mermaid ER diagram; for migration projects, produces the full `DeltaChange` list.
- *Acceptance:* Every `Workflow` has at least one `isTerminal: true` state reachable from every other state (no dead-end workflows ship past this checkpoint); the ER diagram renders all entities and relationships with correct cardinality.

**R7. Phase 2 — UI scaffold on shadcn/ui + Tailwind** — wireframe-level form layouts (multi-step where the workflow implies it) and list/detail/admin views, generated via an isolated adapter layer.
- *Acceptance:* Regenerating the UI for a Spec IR with an added field requires no changes outside the adapter module; admin vs. end-user views respect `Role.permissions`.

**R8. Phase 3 — backend & data provisioning** — Prisma schema + migrations matching the Spec IR exactly; API routes with CRUD + workflow-transition endpoints enforcing `Role.permissions`; seed data (fresh) or migration scripts driven by resolved `DeltaChange` (migration).
- *Acceptance:* Every `Entity` has a corresponding Prisma model with matching fields/types/relations; every `WorkflowTransition` has an API endpoint that checks `allowedRoles` before applying; the environment is resettable (a documented command restores it to initial seed/migrated state).

**R9. Phase 4 — integration & wiring** — connects Phase 2 forms to Phase 3 APIs; front-end and back-end validation both derive from the same `ValidationRule[]` per field (no independent re-implementation); notification hooks fire on `WorkflowTransition` where `notifyOnTransition` is set.
- *Acceptance:* A single real test submission flows end-to-end (form submit → API → DB → workflow-state update → notification, if configured) and is verifiable by the user before the Phase 4 checkpoint is approved.

**R10. Phase 5 — deploy & handoff** — Docker Compose deployment consistent with `/opt/`-style self-hosted conventions; `.env.example` documenting every required variable; generated docs for migrations/seed-reset/rollback.
- *Acceptance:* The deployed app is reachable at a URL the user confirms works, and this confirmation is the literal gate for marking the project complete.

**R11. Framework-neutral Spec IR discipline** — no phase before Phase 2 references shadcn/Bootstrap/MUI-specific concepts anywhere in the Spec IR or Phase 0/1 artifacts.
- *Acceptance:* Grep-level check: no UI-framework-specific identifiers appear in `Entity`/`Field`/`Workflow` structures.

### P1 — Nice-to-Have (fast-follow candidates)

- **R12.** Resume-from-last-checkpoint: reopening a project picks up exactly at the first `pending` or unapproved checkpoint, without re-running already-approved phases.
- **R13.** `piiSensitive` field flag actually changes Phase 3 behavior (e.g. field-level encryption at rest, audit log entry on read/write) rather than being purely documentary in v1.
- **R14.** A second UI adapter (Bootstrap) proving the adapter isolation boundary holds in practice, not just by inspection.
- **R15.** Coexistence/cutover strategy generation (Phase 4) for migration projects where the old system stays live — dual-write window, read-path switchover, rollback plan as a generated document, not yet automated tooling.

### P2 — Future Considerations (explicitly deferred, design-for-later only)

- **R16.** PDF/spreadsheet/screenshot extraction sources (Phase 0a) — the extraction agent's output contract (baseline Spec IR + gap report + source citations) should not need to change shape when these sources are added; only the input parsing does.
- **R17.** Additional compiler output stacks (Rails, Django) — keeping the Spec IR fully framework/stack-neutral through Phase 1 (R11) is the design decision that makes this possible later; no work toward it in v1.
- **R18.** Conditional/branching field visibility beyond what workflow states imply — do not add a `visibleWhen` expression field to the schema until a real template needs it (see spec-ir-schema.md's "deliberately not covered" section).
- **R19.** Multi-tenant collaboration on a single Formento project.
- **R20.** AI-assisted fields (resume parsing, document classification) and the associated Qdrant/pgvector activation — schema hook only (`Field.description`), no implementation.

## Success Metrics

**Leading indicators**
- Time from Phase 0 checkpoint approval to Phase 5 deployed URL, for a templated-entry project of moderate complexity (5-8 entities). Target: under 4 hours of active session time. Measurement: timestamp diff between `Checkpoint(phase=0).decidedAt` and `Checkpoint(phase=5).decidedAt`.
- % of checkpoints where the user modifies vs. straight-approves, per phase. Target: no single phase above 60% modify-rate after the first 5 projects (a consistently high modify-rate at one phase signals that phase's generation quality needs work, per spec.md §9).
- Extraction field/type accuracy vs. manual audit, for Phase 0a. Target: ≥90% precision and ≥85% recall on fields and types; measured against a manually-audited baseline on at least 3 real repos, starting with the confirmed Milestone 1 source (raw SQL + procedural PHP, see `docs/milestone-1-source.md` / `docs/decisions/0007`) — extraction is generalized beyond any single ORM/validation-library assumption, not scoped to Prisma+zod only.

**Lagging indicators**
- Number of solo-dev projects that reach a deployed Phase 5 URL vs. number that start Phase 0 (funnel completion rate). No hard target yet — establish a baseline after the first 10 projects.
- Rate of post-deploy schema drift (manual edits to generated Prisma schema that diverge from the Spec IR) — a proxy for whether the generated backend was actually usable as-is or needed hand-patching.

## Open Questions

- **[Engineering]** What's the concrete diffing algorithm for detecting a "rename" vs. "add+orphan" in Phase 0b delta generation (R5/R6) — field name similarity, type+position heuristics, or requiring the extraction agent to flag *candidate* renames for the user to confirm rather than auto-detecting them? This directly affects how reliable the breaking-change list in R6 is. **Blocking for Milestone 4 (migration path) only** — confirmed 2026-08-22 (docs/decisions/0003) that this is deliberately deferred to its own discussion and does not block M0–M3 fresh-rebuild development starting now.
- **[Engineering]** Exact Prisma migration strategy for retype changes with existing data (R8) — safe casts vs. requiring a user-supplied transform function per retyped field. **Blocking for Milestone 4 (migration path) only**, same deferral as above — no bearing on fresh-rebuild Phase 3 implementation, which never encounters a `DeltaChange`.
- **[Product]** Should the "resume from last checkpoint" behavior (R12, P1) actually ship in v1 given how central checkpoint-gating is to the whole pitch, or is it genuinely safe to defer? Worth revisiting once Phase 0-5 core loop is working — non-blocking for now.

## Timeline Considerations

No hard external deadline. Suggested phasing, elaborated in `build-plan.md` (reordered 2026-08-22 per decision 0004 — derived-mode extraction moved ahead of conversational/templated entry, since the first real project is built via derived mode):

- **Milestone 0**: Spec IR + checkpoint data model implemented and unit-tested, independent of any UI. Everything else depends on this being stable.
- **Milestone 1**: Phase 0a codebase extraction + gap report + Phase 0b (fresh-rebuild outcome only) + Phase 1 schema design — the first real project, built by pointing Formento at an existing codebase.
- **Milestone 2**: Phase 0 conversational + templated entry — deprioritized behind derived mode, not cancelled; proves Phase 1 onward is entry-mode-agnostic.
- **Milestone 3**: Phase 2 (shadcn/ui + Tailwind adapter) + Phase 3 (backend) for the fresh-rebuild path — first point at which a real, if unstyled-for-production, app exists, demoed against the Milestone 1 derived-mode project.
- **Milestone 4**: Phase 4 + Phase 5 — first fully deployed v1 app. This is the first point the primary success metric (time-to-deployed-URL) can be measured, and it's measured against the derived-mode project.
- **Milestone 5**: The migration fork (Phase 0b's migration branch, delta specs, migration-aware Phase 3/4) — deferred, not yet scheduled, pending a dedicated discussion on the rename-vs-add+orphan diffing algorithm (see Open Questions above and decision 0003).

Full breakdown with epics and build order in `build-plan.md`.
