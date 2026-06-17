"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { ConnectionGuard } from "@/components/layout/connection-guard";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ConnectionGuard>
      <div className="flex min-h-screen flex-col">
        <Header>
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </Header>
        <div className="flex flex-1">
          <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
          <main className="flex-1 p-6 md:ml-[var(--sidebar-width)]">
            {children}
          </main>
        </div>
      </div>
    </ConnectionGuard>
  );
}
