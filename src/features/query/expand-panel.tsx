"use client";

import type { UsersetTree } from "@openfga/sdk";
import { FolderTree } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnectionStore } from "@/lib/store/connection-store";
import { buildTree, type TreeNode } from "@/lib/utils/expand-tree";

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
        <TreeNodeView
          key={`${child.label}-${i}`}
          node={child}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function ExpandPanel() {
  const client = useConnectionStore((s) => s.client);
  const storeId = useConnectionStore((s) => s.currentStoreId);

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
      const rootNode = buildTree((res.tree as UsersetTree)?.root);
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
          disabled={!client || !relation || !object || loading}
        >
          <FolderTree className="mr-1 h-3 w-3" />
          {loading ? "Expanding..." : "Expand"}
        </Button>

        <ErrorAlert error={error} />

        {tree && (
          <div className="rounded-md border p-3 max-h-64 overflow-auto">
            <TreeNodeView node={tree} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
