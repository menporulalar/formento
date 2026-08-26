# engine/

The actual pipeline implementation: Spec IR types + validation, the checkpoint state machine, and the Phase 0–5 compiler logic. Previously its own repo (`formento-engine`); merged in here 2026-08-24 — see `docs/decisions/0010-merge-formento-engine.md` for why.

## Status

Scaffold only — no implementation yet. Milestone 0 (Spec IR types + validation + checkpoint state machine, per `../docs/build-plan.md`) is the first real work to land here.

## Structure

```
src/
  spec-ir/       # Spec IR types + zod validators (see ../docs/spec-ir-schema.md)
  checkpoint/    # Checkpoint state machine + approval gate logic
test/
```

## Getting started

```bash
cd engine
npm install
npm test
```

CI runs from `.github/workflows/engine-ci.yml` at the repo root, scoped to this directory (only triggers on `engine/**` changes).

See `../docs/build-plan.md` Milestone 0 for what goes here first.
