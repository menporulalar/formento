# Formento — Project Specification

**Working name:** Formento *(unique in the software space; a Polish industrial-automation company holds the name in an unrelated industry — see note at end)*
**Author:** Thiru (Janakiraman Veerappan)
**Status:** Draft v0.1 — ideation → spec
**Date:** August 21, 2026

---

## 1. Problem Statement

Form-heavy applications — intake systems, admin panels, approval workflows, registration/onboarding flows, case management tools — share massive structural overlap (entities, fields, validation, workflow states, roles) but get rebuilt from scratch on nearly every project. Teams re-derive the same schema-to-UI-to-API pattern repeatedly, and redesigning an *existing* form-heavy system is even more painful because there's no clean way to understand what already exists before changing it.

Formento is an **agentic provisioning system** that takes minimal input — a template pick, a conversation, or an existing project to reverse-engineer — and produces a **fully running, deployable form-heavy application**, built through a series of **user-gated checkpoints** rather than a single autonomous generation pass.

---

## 2. Vision

> Turn "we need a form-heavy internal tool" into a working, deployed application in hours instead of weeks — without sacrificing the ability to review, correct, and steer every major decision the agent makes along the way.

Formento is not a low-code form builder (Formstack, Jotform, Form.io already own that space) and not a one-shot AI codegen tool. Its differentiator is the **combination of three entry modes converging into one canonical spec, plus a phased, checkpoint-gated build pipeline** that treats the agent as a collaborator, not an autonomous black box.

---

## 3. Core Differentiators

1. **Three entry modes, one pipeline** — conversational, templated, and derived (from an existing project) all normalize into the same internal spec format.
2. **Checkpoint-gated phases** — every phase produces a reviewable artifact; nothing proceeds without explicit approve/modify from the user.
3. **Migration-aware, but only when needed** — derived projects can be extracted for reference only (fresh rebuild) or evolved with full migration tooling (schema diff, data migration, cutover strategy) — the user explicitly chooses which, rather than the system assuming.
4. **Full running output** — not a scaffold, not just a schema. A deployed, working application at the end of the pipeline.

---

## 4. Entry Modes

### 4.1 Conversational
A structured interview agent extracts: entities, actors/roles, field lists, validation rules, and workflow states through natural dialogue. Produces a normalized **Project Brief**.

### 4.2 Templated
A library of common form-heavy archetypes (job application, patient intake, event registration, expense approval, survey/feedback, onboarding checklist, vendor/RFP intake) that the agent customizes based on user input layered on top of the template.

### 4.3 Derived (from an existing project)
Point Formento at an existing artifact — codebase/repo, database schema, or exported form (PDF/spreadsheet/scraped UI) — and the agent reverse-engineers the current spec.

**Extraction sources, roughly by fidelity:**
| Source | Fidelity | Notes |
|---|---|---|
| Existing codebase (repo access) | Highest | Parse models/schemas/forms directly |
| Database schema alone | Medium-high | Introspect tables/columns, infer field semantics |
| Exported artifacts (PDF, spreadsheet, UI screenshots) | Lower | Needs more user confirmation/inference |

All three modes converge into the same **canonical spec** — a structured representation of entities, fields, types, validations, workflow states, and roles — so downstream phases don't need to know or care which entry mode produced it.

---

## 5. Derived Mode — Migration Fork (Key Design Decision)

Extraction and migration are **decoupled**. Running extraction on an existing project does not automatically commit to migration — it's a separate, explicit choice made after the baseline spec is confirmed.

**Phase 0a — Extraction** *(always runs if source = existing project)*
Agent reconstructs baseline spec + an optional **gap/quality report** (e.g., "12 fields have no validation, 3 look like duplicates, workflow has no rejection path"). This has standalone value — someone could run extraction purely to audit their current system without ever proceeding to rebuild.
*Checkpoint: confirm extraction accuracy.*

**Phase 0b — Redesign Intent + Mode Choice**
Once the baseline is confirmed, the user picks one of two paths:

