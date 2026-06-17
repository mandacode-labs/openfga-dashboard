"use client";

import { ArrowLeftRight, Box, Database, GitBranch, Search } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const mainLinks = [{ href: "/dashboard", label: "Stores", icon: Database }];

const storeLinks = [
  { href: "", label: "Overview", icon: Box },
  { href: "/model", label: "Model", icon: GitBranch },
  { href: "/tuples", label: "Tuples", icon: ArrowLeftRight },
  { href: "/query", label: "Query", icon: Search },
];

function SidebarContent() {
  const pathname = usePathname();
  const params = useParams<{ storeId?: string }>();
  const storeId = params.storeId;
  const isStorePage = pathname.startsWith("/dashboard/stores/") && storeId;

  return (
    <nav className="flex-1 py-3 px-2 space-y-1">
      {mainLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
            )}
          >
            <link.icon className="h-4 w-4 shrink-0" />
            {link.label}
          </Link>
        );
      })}

      {isStorePage && (
        <>
          <div className="pt-4 pb-1">
            <p className="px-2.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
              Store
            </p>
          </div>
          {storeLinks.map((link) => {
            const fullHref = `/dashboard/stores/${storeId}${link.href}`;
            const isActive = pathname === fullHref;
            return (
              <Link
                key={link.href}
                href={fullHref}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-[var(--header-height)] bottom-0 w-[var(--sidebar-width)] border-r bg-sidebar flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-[var(--sidebar-width)] p-0 pt-[var(--header-height)]"
        >
          <aside className="flex h-full flex-col bg-sidebar">
            <SidebarContent />
          </aside>
        </SheetContent>
      </Sheet>
    </>
  );
}
