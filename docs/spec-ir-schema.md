# Formento — Canonical Spec IR Schema (v1)

This is the concrete data contract at the center of the pipeline (spec.md §7). All three entry modes write to it; all compiler phases read from it. Expressed as TypeScript types — the actual serialization is JSON, stored per-project (e.g. `spec-ir.json` at the project root, versioned in git alongside generated code).

This schema is intentionally narrow for v1 — enough to unblock Phase 1–5 implementation, not a hypothetical general-purpose form DSL. Extend it when a real v1 template needs a shape it doesn't cover yet, not preemptively.

## Top-level document

```ts
interface SpecIR {
  specVersion: "1.0";
  project: ProjectMeta;
  entities: Entity[];
  roles: Role[];
  workflows: Workflow[];       // one workflow can span multiple entities' states, but v1 keeps it 1:1 with an entity
  delta?: DeltaSpec;           // present only when project.mode === "migration"
}

interface ProjectMeta {
  id: string;                  // slug, e.g. "vendor-rfp-intake"
  name: string;
  entryMode: "conversational" | "templated" | "derived";
  templateId?: string;         // set when entryMode === "templated"
  mode: "fresh" | "migration"; // Phase 0b choice; "fresh" for conversational/templated
  uiFramework: "shadcn-tailwind"; // v1 only supports this adapter (docs/decisions/0002)
  createdAt: string;            // ISO 8601
  updatedAt: string;
}
```

## Entities & fields

```ts
interface Entity {
  id: string;          // stable slug, used as the Prisma model name basis
  name: string;         // display name
  fields: Field[];
  relationships: Relationship[];
}

interface Field {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  validations: ValidationRule[];  // empty array is valid, but must be an explicit, deliberate choice (see schema-workflow-designer agent rules)
  defaultValue?: string | number | boolean | null;
  description?: string;           // shown as help text / used for AI-assisted fields
  piiSensitive?: boolean;         // flags fields needing extra handling in Phase 3 (encryption at rest, audit logging)
}

type FieldType =
  | "string" | "text" | "number" | "boolean"
  | "date" | "datetime"
  | "email" | "phone" | "url"
  | "enum"        // requires `options` in the field's validations or a dedicated `options: string[]` — see note below
  | "currency"
  | "file"        // maps to MinIO-backed upload in Phase 3
  | "relation";   // resolved via `relationships`, not a plain field type — see Relationship

interface ValidationRule {
  type: "required" | "min" | "max" | "minLength" | "maxLength" | "pattern" | "options" | "custom";
  value?: string | number | string[];  // string[] for "options" (enum values)
  message?: string;                     // user-facing validation error text
}

interface Relationship {
  id: string;
  fromEntity: string;   // Entity.id
  toEntity: string;     // Entity.id
  type: "one-to-one" | "one-to-many" | "many-to-many";
  foreignKeyField?: string;  // Field.id on the "many" side, when applicable
  onDelete: "cascade" | "restrict" | "setNull";
}
```

## Roles & permissions

```ts
interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface Permission {
  entity: string;              // Entity.id, or "*" for all entities
  actions: Action[];
}

type Action = "create" | "read" | "update" | "delete" | "transition";
```

## Workflow states

```ts
interface Workflow {
  id: string;
  entity: string;               // Entity.id this workflow governs
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

interface WorkflowState {
  id: string;
  name: string;
  isInitial: boolean;
  isTerminal: boolean;
}

interface WorkflowTransition {
  id: string;
  from: string;                 // WorkflowState.id
  to: string;                   // WorkflowState.id
  allowedRoles: string[];       // Role.id[]
  requiresApproval: boolean;
  notifyOnTransition?: boolean; // wires to Phase 4 notification hooks
}
```

**Constraint enforced by the schema-workflow-designer agent, not just convention:** every workflow must have at least one `isTerminal: true` state reachable from every non-terminal state (no dead-end / no-rejection-path workflows — this is exactly the kind of gap the extraction-agent's gap report flags in derived mode, per spec.md §5).

## Delta spec (migration path only)

```ts
interface DeltaSpec {
  baselineSpecVersion: string;   // hash or version tag of the Phase 0a baseline this diffs against
  changes: DeltaChange[];
}

interface DeltaChange {
  id: string;
  type: "field-add" | "field-remove" | "field-retype" | "field-rename"
      | "workflow-state-remove" | "workflow-transition-remove" | "entity-remove";
  entity: string;                 // Entity.id
  field?: string;                 // Field.id, when applicable
  breaking: boolean;              // true for anything in the list above except field-add
  hasInFlightRecords?: boolean;   // set for workflow-state-remove; drives the "in-flight records" flag in spec.md §5
  resolution?: DeltaResolution;   // absent until the user resolves it at the Phase 1 checkpoint
}

interface DeltaResolution {
  action: "accept" | "reject" | "remap";
  remapToField?: string;          // used when a rename was misread as add+orphan and the user corrects it
  migrationNote: string;          // free text explaining the resolution, carried into the Phase 3 migration script's comments
  resolvedBy: string;             // user identifier
  resolvedAt: string;             // ISO 8601
}
```

**Hard constraint (spec.md §5, docs/decisions/0001):** `schema-workflow-designer` must not let Phase 1 be marked "approved" while any `DeltaChange` with `breaking: true` lacks a `resolution`. This is the literal data-level enforcement of the proactive-flagging decision — a checkpoint-approval action should be rejected/blocked in code if `delta.changes.some(c => c.breaking && !c.resolution)`.

## Checkpoint record (cross-cutting, not part of the Spec IR itself)

Tracked per-phase, separate from the Spec IR, so approval history persists independently of spec content changes:

```ts
interface Checkpoint {
  phase: 0 | "0a" | "0b" | 1 | 2 | 3 | 4 | 5;
  status: "pending" | "approved" | "modified";
  artifactRef: string;        // path to the reviewable artifact (spec doc, diagram, mockup, deployed URL, etc.)
  presentedAt: string;
  decidedAt?: string;
  openDecisions: OpenDecision[];  // must be empty (or all resolved) before status can be "approved"
}

interface OpenDecision {
  id: string;
  description: string;
  linkedDeltaChangeId?: string;  // ties back to DeltaChange.id for migration breaking changes
  resolved: boolean;
}
```

## What this schema deliberately does not cover yet (v2+)

- Conditional field visibility / branching logic beyond what's derivable from `Workflow` — no dedicated expression language in v1. If a template needs it, extend `Field` with an optional `visibleWhen` expression then, not speculatively now.
- Multi-workflow-per-entity (e.g. two independent state machines on one entity) — v1 assumes 1:1 entity↔workflow.
- I18n / multi-language field labels.
- AI-assisted field configuration (resume parsing, classification) beyond the `piiSensitive`/`description` hooks — spec.md §7 keeps Qdrant/pgvector out of the default path; add a dedicated `aiConfig` block on `Field` only when the first such template actually needs it.
