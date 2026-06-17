"use client";

import type { OpenFgaClient } from "@openfga/sdk";
import { create } from "zustand";
import {
  clearTokenCache,
  createClient,
  testConnection,
} from "@/lib/openfga/client";
import type { ConnectionConfig, Store } from "@/types";

interface ConnectionState {
  config: ConnectionConfig | null;
  isConnected: boolean;
  currentStoreId: string | null;
  currentStore: Store | null;
  client: OpenFgaClient | null;

  setConfig: (config: ConnectionConfig) => void;
  connect: (config: ConnectionConfig) => Promise<boolean>;
  disconnect: () => void;
  setCurrentStore: (store: Store | null) => void;
}

export const useConnectionStore = create<ConnectionState>()((set) => ({
  config: null,
  isConnected: false,
  currentStoreId: null,
  currentStore: null,
  client: null,

  setConfig: (config: ConnectionConfig) => {
    set({ config });
  },

  connect: async (config: ConnectionConfig) => {
    const { ok } = await testConnection(config);
    if (!ok) return false;

    const client = await createClient(config);
    set({ config, client, isConnected: true });
    return true;
  },

  disconnect: () => {
    clearTokenCache();
    set({
      isConnected: false,
      client: null,
      currentStoreId: null,
      currentStore: null,
    });
  },

  setCurrentStore: (store: Store | null) => {
    set({
      currentStore: store,
      currentStoreId: store?.id ?? null,
    });
  },
}));
