# 0003 — Fresh-rebuild is the default for initial development; migration deferred

**Status:** Decided (2026-08-22)

## Decision

Initial development targets the **fresh-rebuild path only** (build-plan.md Milestones 0–3). The migration path (derived mode's Phase 0a/0b, delta specs, breaking-change resolution, migration-aware Phase 3/4 — Milestone 4) is deferred; work on it doesn't start until the rename-vs-add+orphan diffing algorithm (flagged as a blocking open question in PRD.md) is concretely decided in a dedicated future discussion.

## Why

The diffing algorithm is the one piece of the migration fork that can't be responsibly hand-waved — spec.md §5's core safety guarantee (no breaking change silently slips through) depends on correctly detecting what's a rename vs. what's genuinely an orphaned field plus an unrelated new one. Committing to a fresh-rebuild-only v1 scope first means:
- Claude Code has a single, unambiguous default to build against from day one — no code path branches on `ProjectMeta.mode` until Milestone 4.
- The core pipeline (Spec IR, checkpoint gating, Phase 0/1/2/3/4/5) gets proven end-to-end on the simpler case before the highest-complexity, highest-risk part of the spec is added.
- The diffing algorithm decision isn't rushed to unblock unrelated work — it gets its own dedicated discussion when Milestone 4 actually starts.

## Effect on existing docs

- `build-plan.md` already sequenced Milestone 4 (derived mode/migration fork) last — this decision confirms that sequencing is now the committed plan, not just a suggestion.
- `PRD.md`'s Open Question on the rename/orphan diffing algorithm stays open and blocking, but is now explicitly scoped as **blocking for Milestone 4 only** — it does not block M0–M3 development starting now.
- `.claude/commands/phase0b-redesign-intent.md` and the migration-path instructions inside `schema-workflow-designer.md`/`backend-provisioner.md`/`integration-agent.md` remain as documentation of intent for when Milestone 4 starts, but should not be exercised during M0–M3 work.
