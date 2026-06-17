"use client";

import { LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConnectionStore } from "@/lib/store/connection-store";

export function Header({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const config = useConnectionStore((s) => s.config);
  const disconnect = useConnectionStore((s) => s.disconnect);

  const handleDisconnect = () => {
    disconnect();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[var(--header-height)] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {children}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-sm tracking-tight"
          >
            <Shield className="h-4 w-4" />
            <span>OpenFGA Dashboard</span>
          </Link>
          {config && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {config.serverUrl}
            </span>
          )}
        </div>
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            className="h-7 text-xs"
          >
            <LogOut className="mr-1 h-3 w-3" />
            Disconnect
          </Button>
        </div>
      </div>
    </header>
  );
}
