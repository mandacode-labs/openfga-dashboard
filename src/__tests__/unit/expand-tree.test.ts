import type { Node as FgaNode } from "@openfga/sdk";
import { describe, expect, it } from "vitest";
import { buildTree } from "@/lib/utils/expand-tree";

describe("buildTree", () => {
  it("returns null for undefined input", () => {
    expect(buildTree(undefined)).toBeNull();
  });

  it("builds a leaf node with users", () => {
    const node: FgaNode = {
      name: "document:1#viewer",
      leaf: {
        users: { users: ["user:1", "user:2"] },
      },
    };
    const result = buildTree(node);
    expect(result).toEqual({
      label: "document:1#viewer",
      children: [
        { label: "user:1", children: [], isLeaf: true },
        { label: "user:2", children: [], isLeaf: true },
      ],
      isLeaf: false,
    });
  });

  it("builds a leaf node with computed userset", () => {
    const node: FgaNode = {
      name: "document:1#viewer",
      leaf: {
        computed: { userset: "document:1#editor" },
      },
    };
    const result = buildTree(node);
    expect(result).toEqual({
      label: "document:1#viewer",
      children: [
        { label: "computed → document:1#editor", children: [], isLeaf: true },
      ],
    });
  });

  it("builds a leaf node without users or computed", () => {
    const node: FgaNode = {
      name: "document:1#viewer",
      leaf: {},
    };
    const result = buildTree(node);
    expect(result).toEqual({
      label: "document:1#viewer",
      children: [],
      isLeaf: true,
    });
  });

  it("builds a union node", () => {
    const node: FgaNode = {
      name: "document:1#viewer",
      union: {
        nodes: [
          {
            name: "user:1",
            leaf: { users: { users: ["user:1"] } },
          },
          {
            name: "group:eng",
            leaf: { users: { users: ["user:2", "user:3"] } },
          },
        ],
      },
    };
    const result = buildTree(node);
    expect(result?.label).toBe("document:1#viewer");
    expect(result?.children).toHaveLength(2);
    expect(result?.children[0].label).toBe("user:1");
    expect(result?.children[1].label).toBe("group:eng");
  });

  it("builds an intersection node", () => {
    const node: FgaNode = {
      name: "document:1#admin",
      intersection: {
        nodes: [
          {
            name: "owner",
            leaf: { users: { users: ["user:1"] } },
          },
          {
            name: "admin",
            leaf: { users: { users: ["user:2"] } },
          },
        ],
      },
    };
    const result = buildTree(node);
    expect(result?.label).toBe("document:1#admin");
    expect(result?.children).toHaveLength(2);
  });

  it("builds a difference node", () => {
    const node: FgaNode = {
      name: "document:1#viewer",
      difference: {
        base: {
          name: "all",
          leaf: { users: { users: ["user:1", "user:2"] } },
        },
        subtract: {
          name: "blocked",
          leaf: { users: { users: ["user:2"] } },
        },
      },
    };
    const result = buildTree(node);
    expect(result?.label).toBe("document:1#viewer");
    expect(result?.children).toHaveLength(2);
    expect(result?.children[0].label).toBe("all");
    expect(result?.children[1].label).toBe("blocked");
  });

  it("uses 'root' as default name when name is empty", () => {
    const node: FgaNode = {
      name: "",
      leaf: { users: { users: ["user:1"] } },
    };
    const result = buildTree(node);
    expect(result?.label).toBe("root");
  });

  it("handles nested union nodes", () => {
    const node: FgaNode = {
      name: "document:1#viewer",
      union: {
        nodes: [
          {
            name: "direct",
            leaf: { users: { users: ["user:1"] } },
          },
          {
            name: "through_group",
            union: {
              nodes: [
                {
                  name: "group:eng",
                  leaf: { users: { users: ["user:2"] } },
                },
                {
                  name: "group:sales",
                  leaf: { users: { users: ["user:3"] } },
                },
              ],
            },
          },
        ],
      },
    };
    const result = buildTree(node);
    expect(result?.children).toHaveLength(2);
    expect(result?.children[1].children).toHaveLength(2);
  });
});
