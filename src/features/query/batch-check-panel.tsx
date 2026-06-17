"use client";

import { Gauge, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { useConnectionStore } from "@/lib/store/connection-store";

interface BatchCheckRow {
  user: string;
  relation: string;
  object: string;
}

interface BatchResult {
  index: number;
  allowed: boolean | null;
  error?: string;
}

export function BatchCheckPanel() {
  const client = useConnectionStore((s) => s.client);
  const storeId = useConnectionStore((s) => s.currentStoreId);

  const [rows, setRows] = useState<BatchCheckRow[]>([
    { user: "", relation: "", object: "" },
  ]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Map<number, BatchResult>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const addRow = () => {
    setRows((prev) => [...prev, { user: "", relation: "", object: "" }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (
    index: number,
    field: keyof BatchCheckRow,
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const handleRun = useCallback(async () => {
    if (!client || !storeId) return;
    setRunning(true);
    setError(null);
    const newResults = new Map<number, BatchResult>();

    const validRows = rows
      .map((r, i) => ({ ...r, index: i }))
      .filter((r) => r.user && r.relation && r.object);

    if (validRows.length === 0) {
      setRunning(false);
      return;
    }

    try {
      const res = await client.batchCheck(
        {
          checks: validRows.map((r) => ({
            user: r.user,
            relation: r.relation,
            object: r.object,
          })),
        },
        { storeId },
      );

      for (const item of res.result) {
        const row = validRows.find(
          (r) =>
            r.user === item.request.user &&
            r.relation === item.request.relation &&
            r.object === item.request.object,
        );
        if (row) {
          newResults.set(row.index, {
            index: row.index,
            allowed: item.allowed ?? false,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch check failed");
    }

    setResults(newResults);
    setRunning(false);
  }, [client, storeId, rows]);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 px-4 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium">
            Run multiple access checks at once
          </CardTitle>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleRun}
            disabled={running}
          >
            <Gauge className="mr-1 h-3 w-3" />
            {running ? "Running..." : "Run All"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <ErrorAlert error={error} />

        <div className="space-y-2">
          {rows.map((row, i) => {
            const result = results.get(i);
            return (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={row.user}
                  onChange={(e) => updateRow(i, "user", e.target.value)}
                  placeholder="user:anne"
                  className="h-7 text-xs flex-1"
                />
                <Input
                  value={row.relation}
                  onChange={(e) => updateRow(i, "relation", e.target.value)}
                  placeholder="viewer"
                  className="h-7 text-xs flex-1"
                />
                <Input
                  value={row.object}
                  onChange={(e) => updateRow(i, "object", e.target.value)}
                  placeholder="document:X"
                  className="h-7 text-xs flex-1"
                />
                {result && (
                  <Badge
                    variant={result.allowed ? "secondary" : "destructive"}
                    className="h-5 text-2xs shrink-0"
                  >
                    {result.allowed ? "ALLOWED" : "DENIED"}
                  </Badge>
                )}
                {rows.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(i)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs w-full"
          onClick={addRow}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Row
        </Button>
      </CardContent>
    </Card>
  );
}
