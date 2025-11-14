"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace('/overview'); }, [router]);
  return <div className="p-6 text-sm text-gray-500">Redirecting…</div>;
}
