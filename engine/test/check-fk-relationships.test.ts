import { describe, expect, it } from "vitest";
import { checkForeignKeyRelationships } from "../src/spec-ir/check-fk-relationships.mjs";

function entity(overrides: Record<string, unknown>) {
  return { id: "e", name: "E", fields: [], relationships: [], ...overrides };
}

describe("checkForeignKeyRelationships", () => {
  it("passes a spec where every FK field has a matching relationship", () => {
    const spec = {
      entities: [
        entity({
          id: "staff",
          fields: [
            { id: "departmentId", validations: [{ type: "foreignKey", value: "department" }] },
          ],
          relationships: [
            { id: "rel-staff-department", fromEntity: "staff", toEntity: "department", foreignKeyField: "departmentId" },
          ],
        }),
        entity({ id: "department", fields: [], relationships: [] }),
      ],
    };
    expect(checkForeignKeyRelationships(spec)).toEqual([]);
  });

  it("flags an FK field with no backing relationships[] entry (the staff.departmentId/designationId/subject.departmentId bug)", () => {
    const spec = {
      entities: [
        entity({
          id: "staff",
          fields: [
            { id: "departmentId", validations: [{ type: "foreignKey", value: "department" }] },
            { id: "designationId", validations: [{ type: "foreignKey", value: "designation" }] },
          ],
          relationships: [], // drift: ER diagram showed these, JSON didn't
        }),
        entity({ id: "department" }),
        entity({ id: "designation" }),
      ],
    };
    const findings = checkForeignKeyRelationships(spec);
    expect(findings).toHaveLength(2);
    expect(findings.map((f) => f.code)).toEqual([
      "fk-field-missing-relationship",
      "fk-field-missing-relationship",
    ]);
    expect(findings[0]).toMatchObject({ entityId: "staff", fieldId: "departmentId" });
    expect(findings[1]).toMatchObject({ entityId: "staff", fieldId: "designationId" });
  });

  it("flags a relationships[] entry with no backing FK field", () => {
    const spec = {
      entities: [
        entity({
          id: "practical-claim",
          fields: [{ id: "collegeId", validations: [] }], // no foreignKey validation
          relationships: [
            { id: "rel-claim-college", fromEntity: "practical-claim", toEntity: "college", foreignKeyField: "collegeId" },
          ],
        }),
        entity({ id: "college" }),
      ],
    };
    const findings = checkForeignKeyRelationships(spec);
    expect(findings).toEqual([
      expect.objectContaining({ code: "relationship-missing-fk-field", relationshipId: "rel-claim-college" }),
    ]);
  });

  it("flags a foreignKey validation targeting an entity that doesn't exist", () => {
    const spec = {
      entities: [
        entity({
          id: "practical-claim",
          fields: [{ id: "bankId", validations: [{ type: "foreignKey", value: "bank" }] }],
          relationships: [
            { id: "rel-claim-bank", fromEntity: "practical-claim", toEntity: "bank", foreignKeyField: "bankId" },
          ],
        }),
        // "bank" entity is missing entirely
      ],
    };
    const findings = checkForeignKeyRelationships(spec);
    expect(findings).toEqual([
      expect.objectContaining({ code: "fk-target-entity-not-found", entityId: "practical-claim", fieldId: "bankId" }),
    ]);
  });

  it("does not flag relationships with no foreignKeyField (e.g. many-to-many joins)", () => {
    const spec = {
      entities: [
        entity({
          id: "a",
          fields: [],
          relationships: [{ id: "rel-a-b", fromEntity: "a", toEntity: "b", type: "many-to-many" }],
        }),
        entity({ id: "b" }),
      ],
    };
    expect(checkForeignKeyRelationships(spec)).toEqual([]);
  });

  it("returns no findings for a spec with no entities", () => {
    expect(checkForeignKeyRelationships({})).toEqual([]);
    expect(checkForeignKeyRelationships({ entities: [] })).toEqual([]);
  });
});
