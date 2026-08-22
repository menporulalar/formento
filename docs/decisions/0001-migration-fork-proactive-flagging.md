# 0001 — Derived mode: proactive breaking-change flagging

**Status:** Decided (spec v0.1, §5)

## Decision
For the migration path in derived mode, the agent detects every breaking change in the delta spec (field removals, retypes, renames misread as add+orphan, workflow-state removals with in-flight records, etc.) and surfaces each one as its own decision point at the Phase 1 checkpoint. Nothing breaking passes through silently, even under an "additive-first" bias.

## Why
Silent additive-only defaults risk masking intent — e.g., a rename getting treated as an orphaned old field plus an unrelated new one. For a system provisioning real backend/data changes, forcing the user to see and confirm every breaking change is the safer failure mode.

## Affected phases
- Phase 1 (Schema) — schema diff + field-level migration path, every breaking change individually flagged
- Phase 3 (Backend) — real data migration scripts, not just seed data
- Phase 4 (Integration) — coexistence/cutover strategy if the old system stays live during rebuild
