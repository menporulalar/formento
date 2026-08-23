# 0007 — Milestone 1 source project confirmed; extraction generalized beyond Prisma+zod

**Status:** Decided (2026-08-22)

## Decision

The Milestone 1 derived-mode extraction source is confirmed: `/Users/janakiraman/Documents/Product/Nanda-Projects/Practical_Database` (see `docs/milestone-1-source.md` for full detail) — a procedural PHP + raw MySQL admin tool for college practical-exam invigilation/remuneration tracking, no ORM, no framework, no validation library.

`PRD.md` (M1.1) and the original `extraction-agent`/`extraction-reviewer` briefs assumed "Prisma + zod" as the first, most-tractable extraction case. That assumption doesn't hold for the actual first project. `extraction-agent.md` and `extraction-reviewer.md` are generalized to cover:
- **Schema source**: a raw `.sql` dump (`CREATE TABLE`/`INSERT` statements) instead of a Prisma schema file — parse `CREATE TABLE` column definitions and types directly.
- **Field/validation source**: procedural PHP files (form markup, `$_POST`/`$_GET` handling, any inline validation) instead of zod schemas — infer fields from HTML form inputs and any explicit PHP-side checks, falling back to the SQL column definition when no PHP-side validation exists.
- **No declared foreign keys**: relationships must be inferred from naming/usage patterns (a `CollegeName` string column that matches values in a `college_names` lookup table implies a relationship the SQL itself doesn't declare) and flagged in the gap report as "implied but unenforced," not asserted as if they were real `Relationship` entries without user confirmation.
- **No existing workflow/status concept**: Phase 1 will likely need to introduce a workflow rather than extract one — this is a Phase 0a/1 checkpoint decision, not something extraction can source from the code.
- **Canonical-version detection**: multiple backup/duplicate folders and numbered file variants exist in this repo; extraction must identify the live/canonical files (by directory location and recency) rather than extracting duplicate or stale entities from backup copies.

## Why

Waiting for a clean Prisma+zod codebase to validate extraction first would have meant building against an unrealistically easy case. The actual first project is exactly the kind of messy, ORM-less, backup-cluttered codebase Formento is meant to handle (spec.md's whole problem statement) — a better, if harder, first real test. Generalizing the extraction agents now, rather than hard-coding a Prisma+zod assumption, also means the next derived-mode project (whatever stack it uses) is more likely to be handled without another special-case rewrite.

## Effect on existing docs/tooling

- `docs/milestone-1-source.md` (new) — full record of the source project's schema, gaps, and PII considerations, for `extraction-agent`/`extraction-reviewer` to work from and for the Phase 0a checkpoint to reference.
- `.claude/agents/extraction-agent.md` and `.claude/agents/extraction-reviewer.md` — generalized to cover raw-SQL + procedural-PHP extraction alongside the original Prisma+zod case, not replacing it (a future derived-mode project might well be Prisma-based).
- `docs/build-plan.md` M1.1 — wording updated to reflect the actual first case.
- `docs/PRD.md` R4 acceptance criteria — the Prisma+zod example stays as an illustration of the *pattern* (cite source file/line, map types, flag missing validation), but is no longer implied to be the only supported shape.
