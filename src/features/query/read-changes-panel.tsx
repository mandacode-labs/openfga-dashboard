"use client";

import type { TupleChange } from "@openfga/sdk";
import { ChevronDown, Timer } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnectionStore } from "@/lib/store/connection-store";

export function ReadChangesPanel() {
  const client = useConnectionStore((s) => s.client);
  const storeId = useConnectionStore((s) => s.currentStoreId);

  const [type, setType] = useState("");
  const [changes, setChanges] = useState<TupleChange[]>([]);
  const [continuationToken, setContinuationToken] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChanges = useCallback(async () => {
    if (!client || !storeId || !type.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await client.readChanges(
        { type: type.trim() },
        { storeId, pageSize: 50 },
      );
      setChanges(res.changes || []);
      setContinuationToken(res.continuation_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read changes");
    } finally {
      setLoading(false);
    }
  }, [client, storeId, type]);

  const loadMore = useCallback(async () => {
    if (!client || !storeId || !continuationToken) return;
    setLoading(true);
    try {
      const res = await client.readChanges(
        { type },
        { storeId, pageSize: 50, continuationToken },
      );
      setChanges((prev) => [...prev, ...(res.changes || [])]);
      setContinuationToken(res.continuation_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoading(false);
    }
  }, [client, storeId, type, continuationToken]);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-xs font-medium">
          Read tuple change history for a type
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label className="text-2xs">Object Type</Label>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="document"
              className="h-7 text-xs"
            />
          </div>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={fetchChanges}
            disabled={!client || !type.trim() || loading}
          >
            <Timer className="mr-1 h-3 w-3" />
            {loading ? "Loading..." : "Load"}
          </Button>
        </div>

        <ErrorAlert error={error} />

        {loading && changes.length === 0 && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        )}

        {changes.length > 0 && (
          <div className="space-y-1">
            {changes.map((change, i) => (
              <div
                key={`${change.tuple_key?.user}-${change.tuple_key?.relation}-${change.tuple_key?.object}-${i}`}
                className="flex items-center gap-2 text-xs py-1"
              >
                <Badge
                  variant={
                    change.operation === "TUPLE_OPERATION_WRITE"
                      ? "secondary"
                      : "outline"
                  }
                  className="h-4 text-2xs font-mono"
                >
                  {change.operation === "TUPLE_OPERATION_WRITE"
                    ? "+"
                    : "\u2212"}
                </Badge>
                <span className="font-mono">
                  {change.tuple_key?.user}
                  <span className="text-muted-foreground"> # </span>
                  {change.tuple_key?.relation}
                  <span className="text-muted-foreground"> @ </span>
                  {change.tuple_key?.object}
                </span>
                {change.timestamp && (
                  <span className="text-muted-foreground ml-auto shrink-0">
                    {new Date(change.timestamp).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
            {continuationToken && (
              <div className="pt-2 text-center">
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
          </div>
        )}

        {changes.length === 0 && !loading && !error && type && (
          <p className="text-xs text-muted-foreground py-2">
            No changes found for this type.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
