"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConnectionStore } from "@/lib/store/connection-store";

export function ConnectionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isConnected = useConnectionStore((s) => s.isConnected);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !isConnected) {
      router.replace("/");
    }
  }, [ready, isConnected, router]);

  if (!ready) return null;
  if (!isConnected) return null;

  return <>{children}</>;
}
