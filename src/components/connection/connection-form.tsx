"use client";

import { ExternalLink, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnectionStore } from "@/lib/store/connection-store";
import type { AuthMethod, ConnectionConfig } from "@/types";
import { AuthConfigForm } from "./auth-config";

export function ConnectionForm() {
  const router = useRouter();
  const connect = useConnectionStore((s) => s.connect);

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

  const handleConnect = async () => {
    setError(null);
    setConnecting(true);
    try {
      const ok = await connect(buildConfig());
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
              onClick={handleConnect}
              disabled={!serverUrl || connecting}
            >
              {connecting ? "Connecting..." : "Connect"}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <a
            href="https://openfga.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Learn more about OpenFGA
          </a>
        </div>
      </div>
    </div>
  );
}
