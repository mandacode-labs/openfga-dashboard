"use client";

import { ArrowLeftRight, ArrowRight, GitBranch, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthorizationModels, useStores } from "@/hooks/use-openfga";
import { useConnectionStore } from "@/lib/store/connection-store";

export default function StoreOverviewPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const router = useRouter();
  const { storeId } = use(params);
  const { stores } = useStores();
  const { models, loading: modelsLoading } = useAuthorizationModels(storeId);
  const setCurrentStore = useConnectionStore((s) => s.setCurrentStore);

  const store = stores.find((s) => s.id === storeId);

  useEffect(() => {
    if (store) setCurrentStore(store);
  }, [store, setCurrentStore]);

  if (!store) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{store.name}</h2>
        <p className="text-xs text-muted-foreground font-mono">{store.id}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              Authorization Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {modelsLoading
                ? "..."
                : `${models.length} version${models.length !== 1 ? "s" : ""}`}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-7 text-xs"
              onClick={() => router.push(`/dashboard/stores/${storeId}/model`)}
            >
              View Model
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Relationship Tuples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">&mdash;</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-7 text-xs"
              onClick={() => router.push(`/dashboard/stores/${storeId}/tuples`)}
            >
              Manage Tuples
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Query Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">4 queries</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-7 text-xs"
              onClick={() => router.push(`/dashboard/stores/${storeId}/query`)}
            >
              Run Queries
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium">Store Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">ID</span>
            <code className="font-mono text-xs">{store.id}</code>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">Name</span>
            <span>{store.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">Created</span>
            <span>{new Date(store.created_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">Updated</span>
            <span>{new Date(store.updated_at).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
