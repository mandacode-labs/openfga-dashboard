"use client";

import { Download, ExternalLink, Shield, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnectionStore } from "@/lib/store/connection-store";
import type { AuthMethod, ConnectionConfig } from "@/types";
import { AuthConfigForm } from "./auth-config";

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function ConnectionForm() {
  const router = useRouter();
  const connect = useConnectionStore((s) => s.connect);
  const presets = useConnectionStore((s) => s.presets);
  const _addPreset = useConnectionStore((s) => s.addPreset);
  const setPresets = useConnectionStore((s) => s.setPresets);

  const [serverUrl, setServerUrl] = useState("http://localhost:8080");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("none");
  const [apiKey, setApiKey] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [tokenUrl, setTokenUrl] = useState("");
  const [audience, setAudience] = useState("");
  const [scope, setScope] = useState("openid");

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importConfigRef = useRef<HTMLInputElement>(null);
  const importPresetsRef = useRef<HTMLInputElement>(null);

  const buildConfig = (): ConnectionConfig => {
    switch (authMethod) {
      case "none":
        return { serverUrl, auth: { method: "none" } };
      case "api-key":
        return { serverUrl, auth: { method: "api-key", apiKey } };
      case "oidc":
        return {
          serverUrl,
          auth: {
            method: "oidc",
            clientId,
            clientSecret,
            tokenUrl,
            audience: audience || undefined,
            scope: scope || undefined,
          },
        };
    }
  };

  const loadConfig = (config: ConnectionConfig) => {
    setServerUrl(config.serverUrl);
    setAuthMethod(config.auth.method);
    if (config.auth.method === "api-key") {
      setApiKey(config.auth.apiKey);
    } else if (config.auth.method === "oidc") {
      setClientId(config.auth.clientId);
      setClientSecret(config.auth.clientSecret);
      setTokenUrl(config.auth.tokenUrl);
      setAudience(config.auth.audience || "");
      setScope(config.auth.scope || "");
    }
  };

  const handleConnect = async (config?: ConnectionConfig) => {
    const cfg = config || buildConfig();
    setError(null);
    setConnecting(true);
    try {
      const ok = await connect(cfg);
      if (ok) {
        router.push("/dashboard");
      } else {
        setError("Connection failed. Verify your server URL and credentials.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const handleImportConfig = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const config = (await readJsonFile(file)) as ConnectionConfig;
      if (!config.serverUrl) throw new Error("Missing serverUrl in config");
      loadConfig(config);
      await handleConnect(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid config file");
    }
    e.target.value = "";
  };

  const handleExportConfig = () => {
    downloadJson(buildConfig(), "openfga-connection.json");
  };

  const handleImportPresets = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJsonFile(file);
      if (!Array.isArray(data)) throw new Error("Expected a JSON array");
      setPresets(data as ConnectionConfig[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid presets file");
    }
    e.target.value = "";
  };

  const handleExportPresets = () => {
    if (presets.length === 0) return;
    downloadJson(presets, "openfga-presets.json");
  };

  const handleLoadPreset = (config: ConnectionConfig) => {
    loadConfig(config);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            OpenFGA Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Connect to your OpenFGA server to manage authorization models,
            tuples, and queries.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Connect to Server
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {presets.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs">Saved Presets</Label>
                <div className="space-y-1">
                  {presets.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full text-left rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted transition-colors"
                      onClick={() => handleLoadPreset(preset)}
                    >
                      {preset.serverUrl}
                      <span className="ml-2 text-muted-foreground">
                        ({preset.auth.method})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Server URL</Label>
              <Input
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="h-8 text-xs"
              />
            </div>

            <AuthConfigForm
              method={authMethod}
              onMethodChange={setAuthMethod}
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              clientId={clientId}
              onClientIdChange={setClientId}
              clientSecret={clientSecret}
              onClientSecretChange={setClientSecret}
              tokenUrl={tokenUrl}
              onTokenUrlChange={setTokenUrl}
              audience={audience}
              onAudienceChange={setAudience}
              scope={scope}
              onScopeChange={setScope}
            />

            <ErrorAlert error={error} />

            <Button
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => handleConnect()}
              disabled={!serverUrl || connecting}
            >
              {connecting ? "Connecting..." : "Connect"}
            </Button>

            <div className="flex gap-1.5">
              <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 h-7 rounded-md border px-2.5 text-2xs hover:bg-muted transition-colors">
                <Upload className="h-3 w-3" />
                Import Config
                <input
                  ref={importConfigRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportConfig}
                  className="sr-only"
                />
              </label>
              <button
                type="button"
                className="flex flex-1 cursor-pointer items-center justify-center gap-1 h-7 rounded-md border px-2.5 text-2xs hover:bg-muted transition-colors"
                onClick={handleExportConfig}
              >
                <Download className="h-3 w-3" />
                Export Config
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Upload className="h-3 w-3" />
            Import Presets
            <input
              ref={importPresetsRef}
              type="file"
              accept=".json"
              onChange={handleImportPresets}
              className="sr-only"
            />
          </label>
          {presets.length > 0 && (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleExportPresets}
            >
              <Download className="h-3 w-3" />
              Export Presets
            </button>
          )}
          <a
            href="https://openfga.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Learn more about OpenFGA"
          >
            <ExternalLink className="h-3 w-3" />
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}
