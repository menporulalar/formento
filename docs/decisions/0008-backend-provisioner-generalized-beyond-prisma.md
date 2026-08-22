# 0008 — backend-provisioner generalized beyond Next.js/Prisma

**Status:** Decided (2026-08-22)

## Decision

`backend-provisioner.md` and `backend-reviewer.md` are generalized to be stack-aware, reading `project.techStackPreference` from the Phase 1 Spec IR rather than assuming Next.js + PostgreSQL/Prisma + Redis/BullMQ + MinIO unconditionally:

- **No `techStackPreference`, or it names a Node/TS stack:** unchanged — Next.js API routes, Prisma, Redis/BullMQ, MinIO remains the default.
- **`techStackPreference` names PHP + MySQL:** `backend-provisioner` now generates raw SQL migrations, a plain PHP API layer (PDO/mysqli prepared statements, no ORM by default), and session-based auth instead — matching the source project's own conventions rather than forcing an unrelated Node stack onto a project whose user explicitly chose to keep PHP + MySQL. `backend-reviewer` reviews whichever stack was actually used, with stack-specific checks (parameterized SQL for PHP; Redis/BullMQ usage for Node).
- **Any other named stack:** the agent stops and surfaces the gap rather than guessing, same posture as `extraction-agent` (0007).

## Why

Decision 0007 already generalized `extraction-agent`/`extraction-reviewer` beyond an assumed Prisma+zod source, because the actual first Milestone 1 project (`Practical_Database`) turned out to be raw PHP + MySQL with no ORM. That same project's user explicitly confirmed at the Phase 0 checkpoint that they want to **keep** PHP + MySQL for the rebuild (see the project's own `spec-ir-phase1.json`, `project.techStackPreference`), not migrate to Node. `backend-provisioner`'s Phase 3 instructions were never updated to match — they still hardcoded the Next.js/Prisma stack, which would have silently overridden an already-confirmed, explicit user stack decision the moment Phase 3 ran. Caught before Phase 3 execution, at the Phase 3 gate, rather than after generating the wrong backend.

This is the same category of gap as 0007: an assumption baked into an agent's default instructions that didn't hold for the actual first real project, fixed by making the agent read the project's own stated context instead of assuming a fixed stack — while keeping the original default intact for future projects that do use it.

## Effect on existing docs/tooling

- `.claude/agents/backend-provisioner.md` — stack branch added (Node/Prisma default vs. PHP+MySQL target), each with its own Output section; both share the same "resettable sandbox, no production infra" rule.
- `.claude/agents/backend-reviewer.md` — description and verification checklist updated to check whichever stack was actually used, with stack-specific items (parameterized SQL for PHP; Redis/BullMQ for Node) instead of assuming Prisma throughout.
- No change to `docs/PRD.md` or `docs/build-plan.md` — the Prisma/Next.js example in those docs stands as the pattern illustration, same posture 0007 already established for extraction.
