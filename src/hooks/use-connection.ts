"use client";

import { useConnectionStore } from "@/lib/store/connection-store";

export function useConnection() {
  const store = useConnectionStore();

  return {
    isConnected: store.isConnected,
    config: store.config,
    client: store.client,
    currentStore: store.currentStore,
    currentStoreId: store.currentStoreId,

    connect: store.connect,
    disconnect: store.disconnect,
    setCurrentStore: store.setCurrentStore,
  };
}
