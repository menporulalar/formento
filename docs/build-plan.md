# Formento — v1 Build Plan

Companion to `PRD.md` and `spec-ir-schema.md`. This is the build order to hand to Claude Code once the PRD is finalized — each milestone should be independently demoable, and later milestones depend on earlier ones being solid, not just started.

**Confirmed 2026-08-22 (docs/decisions/0003):** initial development targets fresh-rebuild only. The full migration path (delta specs, breaking-change resolution, migration-aware Phase 3/4) does not start until the rename-vs-add+orphan diffing algorithm gets its own dedicated discussion — it's intentionally left open in `PRD.md`'s Open Questions, not an oversight.

**Confirmed 2026-08-22 (docs/decisions/0004):** the first real project goes through **derived mode** (extract from an existing codebase) into the fresh-rebuild path, not conversational/templated entry. Phase 0a extraction is pulled forward to the milestone right after the Spec IR core, ahead of conversational/templated interview work. This is still extraction-only — no migration/delta-spec code paths are exercised.

Sequencing principle: prove the fresh-rebuild path end-to-end before adding the migration fork's extra complexity. A working simple case beats a half-working complete case.

**Confirmed 2026-08-22 (docs/decisions/0006):** all implementation work below (Milestone 0 onward) lands in the separate `formento-engine` repo (`~/Documents/Product/Nanda-Projects/formento-engine`, sibling to this `formento` docs repo), not in this repo. This repo stays docs/tooling only. Each generated project (the Milestone 1 derived-mode project included) gets its own separate folder/repo too — never nested in either.

---

## Milestone 0 — Spec IR & Checkpoint Core

**Goal:** The data layer everything else depends on. No UI, no agents yet — just the schema, validation, and persistence.

**Epics:**
- **M0.1 — Spec IR types & validation**: implement the TypeScript types from `spec-ir-schema.md` (`ProjectMeta`, `Entity`, `Field`, `Relationship`, `Role`, `Workflow`, `DeltaSpec`); JSON Schema or zod validators for each; unit tests covering every `FieldType` and `ValidationRule` combination.
- **M0.2 — Checkpoint state machine**: `Checkpoint`/`OpenDecision` types; the approval-gate logic from PRD R2 (block approval while `breaking && !resolution` changes exist); unit tests for the gate specifically, including the "all resolved → approval succeeds" and "one unresolved → approval blocked with correct list" cases.
- **M0.3 — Project persistence**: read/write a project's Spec IR + checkpoint history to disk (`spec-ir.json` + a checkpoints log) in a project directory structure Claude Code and the pipeline agents both operate on.

