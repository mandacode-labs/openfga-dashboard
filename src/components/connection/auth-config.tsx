"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuthMethod } from "@/types";

interface AuthConfigFormProps {
  method: AuthMethod;
  onMethodChange: (method: AuthMethod) => void;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  clientId: string;
  onClientIdChange: (value: string) => void;
  clientSecret: string;
  onClientSecretChange: (value: string) => void;
  tokenUrl: string;
  onTokenUrlChange: (value: string) => void;
  audience: string;
  onAudienceChange: (value: string) => void;
  scope: string;
  onScopeChange: (value: string) => void;
}

export function AuthConfigForm({
  method,
  onMethodChange,
  apiKey,
  onApiKeyChange,
  clientId,
  onClientIdChange,
  clientSecret,
  onClientSecretChange,
  tokenUrl,
  onTokenUrlChange,
  audience,
  onAudienceChange,
  scope,
  onScopeChange,
}: AuthConfigFormProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Authentication</Label>
        <Select
          value={method}
          onValueChange={(v) => onMethodChange(v as AuthMethod)}
        >
          <SelectTrigger className="h-8 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="api-key">API Key</SelectItem>
            <SelectItem value="oidc">OIDC Client Credentials</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {method === "api-key" && (
        <div className="space-y-1.5">
          <Label className="text-xs">API Key</Label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Enter pre-shared key..."
            className="h-8 text-xs"
          />
        </div>
      )}

      {method === "oidc" && (
        <div className="space-y-2.5">
          <div className="space-y-1.5">
            <Label className="text-xs">Token URL</Label>
            <Input
              value={tokenUrl}
              onChange={(e) => onTokenUrlChange(e.target.value)}
              placeholder="https://auth.example.com/oauth/token"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Client ID</Label>
            <Input
              value={clientId}
              onChange={(e) => onClientIdChange(e.target.value)}
              placeholder="Client ID"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Client Secret</Label>
            <Input
              type="password"
              value={clientSecret}
              onChange={(e) => onClientSecretChange(e.target.value)}
              placeholder="Client Secret"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Audience (optional)</Label>
            <Input
              value={audience}
              onChange={(e) => onAudienceChange(e.target.value)}
              placeholder="https://api.example.com"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Scope (optional)</Label>
            <Input
              value={scope}
              onChange={(e) => onScopeChange(e.target.value)}
              placeholder="openid profile"
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
