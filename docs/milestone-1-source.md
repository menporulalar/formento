# Milestone 1 source project: Practical Database

**Path (user's machine):** `/Users/janakiraman/Documents/Product/Nanda-Projects/Practical_Database`
**Confirmed 2026-08-22** as the actual first project Formento will extract from and rebuild (fresh-rebuild path, per docs/decisions/0004).

## What it is

A PHP admin tool for tracking college practical-exam invigilation/remuneration for an institution (NASC, based on the logos/branding present) — recording who examined which practical exam at which affiliated college, computing remuneration due, and maintaining lookup lists of colleges, staff, and designations.

## Stack (as found — this is the important part)

**Not** a Prisma/ORM/zod codebase. It's classic procedural PHP + raw MySQL:
- Plain `.php` files per page/action (`index.php`, `create.php`, `edit.php`, `delete.php`, `import.php` per resource folder), no framework, no router.
- `mysqli_connect` direct connection (`database.php`) — no ORM, no query builder.
- A single `.sql` dump (`s_students (2).sql`) is the closest thing to a schema definition — MySQL `CREATE TABLE` + `INSERT` statements, MyISAM engine, no declared foreign keys (only primary keys).
- Frontend: Bootstrap 4 + jQuery, no build step, vendored CSS/JS committed directly.

**This means the extraction-agent's original brief (parse Prisma models + zod validators) doesn't apply here.** It needs to parse a raw SQL dump for schema and PHP files (form fields, inline validation, query logic) for the rest — see "Effect on tooling" below.

## Schema as extracted from the dump (`s_students` database)

| Table | Columns | Notes |
|---|---|---|
| `college_names` | `cid` (PK), `CollegeName`, `Place`, `Distance` | Lookup table, ~100 rows of real data |
| `departments` | `id` (PK), `Department`, `Degree` (UG/PG) | Lookup table |
| `staff_desig` | `sno` (PK), `Designation` | Lookup table (Assistant Professor, Professor, etc.) |
| `staff_details` | `SNo` (PK), `StaffName`, `Dept`, `StaffDOB`, `Gender`, `StaffCode`, `SPhone` | Staff roster |
| `remuneration` | `Rid` (PK), `Particular`, `Price`, `skillamt` | Rate card lookup (UG/PG lab hours, viva, etc.) |
| `practical` | `sno` (PK) + 32 more columns | The core transactional entity — one row per practical exam session |

## Gaps a real extraction will need to flag (spotted already, worth the extraction-agent/reviewer confirming these independently)

- **No declared foreign keys anywhere**, despite an obvious relational structure: `practical.CollegeName`, `practical.Desi` (designation), `practical.StaffCode`/`StaffName`, `practical.SStaffCode`/`SkillStaffName`, `practical.LStaffCode`/`LabInchargeName` are all denormalized strings that *should* reference `college_names`, `staff_desig`, and `staff_details` respectively, but don't. Some are even redundant pairs (a code column + a name column for what should be one FK). This is exactly the "duplicate-looking fields" and "orphaned relationship" case the gap report (PRD R4) is meant to catch.
- **No workflow/status column** on `practical` at all — there's no state machine in the source (no "draft/submitted/approved" concept), so Phase 1's workflow design will likely need to be an intentional addition on top of the extracted baseline, not something extraction can find in the source. Worth deciding explicitly at the Phase 0a/1 checkpoint whether Formento should propose a workflow (e.g. Draft → Submitted → Approved for a remuneration claim) rather than rebuild with none.
- **`practical.Dept` sometimes holds a numeric string** (`'1'`, `'2'`) instead of a department name in the sample data — a data-quality issue in the source, not a schema issue, but worth the gap report noting it (it suggests `Dept` was meant to be a proper FK to `departments.id` and the UI wasn't enforcing it consistently).
- **`Distance` is duplicated** into `practical` from `college_names` at insert time rather than joined — denormalization for read convenience in the old app, another candidate for the gap report.
- **Messy repo hygiene**: three near-duplicate backup folders (`Backu p/`, `Backup_Data/`, `BACKUPS/`) and a fourth working duplicate (`one/`), plus numbered file variants (`index.php`, `index1.php`...`index4.php`, `tableformat.php`...`tableformat-5.php`). Extraction needs to identify the *canonical* live version rather than extracting from (or getting confused by) the backup copies — likely the top-level files, since `index3.php`/`index4.php` have the most recent mtimes. This is a good real test of the extraction-agent's "cite source file/line" discipline (PRD R4 acceptance criteria) and the extraction-reviewer's job of catching hallucinated/duplicate entities.
- **Real staff phone numbers and dates of birth are present in the sample data** (`staff_details`) — genuine PII. Extraction should flag these as candidates for the Spec IR's `piiSensitive` field flag, and no real PII should ever be copied into seed data for the rebuilt project (synthetic replacements only, per `backend-reviewer`'s existing check).

## Effect on tooling (decisions needed / made)

See `docs/decisions/0007-milestone-1-source-confirmed.md` for the formal record. Summary: `extraction-agent.md` and `extraction-reviewer.md` are being generalized from a Prisma+zod-first brief to also cover the "raw SQL dump + procedural PHP" case, since that's what Milestone 1 actually needs on day one.
