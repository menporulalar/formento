# Formento

**Working name:** Formento
**Status:** Requirements & planning — PRD + build plan drafted, pre-development
**Author:** Thiru (Janakiraman Veerappan)

Formento is an agentic provisioning system that takes minimal input — a template pick, a conversation, or an existing project to reverse-engineer — and produces a fully running, deployable form-heavy application, built through a series of user-gated checkpoints rather than a single autonomous generation pass.

## Contents

- [`docs/spec.md`](docs/spec.md) — original vision/rationale spec (problem statement, entry modes, phased pipeline, architecture sketch, MVP scope)
- [`docs/PRD.md`](docs/PRD.md) — **the buildable requirements**: goals, non-goals, user stories, P0/P1/P2 requirements with acceptance criteria, success metrics, open questions
- [`docs/spec-ir-schema.md`](docs/spec-ir-schema.md) — concrete Spec IR data contract (TypeScript types) that Claude Code builds against
- [`docs/build-plan.md`](docs/build-plan.md) — milestone-by-milestone build order (M0 Spec IR core → **M1 derived-mode extraction → fresh-rebuild, the first real project** → M2 conversational/templated entry → M3 Phase 2/3 → M4 Phase 4/5 deployed v1 → M5 migration fork, deferred)
- [`docs/decisions/`](docs/decisions) — architecture/decision records as they're made
- [`docs/open-questions.md`](docs/open-questions.md) — tracked open questions pulled from the spec, for ongoing resolution (see also PRD.md's Open Questions for build-blocking ones)
- [`docs/tooling-setup.md`](docs/tooling-setup.md) — the `.claude/` subagents, commands, hooks, and MCP servers set up for building this in Claude Code
- [`docs/milestone-1-source.md`](docs/milestone-1-source.md) — the confirmed Milestone 1 source project (Practical_Database: raw SQL + procedural PHP), its schema, and known gaps to watch for

## Repo layout (docs/decisions/0006)

This repo is **docs and tooling only** — spec, PRD, build plan, decisions, `.claude/`. The actual implementation lives elsewhere:

- **`formento-engine`** (sibling folder, `~/Documents/Product/Nanda-Projects/formento-engine`) — the real TypeScript implementation: Spec IR types/validators, checkpoint state machine, phase compiler logic. Milestone 0 onward lands there, not here.
- **Generated projects** — each real app Formento builds (starting with the Milestone 1 derived-mode project) lives in its own separate folder/repo, never inside this one or the engine repo.

## Quick summary

Three entry modes (conversational, templated, derived-from-existing-project) all normalize into one canonical Spec IR. A checkpoint-gated 6-phase pipeline (Intent Capture → Schema & Workflow → UI/UX Scaffold → Backend & Data → Integration → Deploy) compiles that spec into a real, deployed application — never a single autonomous generation pass.

Suggested default stack: Next.js + React (pluggable UI framework adapter, starting with shadcn/ui + Tailwind for v1), PostgreSQL + Prisma, Redis + BullMQ, MinIO, Docker/VPS.

See `docs/spec.md` for the full spec and `docs/open-questions.md` for resolved v1 decisions (checkpoint UI, target user, extraction-only scope, UI adapter shortlist, naming).
