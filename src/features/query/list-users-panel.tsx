"use client";

import { Users } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnectionStore } from "@/lib/store/connection-store";

export function ListUsersPanel() {
  const client = useConnectionStore((s) => s.client);
  const storeId = useConnectionStore((s) => s.currentStoreId);

  const [objectType, setObjectType] = useState("");
  const [objectId, setObjectId] = useState("");
  const [relation, setRelation] = useState("");
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleList = useCallback(async () => {
    if (!client || !storeId) return;
    setLoading(true);
    setError(null);
    setUsers([]);
    try {
      const res = await client.listUsers(
        {
          object: { type: objectType, id: objectId },
          relation,
          user_filters: [{ type: userType }],
        },
        { storeId },
      );
      const userStrings = res.users.map((u) => {
        if (u.object) return `${u.object.type}:${u.object.id}`;
        if (u.userset)
          return `${u.userset.type}:${u.userset.id}#${u.userset.relation}`;
        if (u.wildcard) return `${u.wildcard.type}:*`;
        return "unknown";
      });
      setUsers(userStrings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "List users failed");
    } finally {
      setLoading(false);
    }
  }, [client, storeId, objectType, objectId, relation, userType]);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-xs font-medium">
          List users with access to an object
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-2xs">Object Type</Label>
            <Input
              value={objectType}
              onChange={(e) => setObjectType(e.target.value)}
              placeholder="document"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-2xs">Object ID</Label>
            <Input
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              placeholder="roadmap"
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
            <Label className="text-2xs">User Type Filter</Label>
            <Input
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              placeholder="user"
              className="h-7 text-xs"
            />
          </div>
        </div>

        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={handleList}
          disabled={
            !client ||
            !objectType ||
            !objectId ||
            !relation ||
            !userType ||
            loading
          }
        >
          <Users className="mr-1 h-3 w-3" />
          {loading ? "Listing..." : "List Users"}
        </Button>

        <ErrorAlert error={error} />

        {users.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {users.map((user) => (
              <Badge
                key={user}
                variant="secondary"
                className="h-5 text-xs font-mono"
              >
                {user}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
