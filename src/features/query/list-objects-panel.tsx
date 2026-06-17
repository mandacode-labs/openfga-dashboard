"use client";

import { List } from "lucide-react";
import { useCallback, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnectionStore } from "@/lib/store/connection-store";

interface ListObjectsPanelProps {
  storeId: string | null;
}

export function ListObjectsPanel({ storeId }: ListObjectsPanelProps) {
  const client = useConnectionStore((s) => s.client);

  const [user, setUser] = useState("");
  const [relation, setRelation] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [objects, setObjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleList = useCallback(async () => {
    if (!client || !storeId) return;
    setLoading(true);
    setError(null);
    setObjects([]);
    try {
      const res = await client.listObjects(
        {
          user,
          relation,
          type,
        },
        { storeId },
      );
      setObjects(res.objects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "List objects failed");
    } finally {
      setLoading(false);
    }
  }, [client, storeId, user, relation, type]);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-xs font-medium">
          List objects a user has access to
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
            <Label className="text-2xs">Object Type</Label>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="document"
              className="h-7 text-xs"
            />
          </div>
        </div>

        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={handleList}
          disabled={
            !client || !storeId || !user || !relation || !type || loading
          }
        >
          <List className="mr-1 h-3 w-3" />
          {loading ? "Listing..." : "List Objects"}
        </Button>

        {error && (
          <Alert variant="destructive" size="compact">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {objects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {objects.map((obj) => (
              <Badge
                key={obj}
                variant="secondary"
                className="h-5 text-xs font-mono"
              >
                {obj}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
