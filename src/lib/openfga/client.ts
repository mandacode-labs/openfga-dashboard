import {
  CredentialsMethod,
  OpenFgaClient,
  type UserClientConfigurationParams,
} from "@openfga/sdk";
import type { AuthConfig, ConnectionConfig, TokenCache } from "@/types";

let tokenCache: TokenCache | null = null;

function clearTokenCache(): void {
  tokenCache = null;
}

async function getOidcToken(auth: {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  audience?: string;
  scope?: string;
}): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    return tokenCache.accessToken;
  }

  const response = await fetch("/api/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tokenUrl: auth.tokenUrl,
      clientId: auth.clientId,
      clientSecret: auth.clientSecret,
      audience: auth.audience,
      scope: auth.scope,
    }),
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorBody = await response.json();
      if (errorBody.error) errorDetail = errorBody.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(`OIDC token error: ${errorDetail}`);
  }

  const data = await response.json();
  const expiresIn = data.expires_in || 3600;

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return tokenCache.accessToken;
}

function createClientConfig(
  config: ConnectionConfig,
): UserClientConfigurationParams {
  const base: UserClientConfigurationParams = {
    apiUrl: config.serverUrl,
  };

  switch (config.auth.method) {
    case "none":
      base.credentials = { method: CredentialsMethod.None };
      break;
    case "api-key":
      base.credentials = {
        method: CredentialsMethod.ApiToken,
        config: { token: config.auth.apiKey },
      };
      break;
  }

  return base;
}

async function createOidcClientConfig(
  config: ConnectionConfig & { auth: { method: "oidc" } & AuthConfig },
): Promise<UserClientConfigurationParams> {
  const token = await getOidcToken(config.auth);
  return {
    apiUrl: config.serverUrl,
    credentials: {
      method: CredentialsMethod.ApiToken,
      config: { token },
    },
  };
}

export async function createClient(
  config: ConnectionConfig,
): Promise<OpenFgaClient> {
  if (config.auth.method === "oidc") {
    const clientConfig = await createOidcClientConfig(
      config as ConnectionConfig & { auth: { method: "oidc" } & AuthConfig },
    );
    return new OpenFgaClient(clientConfig);
  }
  return new OpenFgaClient(createClientConfig(config));
}

export async function testConnection(
  config: ConnectionConfig,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = await createClient(config);
    await client.listStores({ pageSize: 1 });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed";
    return { ok: false, error: message };
  }
}

export { clearTokenCache };
