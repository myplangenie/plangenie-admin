"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiBarChart2, FiUsers, FiCreditCard, FiFileText, FiUser, FiLogOut } from "react-icons/fi";
import { useAuthContext } from "@/context/AuthContext";

type NavItem = { label: string; href: string; icon: React.ElementType };
const nav: NavItem[] = [
  { label: "Overview", href: "/overview", icon: FiBarChart2 },
  { label: "Users", href: "/users", icon: FiUsers },
  { label: "Subscriptions", href: "/subscriptions", icon: FiCreditCard },
  { label: "System Logs", href: "/logs", icon: FiFileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuOpen) return;
      const el = containerRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const userLabel = useMemo(() => {
    return user?.fullName || user?.email || "User";
  }, [user]);

  return (
    <aside className="hidden md:flex md:flex-col relative w-64 shrink-0 text-white h-full check-bg">
      <div className="px-6 py-8 flex items-center h-16">
        {/* Brand logo to match user-facing dashboard */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-white.svg"
          alt="PlanGenie"
          className="w-[180px] h-auto"
        />
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1">
        {nav.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 px-4 py-5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-[#1a1a1a]"
                  : "hover:bg-white/10 opacity-90"
              }`}
            >
              <Icon
                className={`text-lg ${active ? "opacity-100" : "opacity-90"}`}
                aria-hidden="true"
              />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Bottom profile button + popup */}
      <div className="p-3 border-t border-white/10" ref={containerRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-full text-left"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <div className="flex items-center bg-[#224E87] gap-3 rounded-lg px-3 py-3 text-sm border border-[#265797]">
            <div className="size-[40px] rounded-full bg-white flex items-center justify-center overflow-hidden">
              <FiUser className="text-xl text-primary" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-medium truncate">{userLabel}</div>
              <div className="text-white/90 text-xs">Admin</div>
            </div>
          </div>
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="mt-2 bg-white text-[#1a1a1a] rounded-md shadow-lg border overflow-hidden"
          >
            <button
              className="flex w-full items-center gap-2 text-left px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => {
                try { logout(); } finally { setMenuOpen(false); router.replace('/signin'); }
              }}
            >
              <FiLogOut /> Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
