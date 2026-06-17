"use client";

import { transformer } from "@openfga/syntax-transformer";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Save,
  Upload,
} from "lucide-react";
import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { PageHeading } from "@/components/ui/page-heading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ModelViewer } from "@/features/model/model-viewer";
import { useAuthorizationModels } from "@/hooks/use-openfga";
import { useConnectionStore } from "@/lib/store/connection-store";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> },
);

export default function ModelEditorPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);
  const { models, loading, error, refetch } = useAuthorizationModels(storeId);
  const client = useConnectionStore((s) => s.client);

  const [selectedModelId, setSelectedModelId] = useState("");
  const [dsl, setDsl] = useState("");
  const [originalDsl, setOriginalDsl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedModel = models.find((m) => m.id === selectedModelId);

  useEffect(() => {
    if (models.length > 0 && !selectedModelId) {
      const latest = models[models.length - 1];
      setSelectedModelId(latest.id);
    }
  }, [models, selectedModelId]);

  useEffect(() => {
    if (selectedModel) {
      try {
        const converted = transformer.transformJSONToDSL(selectedModel);
        setDsl(converted);
        setOriginalDsl(converted);
        setSaveSuccess(false);
      } catch {
        setDsl(JSON.stringify(selectedModel, null, 2));
        setOriginalDsl(JSON.stringify(selectedModel, null, 2));
      }
    }
  }, [selectedModel]);

  const handleSave = async () => {
    if (!client || !dsl.trim()) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const model = transformer.transformDSLToJSONObject(dsl);
      await client.writeAuthorizationModel(
        {
          schema_version: model.schema_version,
          type_definitions: model.type_definitions,
        },
        { storeId },
      );
      setOriginalDsl(dsl);
      setSaveSuccess(true);
      await refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save model");
    } finally {
      setSaving(false);
    }
  };

  const isModified = dsl !== originalDsl;

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".fga,.txt,.dsl";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setDsl(reader.result as string);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExport = () => {
    const blob = new Blob([dsl], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model.fga";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <PageHeading
        title="Authorization Model"
        description="Edit the authorization model using the OpenFGA DSL"
      >
        {isModified && (
          <Badge variant="warning" className="text-xs font-normal">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Modified
          </Badge>
        )}
        {!isModified && selectedModel && (
          <Badge variant="secondary" className="text-xs font-normal">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Synced
          </Badge>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={handleImport}
        >
          <Upload className="mr-1 h-3 w-3" />
          Import
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={handleExport}
        >
          <Download className="mr-1 h-3 w-3" />
          Export
        </Button>
        <Select
          value={selectedModelId}
          onValueChange={(v) => setSelectedModelId(v ?? "")}
          disabled={models.length === 0}
        >
          <SelectTrigger className="h-7 w-[180px] text-xs">
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id} className="text-xs">
                v{model.schema_version} — {model.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={handleSave}
          disabled={!isModified || saving}
        >
          <Save className="mr-1 h-3 w-3" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </PageHeading>

      {saveSuccess && (
        <Alert
          size="compact"
          className="bg-success/10 text-success border-success/30"
        >
          <AlertDescription>Model saved successfully</AlertDescription>
        </Alert>
      )}

      <ErrorAlert error={saveError} />

      <ErrorAlert error={error} />

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-[400px] w-full" />
        </div>
      )}

      {!loading && !selectedModel && !error && (
        <div className="rounded-md border border-dashed px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No authorization model found. Create a model in your OpenFGA server.
          </p>
        </div>
      )}

      {selectedModel && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-none overflow-hidden">
            <CardHeader className="pb-2 px-4 pt-3">
              <CardTitle className="text-xs font-medium">DSL Editor</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MonacoEditor
                height="420px"
                language="plaintext"
                theme="vs"
                value={dsl}
                onChange={(v) => setDsl(v || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbersMinChars: 3,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 8 },
                }}
              />
            </CardContent>
          </Card>

          <ModelViewer model={selectedModel} />
        </div>
      )}
    </div>
  );
}
