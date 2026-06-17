"use client";

import { Search, ShieldCheck, ShieldX } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnectionStore } from "@/lib/store/connection-store";

export function CheckPanel() {
  const client = useConnectionStore((s) => s.client);
  const storeId = useConnectionStore((s) => s.currentStoreId);

  const [user, setUser] = useState("");
  const [relation, setRelation] = useState("");
  const [object, setObject] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = useCallback(async () => {
    if (!client || !storeId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await client.check({ user, relation, object }, { storeId });
      setResult(res.allowed ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setLoading(false);
    }
  }, [client, storeId, user, relation, object]);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-xs font-medium">
          Check if a user has a relation to an object
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
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
          onClick={handleCheck}
          disabled={!client || !user || !relation || !object || loading}
        >
          <Search className="mr-1 h-3 w-3" />
          {loading ? "Checking..." : "Check"}
        </Button>

        <ErrorAlert error={error} />

        {result !== null && (
          <div
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${
              result
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {result ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldX className="h-4 w-4" />
            )}
            <span className="font-semibold">
              {result ? "ALLOWED" : "DENIED"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
