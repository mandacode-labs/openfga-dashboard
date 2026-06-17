"use client";

import type { CheckRequestTupleKey } from "@openfga/sdk";
import { Gavel, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnectionStore } from "@/lib/store/connection-store";

type AssertionRow = CheckRequestTupleKey & { expectation: boolean };

export function AssertionsPanel() {
  const client = useConnectionStore((s) => s.client);
  const storeId = useConnectionStore((s) => s.currentStoreId);

  const [assertions, setAssertions] = useState<AssertionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Map<number, boolean | null>>(
    new Map(),
  );
  const [error, setError] = useState<string | null>(null);

  const fetchAssertions = useCallback(async () => {
    if (!client || !storeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await client.readAssertions({ storeId });
      const list: AssertionRow[] = (res.assertions || []).map((a) => ({
        user: a.tuple_key.user,
        relation: a.tuple_key.relation,
        object: a.tuple_key.object,
        expectation: a.expectation,
      }));
      setAssertions(list);
      setResults(new Map());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load assertions",
      );
    } finally {
      setLoading(false);
    }
  }, [client, storeId]);

  useEffect(() => {
    fetchAssertions();
  }, [fetchAssertions]);

  const addRow = () => {
    setAssertions((prev) => [
      ...prev,
      { user: "", relation: "", object: "", expectation: true },
    ]);
  };

  const removeRow = (index: number) => {
    setAssertions((prev) => prev.filter((_, i) => i !== index));
    setResults((prev) => {
      const next = new Map(prev);
      next.delete(index);
      return next;
    });
  };

  const updateRow = (
    index: number,
    field: keyof AssertionRow,
    value: string | boolean,
  ) => {
    setAssertions((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  };

  const handleSave = async () => {
    if (!client || !storeId) return;
    setSaving(true);
    setError(null);
    try {
      const body: AssertionRow[] = assertions.map((a) => ({
        user: a.user,
        relation: a.relation,
        object: a.object,
        expectation: a.expectation,
      }));
      await client.writeAssertions(body, { storeId });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save assertions",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    if (!client || !storeId) return;
    setRunning(true);
    setError(null);
    const newResults = new Map<number, boolean | null>();
    for (let i = 0; i < assertions.length; i++) {
      const a = assertions[i];
      if (!a.user || !a.relation || !a.object) continue;
      try {
        const res = await client.check(
          { user: a.user, relation: a.relation, object: a.object },
          { storeId },
        );
        newResults.set(i, res.allowed ?? false);
      } catch {
        newResults.set(i, null);
      }
    }
    setResults(newResults);
    setRunning(false);
  };

  const getResultStatus = (
    index: number,
  ): "pass" | "fail" | "error" | "pending" => {
    const result = results.get(index);
    if (result === undefined || result === null) return "pending";
    const assertion = assertions[index];
    if (!assertion) return "pending";
    return result === assertion.expectation ? "pass" : "fail";
  };

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 px-4 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium">
            Model Assertions
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={fetchAssertions}
              disabled={loading}
            >
              Reload
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleSave}
              disabled={saving || assertions.length === 0}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleRun}
              disabled={running || assertions.length === 0}
            >
              <Gavel className="mr-1 h-3 w-3" />
              {running ? "Running..." : "Run All"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <ErrorAlert error={error} />

        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}

        {!loading && assertions.length === 0 && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            No assertions defined. Add assertions to test your authorization
            model.
          </div>
        )}

        {assertions.map((a, i) => {
          const status = getResultStatus(i);
          return (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={a.user}
                onChange={(e) => updateRow(i, "user", e.target.value)}
                placeholder="user:anne"
                className="h-7 text-xs flex-1"
              />
              <Input
                value={a.relation}
                onChange={(e) => updateRow(i, "relation", e.target.value)}
                placeholder="viewer"
                className="h-7 text-xs flex-1"
              />
              <Input
                value={a.object}
                onChange={(e) => updateRow(i, "object", e.target.value)}
                placeholder="document:X"
                className="h-7 text-xs flex-1"
              />
              <Select
                value={a.expectation ? "true" : "false"}
                onValueChange={(v) => updateRow(i, "expectation", v === "true")}
              >
                <SelectTrigger className="h-7 w-20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">ALLOWED</SelectItem>
                  <SelectItem value="false">DENIED</SelectItem>
                </SelectContent>
              </Select>
              {status !== "pending" && (
                <Badge
                  variant={status === "pass" ? "secondary" : "destructive"}
                  className="h-5 text-2xs"
                >
                  {status === "pass" ? "PASS" : "FAIL"}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeRow(i)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          );
        })}

        {!loading && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs w-full"
            onClick={addRow}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Assertion
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
