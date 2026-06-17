"use client";

import { Check, FolderTree, List, Network, Timer, Users } from "lucide-react";
import { useState } from "react";
import { PageHeading } from "@/components/ui/page-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckPanel } from "@/features/query/check-panel";
import { ExpandPanel } from "@/features/query/expand-panel";
import { ListObjectsPanel } from "@/features/query/list-objects-panel";
import { ListRelationsPanel } from "@/features/query/list-relations-panel";
import { ListUsersPanel } from "@/features/query/list-users-panel";
import { ReadChangesPanel } from "@/features/query/read-changes-panel";

export default function QueryPage() {
  const [tab, setTab] = useState("check");

  return (
    <div className="space-y-4">
      <PageHeading
        title="Query Operations"
        description="Run authorization queries against your store"
      />

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
          <TabsTrigger value="list-relations" className="text-xs h-7">
            <Network className="mr-1 h-3 w-3" />
            Relations
          </TabsTrigger>
          <TabsTrigger value="changes" className="text-xs h-7">
            <Timer className="mr-1 h-3 w-3" />
            Changes
          </TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="check">
            <CheckPanel />
          </TabsContent>
          <TabsContent value="expand">
            <ExpandPanel />
          </TabsContent>
          <TabsContent value="list-objects">
            <ListObjectsPanel />
          </TabsContent>
          <TabsContent value="list-users">
            <ListUsersPanel />
          </TabsContent>
          <TabsContent value="list-relations">
            <ListRelationsPanel />
          </TabsContent>
          <TabsContent value="changes">
            <ReadChangesPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
