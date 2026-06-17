"use client";

import { FolderTree } from "lucide-react";
import { useCallback, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnectionStore } from "@/lib/store/connection-store";

interface ExpandPanelProps {
  storeId: string | null;
}

interface TreeNode {
  label: string;
  children: TreeNode[];
  isLeaf?: boolean;
}

function buildTree(root: Record<string, unknown> | undefined): TreeNode | null {
  if (!root) return null;

  const name = (root.name as string) || "root";

  if (root.leaf) {
    const leaf = root.leaf as Record<string, unknown>;
    if (leaf.users) {
      const users = (leaf.users as Record<string, unknown>).users as string[];
      return {
        label: name,
        children: users.map((u) => ({ label: u, children: [], isLeaf: true })),
        isLeaf: false,
      };
    }
    if (leaf.computed) {
      const computed = leaf.computed as Record<string, unknown>;
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
    const nodes =
      ((root.union as Record<string, unknown>).nodes as Record<
        string,
        unknown
      >[]) || [];
    for (const node of nodes) {
      const child = buildTree(node);
      if (child) children.push(child);
    }
  }
  if (root.intersection) {
    const nodes =
      ((root.intersection as Record<string, unknown>).nodes as Record<
        string,
        unknown
      >[]) || [];
    for (const node of nodes) {
      const child = buildTree(node);
      if (child) children.push(child);
    }
  }
  if (root.difference) {
    const nodes =
      ((root.difference as Record<string, unknown>).nodes as Record<
        string,
        unknown
      >[]) || [];
    for (const node of nodes) {
      const child = buildTree(node);
      if (child) children.push(child);
    }
  }

  return { label: name, children, isLeaf: children.length === 0 };
}

function TreeNodeView({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <div
        className={`flex items-center gap-1.5 py-1 text-xs ${
          node.isLeaf ? "text-muted-foreground font-mono" : "font-medium"
        }`}
      >
        {!node.isLeaf && (
          <FolderTree className="h-3 w-3 text-muted-foreground" />
        )}
        {node.label}
      </div>
      {node.children.map((child, i) => (
        <TreeNodeView key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function ExpandPanel({ storeId }: ExpandPanelProps) {
  const client = useConnectionStore((s) => s.client);

  const [relation, setRelation] = useState("");
  const [object, setObject] = useState("");
  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExpand = useCallback(async () => {
    if (!client || !storeId) return;
    setLoading(true);
    setError(null);
    setTree(null);
    try {
      const res = await client.expand({ relation, object }, { storeId });
      const rootNode = buildTree(
        (res.tree as { root?: Record<string, unknown> })?.root,
      );
      setTree(rootNode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Expand failed");
    } finally {
      setLoading(false);
    }
  }, [client, storeId, relation, object]);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-xs font-medium">
          Expand a relationship tree
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-2xs">Relation</Label>
            <Input
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="viewer"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-2xs">Object</Label>
            <Input
              value={object}
              onChange={(e) => setObject(e.target.value)}
              placeholder="document:roadmap"
              className="h-7 text-xs"
            />
          </div>
        </div>

        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={handleExpand}
          disabled={!client || !storeId || !relation || !object || loading}
        >
          <FolderTree className="mr-1 h-3 w-3" />
          {loading ? "Expanding..." : "Expand"}
        </Button>

        {error && (
          <Alert variant="destructive" size="compact">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {tree && (
          <div className="rounded-md border p-3 max-h-64 overflow-auto">
            <TreeNodeView node={tree} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
