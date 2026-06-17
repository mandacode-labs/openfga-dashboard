import { describe, expect, it } from "vitest";
import { getRelationDescription } from "@/lib/utils/model-helpers";
import type { Userset } from "@/types";

describe("getRelationDescription", () => {
  const relations: Record<string, Userset> = {
    viewer: { this: {} },
    editor: { union: { child: [{ computedUserset: { relation: "viewer" } }] } },
    admin: {
      intersection: { child: [{ computedUserset: { relation: "editor" } }] },
    },
    restricted: {
      difference: {
        base: { computedUserset: { relation: "viewer" } },
        subtract: {
          tupleToUserset: {
            computedUserset: { relation: "blocked" },
            tupleset: { relation: "parent" },
          },
        },
      },
    },
    inherited: {
      tupleToUserset: {
        computedUserset: { relation: "viewer" },
        tupleset: { relation: "parent" },
      },
    },
    computed_viewer: { computedUserset: { relation: "viewer" } },
  };

  it("returns 'direct' for this", () => {
    expect(getRelationDescription(relations, "viewer")).toBe("direct");
  });

  it("returns 'union' for union", () => {
    expect(getRelationDescription(relations, "editor")).toBe("union");
  });

  it("returns 'intersection' for intersection", () => {
    expect(getRelationDescription(relations, "admin")).toBe("intersection");
  });

  it("returns 'difference' for difference", () => {
    expect(getRelationDescription(relations, "restricted")).toBe("difference");
  });

  it("returns 'from' for tupleToUserset", () => {
    expect(getRelationDescription(relations, "inherited")).toBe("from");
  });

  it("returns 'computed' for computedUserset", () => {
    expect(getRelationDescription(relations, "computed_viewer")).toBe(
      "computed",
    );
  });

  it("returns empty string for unknown relation", () => {
    expect(getRelationDescription(relations, "nonexistent")).toBe("");
  });
});