| | **Migration path** | **Fresh rebuild path** |
|---|---|---|
| Intent | Evolve the existing system | Use old system only as reference/inspiration |
| Spec output | Delta spec (diff against baseline) | New standalone spec — baseline is context, not a constraint |
| Old data | Must carry forward | Optional — user decides field-by-field if anything's worth importing |
| Downstream phases | Migration-aware machinery kicks in | Identical to conversational/templated mode — no legacy baggage |

**If Migration is chosen**, ripple effects apply to later phases:
- Phase 1 (Schema) → schema diff + field-level migration path (old→new mapping, type coercions). Every breaking change (removed field, changed type, ambiguous rename, workflow-state removal with in-flight records) is individually flagged and requires explicit user resolution before the phase can be approved — see decision below.
- Phase 3 (Backend) → real data migration scripts, not just seed data
- Phase 4 (Integration) → coexistence/cutover strategy if the old system stays live during rebuild

**Decision: proactive flagging.** The agent detects every breaking change in the delta spec (field removals, retypes, renames misread as add+orphan, workflow-state removals with in-flight records, etc.) and surfaces each one as its own decision point at the Phase 1 checkpoint — nothing breaking passes through silently, even under an "additive-first" bias. This is a deliberate v1 stance: silent additive-only defaults risk masking intent (e.g., a rename getting treated as an orphaned old field plus an unrelated new one), and for a system provisioning real backend/data changes, forcing the user to see and confirm every breaking change is the safer failure mode.

---

## 6. Phased Pipeline

Every phase produces a concrete, reviewable artifact. The user can modify or approve at each checkpoint before the agent proceeds.

| Phase | Name | Output | Checkpoint |
|---|---|---|---|
| 0 | Intent Capture | Project Brief (+ baseline spec & gap report, if derived) | Confirm brief/baseline is accurate |
| 1 | Schema & Workflow Design | Entities, field types/validations, relationships, workflow states, roles/permissions; readable spec doc + ER-style diagram | Edit fields/workflow inline, or approve |
| 2 | UI/UX Scaffold | Form layouts (multi-step, conditional logic), list/detail/admin views, wireframe-level mockups — built on the user's chosen UI framework | Choose UI framework (if not already set), then visual review — swap layout, reorder fields, approve |
| 3 | Backend & Data Provisioning | DB migrations, API routes, auth/roles wired to Phase 1 spec, running in sandbox/local env | Hit endpoints, inspect seed data before it's "real" |
| 4 | Integration & Wiring | Frontend forms connected to backend, end-to-end validation, notification/email hooks | Functional walkthrough — submit a real test entry |
| 5 | Deploy & Handoff | Docker/VPS provisioning, env config, generated docs | Final sign-off, deployed URL |

### 6.1 Phase 2 — UI Framework Selection

The UI/UX Scaffold phase is **framework-agnostic by design**, not locked to a single default. At the start of Phase 2 (or earlier, during Phase 0 intent capture, as a standing preference), the user picks the open-source UI framework the generated forms/views should be built on:

- **shadcn/ui** (Tailwind + Radix-based, composable, matches a modern minimal aesthetic)
- **Bootstrap** (fastest to scaffold, broadest familiarity, safe default for less design-opinionated teams)
- **Material UI** (opinionated, enterprise/admin-panel feel, strong component coverage out of the box)
- Extensible to others (Ant Design, Chakra, Mantine) as adapters are added later

**Design implication:** the Phase 1 → Phase 2 handoff (the schema/field spec) needs to stay **framework-independent** — field types, validation rules, and layout intent are expressed in the canonical Spec IR in framework-neutral terms, then a **per-framework rendering adapter** translates that into actual shadcn/Bootstrap/MUI components at Phase 2 build time. This keeps the compiler's core logic reusable and makes adding a new framework mostly a matter of writing one new adapter rather than touching the pipeline.

---

## 7. Architecture Sketch

**Canonical Spec IR** — a structured JSON/YAML representation sitting at the center of the pipeline. Both the "spec generation" side (conversational agent, template engine, extraction agent) and the "spec → project" compiler side plug into this shared format. This separation is what keeps the system extensible: new templates, new extraction sources, or new output stack targets can each be added independently.

```
[Conversational] ─┐
[Templated]       ├──► Canonical Spec IR ──► Phase 1-5 Compiler Pipeline ──► Deployed App
[Derived/Extract]─┘         (+ delta spec if migration)
```

