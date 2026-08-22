# Formento

**Working name:** Formento
**Status:** Draft v0.1 — ideation → spec
**Author:** Thiru (Janakiraman Veerappan)

Formento is an agentic provisioning system that takes minimal input — a template pick, a conversation, or an existing project to reverse-engineer — and produces a fully running, deployable form-heavy application, built through a series of user-gated checkpoints rather than a single autonomous generation pass.

## Contents

- [`docs/spec.md`](docs/spec.md) — full project specification (problem statement, vision, entry modes, phased pipeline, architecture sketch, MVP scope, open questions)
- [`docs/decisions/`](docs/decisions) — architecture/decision records as they're made
- [`docs/open-questions.md`](docs/open-questions.md) — tracked open questions pulled from the spec, for ongoing resolution

## Quick summary

Three entry modes (conversational, templated, derived-from-existing-project) all normalize into one canonical Spec IR. A checkpoint-gated 6-phase pipeline (Intent Capture → Schema & Workflow → UI/UX Scaffold → Backend & Data → Integration → Deploy) compiles that spec into a real, deployed application — never a single autonomous generation pass.

Suggested default stack: Next.js + React (pluggable UI framework adapter, starting with shadcn/ui + Tailwind for v1), PostgreSQL + Prisma, Redis + BullMQ, MinIO, Docker/VPS.

See `docs/spec.md` for the full spec and `docs/open-questions.md` for resolved v1 decisions (checkpoint UI, target user, extraction-only scope, UI adapter shortlist, naming).
