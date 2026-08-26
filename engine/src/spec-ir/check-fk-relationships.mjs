#!/usr/bin/env node
// Structural check: every field-level `foreignKey` validation must have a matching
// `relationships[]` entry on the same entity, and vice versa. Catches the class of bug
// where the Spec IR JSON (source of truth) drifts from the ER diagrams generated from it.
//
// Zero dependencies and plain JS (not TS) on purpose: this runs both as a PostToolUse
// hook (no build step available) and as a vitest-imported module.

/**
 * @typedef {{ severity: 'error', code: string, entityId: string, fieldId?: string, relationshipId?: string, message: string }} Finding
 */

/**
 * @param {any} specIR
 * @returns {Finding[]}
 */
export function checkForeignKeyRelationships(specIR) {
  const findings = [];
  const entities = Array.isArray(specIR?.entities) ? specIR.entities : [];
  const entityIds = new Set(entities.map((e) => e.id));

  for (const entity of entities) {
    const fields = Array.isArray(entity.fields) ? entity.fields : [];
    const relationships = Array.isArray(entity.relationships) ? entity.relationships : [];

    // (a) every FK-typed field needs a corresponding relationships[] entry.
    for (const field of fields) {
      const fkValidations = (field.validations ?? []).filter((v) => v?.type === "foreignKey");
      for (const fk of fkValidations) {
        const targetEntity = fk.value;
        const hasMatch = relationships.some(
          (r) => r.fromEntity === entity.id && r.foreignKeyField === field.id && r.toEntity === targetEntity
        );
        if (!hasMatch) {
          findings.push({
            severity: "error",
            code: "fk-field-missing-relationship",
            entityId: entity.id,
            fieldId: field.id,
            message: `${entity.id}.${field.id} has a foreignKey validation targeting "${targetEntity}" but entity "${entity.id}" has no relationships[] entry with fromEntity="${entity.id}", foreignKeyField="${field.id}", toEntity="${targetEntity}".`,
          });
        }
        if (targetEntity && !entityIds.has(targetEntity)) {
          findings.push({
            severity: "error",
            code: "fk-target-entity-not-found",
            entityId: entity.id,
            fieldId: field.id,
            message: `${entity.id}.${field.id} has a foreignKey validation targeting unknown entity "${targetEntity}" (no entity with that id in the spec).`,
          });
        }
      }
    }

    // (b) every relationships[] entry that names a foreignKeyField needs a backing field
    // with a matching foreignKey validation. Relationships with no foreignKeyField (e.g.
    // some many-to-many joins) have nothing to check here and are skipped.
    for (const rel of relationships) {
      if (!rel.foreignKeyField) continue;
      const field = fields.find((f) => f.id === rel.foreignKeyField);
      const hasFkValidation = field?.validations?.some(
        (v) => v?.type === "foreignKey" && v.value === rel.toEntity
      );
      if (!hasFkValidation) {
        findings.push({
          severity: "error",
          code: "relationship-missing-fk-field",
          entityId: entity.id,
          relationshipId: rel.id,
          message: `Relationship "${rel.id}" (${entity.id} -> ${rel.toEntity} via foreignKeyField="${rel.foreignKeyField}") has no backing field: "${entity.id}.${rel.foreignKeyField}" ${field ? "exists but lacks" : "does not exist, so it has no"} a foreignKey validation targeting "${rel.toEntity}".`,
        });
      }
    }
  }

  return findings;
}

function formatFindings(findings) {
  return findings.map((f) => `  [${f.code}] ${f.message}`).join("\n");
}

async function runCli(filePath) {
  const fs = await import("node:fs/promises");
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch (err) {
    console.error(`[check-fk-relationships] could not read ${filePath}: ${err.message}`);
    process.exit(2);
  }

  let specIR;
  try {
    specIR = JSON.parse(raw);
  } catch (err) {
    console.error(`[check-fk-relationships] ${filePath} is not valid JSON: ${err.message}`);
    process.exit(2);
  }

  const findings = checkForeignKeyRelationships(specIR);
  if (findings.length === 0) {
    console.log(`[check-fk-relationships] OK: ${filePath} — FK fields and relationships[] are in sync.`);
    process.exit(0);
  }

  console.error(`[check-fk-relationships] ${findings.length} issue(s) in ${filePath}:\n${formatFindings(findings)}`);
  process.exit(1);
}

const { pathToFileURL } = await import("node:url");
const { realpathSync } = await import("node:fs");
// realpath both sides before comparing: import.meta.url is always the resolved,
// symlink-free path, but process.argv[1] preserves however the script was invoked
// (e.g. through a symlinked path, as happens when a hook resolves this file via a
// `cd <symlinked-dir> && pwd`-style lookup) -- a raw string comparison would miss
// that case and silently skip the CLI branch.
let isMainModule = false;
if (process.argv[1]) {
  try {
    isMainModule = import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    isMainModule = false;
  }
}
if (isMainModule) {
  const target = process.argv[2];
  if (!target) {
    console.error("usage: node check-fk-relationships.mjs <path-to-spec-ir.json>");
    process.exit(2);
  }
  runCli(target);
}
