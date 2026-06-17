"use client";

import { ChevronDown, Plus, RotateCw, Search, Trash2 } from "lucide-react";
import { use, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useTuples } from "@/hooks/use-openfga";
import type { TupleKey } from "@/types";

export default function TuplesPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);
  const {
    tuples,
    loading,
    error,
    refetch,
    loadMore,
    addTuples,
    deleteTuples,
    hasMore,
  } = useTuples(storeId);

  const [userFilter, setUserFilter] = useState("");
  const [relationFilter, setRelationFilter] = useState("");
  const [objectFilter, setObjectFilter] = useState("");

  const [newUser, setNewUser] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [newObject, setNewObject] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<TupleKey | null>(null);

  const handleSearch = () => {
    const filter: { user?: string; relation?: string; object?: string } = {};
    if (userFilter.trim()) filter.user = userFilter.trim();
    if (relationFilter.trim()) filter.relation = relationFilter.trim();
    if (objectFilter.trim()) filter.object = objectFilter.trim();
    refetch(filter);
  };

  const handleAdd = async () => {
    if (!newUser.trim() || !newRelation.trim() || !newObject.trim()) return;
    await addTuples([
      {
        user: newUser.trim(),
        relation: newRelation.trim(),
        object: newObject.trim(),
      },
    ]);
    setNewUser("");
    setNewRelation("");
    setNewObject("");
  };

  const handleDelete = async (key: TupleKey) => {
    await deleteTuples([key]);
    setDeleteTarget(null);
  };

  const filteredTuples = tuples.filter((t) => {
    const k = t.key;
    if (userFilter && !k.user.includes(userFilter)) return false;
    if (relationFilter && !k.relation.includes(relationFilter)) return false;
    if (objectFilter && !k.object.includes(objectFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight">
          Relationship Tuples
        </h2>
        <p className="text-xs text-muted-foreground">
          Manage relationship tuples in the store
        </p>
      </div>

      {error && (
        <Alert variant="destructive" size="compact">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-none">
        <CardHeader className="pb-2 px-4 pt-3">
          <CardTitle className="text-xs font-medium">Add Tuple</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-2xs">User</Label>
              <Input
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                placeholder="user:anne"
                className="h-7 text-xs"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-2xs">Relation</Label>
              <Input
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                placeholder="viewer"
                className="h-7 text-xs"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-2xs">Object</Label>
              <Input
                value={newObject}
                onChange={(e) => setNewObject(e.target.value)}
                placeholder="document:roadmap"
                className="h-7 text-xs"
              />
            </div>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleAdd}
              disabled={
                !newUser.trim() || !newRelation.trim() || !newObject.trim()
              }
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-2 px-4 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium">Tuples</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => refetch()}
              >
                <RotateCw className="mr-1 h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-end gap-2 mb-3">
            <div className="flex-1 space-y-1">
              <Label className="text-2xs">User</Label>
              <Input
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Filter by user..."
                className="h-7 text-xs"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-2xs">Relation</Label>
              <Input
                value={relationFilter}
                onChange={(e) => setRelationFilter(e.target.value)}
                placeholder="Filter by relation..."
                className="h-7 text-xs"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-2xs">Object</Label>
              <Input
                value={objectFilter}
                onChange={(e) => setObjectFilter(e.target.value)}
                placeholder="Filter by object..."
                className="h-7 text-xs"
              />
            </div>
            <Button size="sm" className="h-7 text-xs" onClick={handleSearch}>
              <Search className="mr-1 h-3 w-3" />
              Search
            </Button>
          </div>

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          )}

          {!loading && filteredTuples.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No tuples found.
            </div>
          )}

          {!loading && filteredTuples.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-muted-foreground">
                        User
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground">
                        Relation
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground">
                        Object
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground">
                        Timestamp
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTuples.map((tuple, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-1.5 font-mono text-xs">
                          {tuple.key.user}
                        </td>
                        <td className="py-1.5">
                          <Badge
                            variant="secondary"
                            className="h-4 text-2xs font-mono"
                          >
                            {tuple.key.relation}
                          </Badge>
                        </td>
                        <td className="py-1.5 font-mono text-xs">
                          {tuple.key.object}
                        </td>
                        <td className="py-1.5 text-muted-foreground">
                          {new Date(tuple.timestamp).toLocaleString()}
                        </td>
                        <td className="py-1.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(tuple.key)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hasMore && (
                <div className="mt-3 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={loadMore}
                  >
                    <ChevronDown className="mr-1 h-3 w-3" />
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Tuple</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this tuple?
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="space-y-1 py-2 text-xs font-mono">
              <p>user: {deleteTarget.user}</p>
              <p>relation: {deleteTarget.relation}</p>
              <p>object: {deleteTarget.object}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
