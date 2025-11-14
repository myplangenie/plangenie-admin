"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.replace('/signin');
      return;
    }
    if (!user.isAdmin) {
      router.replace('/signin');
    }
  }, [initialized, user, router]);

  if (!initialized) return <div className="p-10 text-sm text-gray-500">Loading…</div>;
  if (!user || !user.isAdmin) return null;
  return <>{children}</>;
}

