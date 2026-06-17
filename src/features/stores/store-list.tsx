"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStores } from "@/hooks/use-openfga";
import { useConnectionStore } from "@/lib/store/connection-store";
import type { Store } from "@/types";
import { CreateStoreDialog } from "./create-store-dialog";
import { StoreCard } from "./store-card";

function StoreCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

export function StoreList() {
  const router = useRouter();
  const { stores, loading, error, refetch } = useStores();
  const currentStore = useConnectionStore((s) => s.currentStore);
  const setCurrentStore = useConnectionStore((s) => s.setCurrentStore);
  const client = useConnectionStore((s) => s.client);

  const [createOpen, setCreateOpen] = useState(false);

  const handleSelect = (store: Store) => {
    setCurrentStore(store);
    router.push(`/dashboard/stores/${store.id}`);
  };

  const handleCreate = useCallback(
    async (name: string) => {
      if (!client) return;
      await client.createStore({ name });
      await refetch();
    },
    [client, refetch],
  );

  const handleDelete = useCallback(
    async (storeId: string) => {
      if (!client) return;
      try {
        await client.deleteStore({ storeId });
        if (currentStore?.id === storeId) {
          setCurrentStore(null);
        }
        await refetch();
      } catch {
        // silently fail
      }
    },
    [client, currentStore, setCurrentStore, refetch],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Stores</h2>
          <p className="text-xs text-muted-foreground">
            {stores.length} store{stores.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={refetch}
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-1 h-3 w-3" />
            New Store
          </Button>
        </div>
      </div>

      {loading && !stores.length && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && stores.length === 0 && (
        <div className="rounded-md border border-dashed px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No stores found. Create one to get started.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            isSelected={currentStore?.id === store.id}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <CreateStoreDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
