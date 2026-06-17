"use client";

import { Network } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnectionStore } from "@/lib/store/connection-store";

export function ListRelationsPanel() {
  const client = useConnectionStore((s) => s.client);
  const storeId = useConnectionStore((s) => s.currentStoreId);

  const [user, setUser] = useState("");
  const [object, setObject] = useState("");
  const [relations, setRelations] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleList = useCallback(async () => {
    if (!client || !storeId) return;
    setLoading(true);
    setError(null);
    setResult([]);
    try {
      const relationList = relations
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
      const res = await client.listRelations(
        { user, object, relations: relationList },
        { storeId },
      );
      setResult(res.relations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "List relations failed");
    } finally {
      setLoading(false);
    }
  }, [client, storeId, user, object, relations]);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-xs font-medium">
          Check which relations a user has with an object
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-2xs">User</Label>
            <Input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="user:anne"
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
        <div className="space-y-1">
          <Label className="text-2xs">Relations (comma-separated)</Label>
          <Input
            value={relations}
            onChange={(e) => setRelations(e.target.value)}
            placeholder="viewer, editor, owner"
            className="h-7 text-xs"
          />
        </div>

        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={handleList}
          disabled={!client || !user || !object || !relations || loading}
        >
          <Network className="mr-1 h-3 w-3" />
          {loading ? "Checking..." : "List Relations"}
        </Button>

        <ErrorAlert error={error} />

        {result.length > 0 && (
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground mb-2">
              {user} has {result.length} relation
              {result.length !== 1 ? "s" : ""} on {object}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.map((rel) => (
                <Badge
                  key={rel}
                  variant="secondary"
                  className="h-5 text-xs font-mono"
                >
                  {rel}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {result.length === 0 &&
          !loading &&
          !error &&
          relations &&
          user &&
          object && (
            <p className="text-xs text-muted-foreground py-2">
              No matching relations found.
            </p>
          )}
      </CardContent>
    </Card>
  );
}
