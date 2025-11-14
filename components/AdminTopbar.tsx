"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaBell } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import { useAuthContext } from "@/context/AuthContext";
import { IoIosCalendar } from "react-icons/io";
import * as Admin from "@/services/admin";

export default function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthContext();
  const [unread, setUnread] = useState<number>(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<Admin.Notice[]>([]);
  const bellRef = useRef<HTMLDivElement | null>(null);
  const title = useMemo(() => {
    if (!pathname) return "Admin";
    if (pathname.startsWith("/users/")) return "User Profile";
    if (pathname.startsWith("/users")) return "Users";
    if (pathname.startsWith("/subscriptions")) return "Subscriptions";
    if (pathname.startsWith("/logs")) return "System Logs";
    if (pathname.startsWith("/overview")) return "Overview";
    return "Admin";
  }, [pathname]);

  // Initial load of notifications and badge count
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await Admin.getAdminNotifications();
        if (cancelled) return;
        const items = r.items || [];
        setNotifItems(items);
        setUnread(items.length);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  // Close popover on outside click
  useEffect(() => {
    if (!notifOpen) return;
    function onDocClick(e: MouseEvent) {
      const el = bellRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-7">
      <div className="text-xl font-bold text-primary">{title}</div>
      <div className="flex items-center gap-2">
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => {
              const next = !notifOpen;
              setNotifOpen(next);
              if (next) setUnread(0);
            }}
            aria-label="Notifications"
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
            title="Notifications"
          >
            <FaBell className="text-xl text-black" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EB5757] text-white text-[10px] font-semibold flex items-center justify-center">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[380px] max-h-[360px] overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg z-50">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="text-sm font-semibold">Notifications</div>
                <button
                  className="text-xs text-[#1D4374] hover:underline"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const r = await Admin.getAdminNotifications();
                      setNotifItems(r.items || []);
                    } catch {}
                  }}
                >
                  Refresh
                </button>
              </div>
              <ul className="divide-y divide-gray-100">
                {(notifItems || []).length === 0 ? (
                  <li className="px-4 py-6 text-xs text-gray-500">No notifications.</li>
                ) : (
                  notifItems.map((n, idx) => {
                    const sev = (n.severity || "info").toLowerCase() as Admin.Severity;
                    const dot = sev === 'danger' ? 'bg-[#EB57570D]' : sev === 'success' ? 'bg-[#2AC6700D]' : 'bg-[#EDAE400D]';
                    const border = sev === 'danger' ? 'border-[#EB5757]' : sev === 'success' ? 'border-[#2AC670]' : 'border-[#EDAE4099]';
                    const iconColor = sev === 'danger' ? 'text-[#EB5757]' : sev === 'success' ? 'text-[#2AC670]' : 'text-[#EDAE40]';
                    return (
                      <li
                        key={`${n.nid || idx}`}
                        className={`px-4 py-4 border-0 border-l-[3px] border-solid ${border} cursor-default ${dot}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 size-[40px] flex items-center justify-center rounded-full ${dot}`}>
                            <IoIosCalendar className={`text-xl ${iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-[#111] truncate">{n.title}</div>
                            {n.description ? (
                              <div className="text-[11px] text-[#444] truncate">{n.description}</div>
                            ) : null}
                            {n.time ? (
                              <div className="text-[10px] text-gray-400 mt-1">{n.time}</div>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>
        <button
          aria-label="Log out"
          title="Log out"
          onClick={() => {
            try { logout(); } finally { router.replace('/signin'); }
          }}
          className="inline-flex items-center text-red-600 justify-center w-10 h-10 rounded-full hover:bg-gray-100"
        >
          <FiLogOut className="text-xl" />
        </button>
      </div>
    </header>
  );
}

// Load notifications on mount and update unread badge
// This side effect needs to be declared at end of module body
// but remains within the component scope above for hooks ordering.
