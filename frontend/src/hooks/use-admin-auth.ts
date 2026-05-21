"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";

export function useAdminAuth() {
  const router = useRouter();
  const { user, token, hydrated, refreshUser } = useAuthStore();
  const [checked, setChecked] = useState(false);

  // Always validate token freshness after hydration.
  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    const run = async () => {
      if (token) await refreshUser();
      if (!cancelled) setChecked(true);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [hydrated, token, refreshUser]);

  useEffect(() => {
    if (!hydrated || !checked) return;
    if (!token || (user && user.role !== "ADMIN")) {
      router.replace("/admin/login");
    }
  }, [hydrated, checked, token, user, router]);

  return { user, ready: hydrated && checked && !!user };
}