**Exit criteria:** A hand-written Spec IR JSON file round-trips through validation; a scripted test can construct a `DeltaSpec` with a breaking unresolved change and confirm the checkpoint gate rejects approval, then resolve it and confirm approval succeeds. (This test exercises the gate logic only — it's the one place `DeltaSpec` is touched before Milestone 5.)

---

## Milestone 1 — Derived Mode: Extraction → Fresh-Rebuild (first real project)

**Goal:** Point Formento at an existing codebase, extract a baseline Spec IR + gap report, confirm it at a checkpoint, then treat it as a fresh-rebuild project through schema design. This is the actual first hands-on build in Claude Code — prioritized ahead of conversational/templated entry per decision 0004.

**Epics:**
- **M1.1 — Codebase extraction (confirmed source: raw SQL + procedural PHP, docs/decisions/0007)**: `extraction-agent` parsing the confirmed Milestone 1 source (`docs/milestone-1-source.md` — a `.sql` dump + procedural PHP admin tool, no ORM) into a baseline Spec IR (PRD R4); every extracted entity/field cites its source file/line. Extraction logic is generalized to also cover the originally-assumed Prisma+zod case, not replaced by this one.
- **M1.2 — Gap/quality report**: missing validation, likely-duplicate fields, workflows with no reachable terminal state, orphaned relationships, ambiguous naming — standalone value even if the project stops here (spec.md §5).
- **M1.3 — Phase 0a checkpoint**: `checkpoint-reviewer` presents the baseline Spec IR + gap report for confirm/modify; the project can legitimately stop here as an audit-only run.
- **M1.4 — Phase 0b: fresh-rebuild confirmation (no migration branch built yet)**: capture the explicit choice, but for this milestone only the fresh-rebuild outcome is implemented — `ProjectMeta.mode` is set to `"fresh"`, and the baseline Spec IR becomes the starting point for a new standalone spec rather than a `DeltaSpec` diff. If a user picks "migration" here, surface that it isn't built yet rather than silently proceeding.
- **M1.5 — Phase 1 schema/workflow design (fresh path)**: `schema-workflow-designer` agent refines the extracted baseline into the finalized Spec IR + Mermaid ER diagram; enforce the "every workflow has a reachable terminal state" constraint (PRD R6).

**Exit criteria:** Pointing Formento at the confirmed Practical_Database repo produces an accurate, cited baseline Spec IR + gap report (target accuracy per PRD Success Metrics: ≥90% precision / ≥85% recall on fields and types) that correctly flags the known gaps in `docs/milestone-1-source.md` (unenforced relationships, denormalized fields, no existing workflow, PII fields, canonical-vs-backup file confusion); the user can confirm it, choose fresh-rebuild, and reach an approved Phase 1 checkpoint with a workflow-complete Spec IR (including a newly-designed workflow, since the source has none) and rendered ER diagram — with zero `DeltaSpec` code paths touched.

---

## Milestone 2 — Conversational & Templated Entry (deprioritized, not cancelled)

**Goal:** Add the other two entry modes now that the pipeline has been proven against a real extracted project in Milestone 1. Deferred behind Milestone 1 per decision 0004, not dropped from scope — PRD R3 is still a P0 requirement.

**Epics:**
- **M2.1 — Template library**: seed Spec IR templates for the 7 archetypes (PRD R3): job application, patient intake, event registration, expense approval, survey/feedback, onboarding checklist, vendor/RFP intake.
- **M2.2 — Conversational interview**: `spec-interviewer` agent's interview logic — entity → field → role → workflow ordering, one topic at a time, template-delta mode vs. from-scratch mode.
- **M2.3 — Phase 0 checkpoint for these entry modes**: reuses M0.2's state machine and M1.3's checkpoint-reviewer pattern.

**Exit criteria:** Starting from the vendor/RFP intake template, or from scratch conversationally, a user can reach an approved Phase 1 checkpoint the same way the Milestone 1 derived-mode project did — proving Phase 1 onward is genuinely entry-mode-agnostic, not accidentally coupled to derived mode's shape.

---

## Milestone 3 — Phase 2 + Phase 3 (fresh-rebuild, any entry mode)

**Goal:** A real, running (if rough) app: UI scaffold wired to a real backend, in a sandbox environment. Built and demoed first against the Milestone 1 derived-mode project.

**Epics:**
- **M3.1 — shadcn/ui + Tailwind adapter**: the isolated adapter module (PRD R7) translating Spec IR entities/fields/workflow into form components, list/detail views, and admin views; multi-step form logic derived from `Workflow` states.
- **M3.2 — Phase 2 checkpoint**: visual review (layout/reorder/approve).
- **M3.3 — Prisma schema + migrations**: Spec IR → Prisma schema generation (`backend-provisioner`); migrations from a clean DB.
- **M3.4 — API routes + auth/roles**: CRUD + workflow-transition endpoints per entity, enforcing `Role.permissions` (PRD R8); auth wired to the role model.
- **M3.5 — Seed data**: generate seed data for a fresh-rebuild project from the Spec IR (not migration data — that's Milestone 5).
- **M3.6 — Phase 3 checkpoint**: user can hit endpoints and inspect seed data in a resettable sandbox before it's "real."

**Exit criteria:** For the Milestone 1 derived-mode project, there's a running local instance with real Postgres-backed CRUD, working auth/roles, and a UI that renders the actual generated forms — reachable via `localhost`, resettable to seed state.

---

## Milestone 4 — Phase 4 + Phase 5 — first deployed v1

**Goal:** First full loop: existing codebase → extracted baseline → deployed URL. This is where the primary success metric (PRD, Success Metrics: time-to-deployed-URL) becomes measurable for the first time — and, notably, measured against a derived-mode project rather than a template.

**Epics:**
- **M4.1 — Frontend/backend wiring**: connect Phase 2 forms to Phase 3 APIs; client- and server-side validation both derive from the same `ValidationRule[]` (PRD R9) — a shared validation-generation step, not two hand-maintained copies.
- **M4.2 — Notification hooks**: fire on `WorkflowTransition` where `notifyOnTransition` is set; minimal email notification integration is enough for v1.
- **M4.3 — Phase 4 checkpoint**: the functional walkthrough — one real test submission verified end-to-end before approval (PRD R9 acceptance criteria).
- **M4.4 — Docker/VPS deploy**: Docker Compose consistent with `/opt/`-style conventions; `.env.example`; `deploy-agent` produces the actual compose file + env docs.
- **M4.5 — Handoff docs**: migration/reset/rollback docs generated per project (PRD R10).
- **M4.6 — Phase 5 checkpoint**: gated on the deployed URL actually being reachable and user-confirmed.

**Exit criteria:** The Milestone 1 derived-mode project reaches a live, reachable deployed URL, timed end-to-end from the original extraction — this timing is the first real data point for the "time to deployed URL" success metric, and the first end-to-end proof the whole fresh-rebuild pipeline works on a real (not seeded) codebase.

---

## Milestone 5 — Migration Fork (deferred, not yet scheduled)

**Status: deferred, pending a dedicated discussion.** Not part of initial development (docs/decisions/0003). Do not start M5.1–M5.5 until the rename-vs-add+orphan diffing algorithm (PRD.md Open Questions) has been concretely decided — that discussion is the actual entry gate for this milestone, not a target date.

**Goal (when it starts):** Add the full migration path — Phase 0b's migration branch, delta-spec generation, breaking-change resolution, and migration-aware Phase 3/4 — now that both the derived-mode-extraction path (Milestone 1) and the full fresh-rebuild pipeline (Milestones 3–4) are proven.

**Epics:**
- **M5.1 — Phase 0b migration branch**: implement the "migration" outcome left as a stub in M1.4; persists `ProjectMeta.mode = "migration"`.
- **M5.2 — Delta spec generation**: diffing algorithm resolving the Open Question in PRD ("rename vs. add+orphan" detection) — recommend starting with the conservative option (flag candidate renames for user confirmation rather than auto-detecting) given the "never silently pass a breaking change" constraint is non-negotiable.
- **M5.3 — Breaking-change resolution UI**: surfaces each `DeltaChange` individually at the Phase 1 checkpoint; blocked by M0.2's gate logic, which should need no changes here if M0 was built correctly.
- **M5.4 — Migration-aware Phase 3**: real data migration scripts from resolved `DeltaChange` entries (PRD R8), resolving the second Open Question (retype strategy: safe casts vs. user-supplied transforms — recommend requiring an explicit transform function for any retype touching existing data, erring toward safety over convenience).
- **M5.5 — Coexistence/cutover strategy doc (P1, R15)**: only if Milestone 5's core (M5.1–M5.4) lands with room to spare — an explicit fast-follow, not a blocker.

**Exit criteria:** Choosing migration mode at Phase 0b produces a delta spec where every breaking change requires individual resolution before Phase 1 approves; the resulting migration scripts run against a copy of real data without data loss for accepted changes.

---

## Deliberately not milestoned (P1/P2 from the PRD)

- Resume-from-last-checkpoint (R12) — retrofit once the core loop (M0–M4) is stable; don't design M0's persistence layer to preclude it, but don't build it early either.
- `piiSensitive` behavioral enforcement (R13) — schema field exists from M0; actual encryption/audit-log behavior is a fast-follow once M3/M4's backend generation is solid.
- Second UI adapter (R14) — only after M3.1's isolation boundary has been live and unchanged through at least one real project.
- All P2 items (R16–R20) — no scheduled milestone; each is a "make sure the schema doesn't have to change shape" design constraint on the milestone that touches the relevant area (called out inline above), not future work to plan around yet.