**Suggested default stack for the compiler's output target** (aligned to your existing architecture instincts):
- Frontend/Backend: Next.js + React, with a **pluggable UI framework adapter layer** (shadcn/ui, Bootstrap, Material UI — user-selected per project, see §6.1)
- Database/ORM: PostgreSQL + Prisma
- Queue/jobs: Redis + BullMQ (for extraction jobs, long-running codegen tasks, migrations)
- Object storage: MinIO (for uploaded reference docs — PDFs, spreadsheets used in derived mode)
- Deployment: Docker, self-hosted VPS pattern consistent with your `/opt/`-style compose setups
- Optional: Qdrant/pgvector only activates if a form has AI-assisted fields (e.g., resume parsing, document classification) — kept out of the default path to avoid unnecessary complexity

**Agent orchestration layer** likely needs:
- A **spec-generation agent** (handles conversational interview + template customization)
- An **extraction agent** (parses codebases/schemas/documents into baseline spec)
- A **compiler/build agent** (executes phases 1–5, generating real code/config against the spec)
- A **checkpoint/review UI** — could be chat-based, dashboard-based, or a visual phase-tracker (kanban-style) — this is a genuinely open UX decision worth prototyping before committing

---

## 8. MVP Scope Recommendation

To avoid boiling the ocean, a v1 should probably narrow on:

**In scope for v1:**
- Templated + conversational entry modes (both, since you confirmed both matter from day one)
- Derived mode limited to **codebase extraction only** (highest fidelity, most tractable) — defer PDF/spreadsheet/screenshot extraction to v2
- Fresh-rebuild path fully supported; migration path fully supported with **proactive breaking-change detection** — every breaking change is flagged and requires explicit resolution at the checkpoint (no silent additive-only fallback, per decision in §5)
- Backend/data stack fixed (Next.js/Postgres/Prisma/Docker); **UI framework selectable** at Phase 2 from a v1 shortlist of 2–3 adapters (recommend starting with shadcn/ui + Bootstrap, adding Material UI once the adapter pattern is proven) rather than building all frameworks simultaneously
- Checkpoint UI: start with a simple chat + inline-diff review (cheapest to build), defer visual kanban tracker

**Explicitly deferred:**
- Multi-target output stacks (e.g., supporting Rails or Django as alternate compiler targets)
- PDF/spreadsheet/screenshot-based extraction
- Complex breaking-change migration tooling
- Multi-tenant/team collaboration on a single spec

---

## 9. Success Metrics (draft)

- Time from "intent captured" to "deployed URL" for a template-driven project (target: under a few hours for a moderately complex form system)
- % of checkpoints where user modifies vs. straight-approves (signals whether the agent's defaults are actually good — high modify-rate at a given phase indicates that phase's generation quality needs work)
- For derived mode: accuracy of extracted baseline spec vs. manual audit (precision/recall on fields, types, relationships)

---

## 10. Open Questions

1. Checkpoint UI shape — chat, dashboard, or visual phase-tracker? (Recommend prototyping chat-first for v1, given lower build cost.)
2. Target user — solo devs, small teams, or eventually non-technical form owners? This affects how much the conversational agent needs to shield users from technical spec language.
3. Should extraction-only (audit/gap-report) be a standalone free-tier hook to drive adoption, independent of the full build pipeline?
4. Which 2–3 UI framework adapters to build first for v1 (see §6.1 recommendation: shadcn/ui + Bootstrap)?

---

## 11. Naming Note

"Formento" was checked against general web presence: no software/SaaS product uses it, but it is an existing legal company name in an unrelated industry (Polish industrial automation — formento.pl), plus a few small unrelated businesses (a restaurant, a real estate agency, a Brazilian securitizadora). No direct competitive or trademark collision found in the software space, but this was a general web check, not a formal trademark registry or domain search. Recommend a formal check (IP India public search and/or USPTO TESS, plus domain/handle availability for formento.com / formento.ai / @formento) before final commitment.

Other candidates from earlier rounds that also came back clean on general web search: **Formundo**, **Intakion**.
