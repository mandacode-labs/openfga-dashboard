import type {
  Computed as FgaComputed,
  Leaf as FgaLeaf,
  Node as FgaNode,
} from "@openfga/sdk";

export interface TreeNode {
  label: string;
  children: TreeNode[];
  isLeaf?: boolean;
}

export function buildTree(root: FgaNode | undefined): TreeNode | null {
  if (!root) return null;

  const name = root.name || "root";

  if (root.leaf) {
    const leaf = root.leaf;
    if ((leaf as FgaLeaf).users) {
      const users = (leaf as FgaLeaf).users?.users || [];
      return {
        label: name,
        children: users.map((u) => ({
          label: u,
          children: [],
          isLeaf: true,
        })),
        isLeaf: false,
      };
    }
    if ((leaf as FgaLeaf).computed) {
      const computed = leaf.computed as FgaComputed;
      return {
        label: name,
        children: [
          {
            label: `computed → ${computed.userset}`,
            children: [],
            isLeaf: true,
          },
        ],
      };
    }
    return { label: name, children: [], isLeaf: true };
  }

  const children: TreeNode[] = [];
  if (root.union) {
    const nodes = root.union.nodes || [];
    for (const node of nodes) {
      const child = buildTree(node);
      if (child) children.push(child);
    }
  }
  if (root.intersection) {
    const nodes = root.intersection.nodes || [];
    for (const node of nodes) {
      const child = buildTree(node);
      if (child) children.push(child);
    }
  }
  if (root.difference) {
    const base = buildTree(root.difference.base);
    if (base) children.push(base);
    const sub = buildTree(root.difference.subtract);
    if (sub) children.push(sub);
  }

  return { label: name, children, isLeaf: children.length === 0 };
}
