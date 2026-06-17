import type {
  AuthorizationModel as SdkAuthorizationModel,
  Store as SdkStore,
  Tuple,
  TupleKey,
  TypeDefinition,
} from "@openfga/sdk";

export type AuthMethod = "none" | "api-key" | "oidc";

export interface AuthConfigNone {
  method: "none";
}

export interface AuthConfigApiKey {
  method: "api-key";
  apiKey: string;
}

export interface AuthConfigOidc {
  method: "oidc";
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  audience?: string;
  scope?: string;
}

export type AuthConfig = AuthConfigNone | AuthConfigApiKey | AuthConfigOidc;

export interface ConnectionConfig {
  serverUrl: string;
  auth: AuthConfig;
}

export type Store = SdkStore;
export type AuthorizationModel = SdkAuthorizationModel;

export type { TypeDefinition, TupleKey, Tuple };

export interface TokenCache {
  accessToken: string;
  expiresAt: number;
}
