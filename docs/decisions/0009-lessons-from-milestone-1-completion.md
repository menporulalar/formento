# 0009 — Lessons folded back from completing the Milestone 1 project

**Status:** Decided (2026-08-23)

## Decision

The Milestone 1 project (NASC Practical Claim Portal, `docs/milestone-1-source.md`) ran end-to-end through Phase 0a extraction, Phase 1 schema design, Phase 2 UI, Phase 3 backend, Phase 4 integration, a mid-project financial-model correction (triggered by a user-supplied rate spreadsheet, requiring a full Phase 1→4 revision cascade), and CI setup. Several real gaps and reusable patterns surfaced along the way that weren't previously captured anywhere in Formento's own docs/agents. This decision folds them back in, the same way 0007/0008 did for extraction and backend provisioning after that project's first real runs.

**1. Mid-project spec revisions are now a formalized capability, not just something that happened once.** A fresh-rebuild project's already-approved Phase 1 spec can need correcting after Phase 2/3/4 already exist (new information, a corrected source document) — this is different from Phase 0b's "migration path" delta-spec case, and previously had no documented handling. `schema-workflow-designer.md` now has an explicit "Mid-project spec revisions" section: treat the approved spec as a baseline, record the revision as its own numbered entry, individually flag every breaking change with the same rigor as migration mode (never batch-approved), and cascade to whichever later phases already exist with each one operating in **targeted-update mode** — preserve everything unaffected, extend rather than rebuild, state clearly what's new vs. untouched. `ui-scaffold-agent.md`, `backend-provisioner.md`, and `integration-agent.md` each now have a short "if invoked against an existing build" note reflecting this. `checkpoint-reviewer.md`'s breaking-change rule was broadened to cover both cases.

**2. A specific PDO/MySQL gotcha is now baked into the PHP+MySQL backend profile.** `PDO`/mysqlnd returns `DECIMAL` columns as PHP strings unconditionally — a naive `json_encode` therefore serializes computed financial fields as JSON strings instead of numbers, which broke an entire claim form on a real project (caught only by a real-browser functional walkthrough, not API-contract review). `backend-provisioner.md`'s PHP+MySQL section now instructs coercing DECIMAL columns to floats at one shared response-encoding point, **by column name** (not by sniffing whether a string value looks decimal-shaped — an unconstrained VARCHAR field can legitimately contain a decimal-shaped value, and shape-based coercion silently corrupts it), plus adding a companion CI check that fails when a new `DECIMAL(` migration column isn't in the allowlist.

**3. A real-browser functional walkthrough is worth the discipline it costs.** Across this project, a real UI walkthrough (not just curl/API-contract checks) caught bugs that static review and API-level testing both missed: stale form state on a conditional-field switch, a timezone bug silently shifting a persisted date by one day, and the DECIMAL-as-string crash above. `integration-agent.md`'s functional-walkthrough rule now says this explicitly rather than leaving "functional walkthrough" ambiguous about whether curl-only checks would satisfy it.

**4. Everything from 0002/0005/0006/0008 already proved out in practice, no changes needed there** — the interactive-mockup standard, the independent reviewer layer, the repo-separation convention, and stack-aware backend provisioning all worked as designed across the full Phase 0→4 cycle plus a full revision cycle, including two session-usage-limit interruptions mid-review that were recovered from by resuming the same subagent rather than losing its accumulated context.

## Why

This is the same posture 0007 and 0008 already established: don't wait for a second project to discover a gap that the first project already surfaced clearly. A mid-project spec revision, a PDO type-coercion footgun, and the value of real-browser verification over API-contract review alone are all things that will recur on the next Formento project (any PHP+MySQL project will hit #2; any long-lived project will eventually hit #1), so they're worth fixing at the agent-instruction level now rather than relying on someone remembering the war story.

## Effect on existing docs/tooling

- `.claude/agents/schema-workflow-designer.md` — new "Mid-project spec revisions" section.
- `.claude/agents/backend-provisioner.md` — PDO DECIMAL-coercion + CI-check guidance added to the PHP+MySQL profile; a "targeted-update mode" note added for both stack profiles.
- `.claude/agents/ui-scaffold-agent.md`, `.claude/agents/integration-agent.md` — "targeted-update mode" notes added.
- `.claude/agents/checkpoint-reviewer.md` — breaking-change rule broadened beyond "migration mode" to include mid-project revisions.
- No change to `docs/PRD.md` or `docs/build-plan.md` — same posture as 0007/0008, these stay as originally scoped; the lesson lives in the agent instructions that actually act on it.
