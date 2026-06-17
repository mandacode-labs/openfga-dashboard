"use client";

import { Check, FolderTree, List, Users } from "lucide-react";
import { use, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckPanel } from "@/features/query/check-panel";
import { ExpandPanel } from "@/features/query/expand-panel";
import { ListObjectsPanel } from "@/features/query/list-objects-panel";
import { ListUsersPanel } from "@/features/query/list-users-panel";

export default function QueryPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);

  const [tab, setTab] = useState("check");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight">
          Query Operations
        </h2>
        <p className="text-xs text-muted-foreground">
          Run authorization queries against your store
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-8">
          <TabsTrigger value="check" className="text-xs h-7">
            <Check className="mr-1 h-3 w-3" />
            Check
          </TabsTrigger>
          <TabsTrigger value="expand" className="text-xs h-7">
            <FolderTree className="mr-1 h-3 w-3" />
            Expand
          </TabsTrigger>
          <TabsTrigger value="list-objects" className="text-xs h-7">
            <List className="mr-1 h-3 w-3" />
            List Objects
          </TabsTrigger>
          <TabsTrigger value="list-users" className="text-xs h-7">
            <Users className="mr-1 h-3 w-3" />
            List Users
          </TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="check">
            <CheckPanel storeId={storeId} />
          </TabsContent>
          <TabsContent value="expand">
            <ExpandPanel storeId={storeId} />
          </TabsContent>
          <TabsContent value="list-objects">
            <ListObjectsPanel storeId={storeId} />
          </TabsContent>
          <TabsContent value="list-users">
            <ListUsersPanel storeId={storeId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
