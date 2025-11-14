"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as Admin from "@/services/admin";
import { UserStatusPill } from "@/components/StatusPill";
import { FiSearch, FiRefreshCcw, FiSlash, FiCheckCircle, FiTrash2, FiEye } from "react-icons/fi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UsersPage() {
  const [items, setItems] = useState<Admin.UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'all'|'active'|'inactive'|'suspended'>('all');
  const [planType, setPlanType] = useState<''|'Free'|'Trial'|'Pro'|'Enterprise'>('');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => items, [items]);

  const reset = async () => {
    setStatus('all'); setPlanType(''); setQ(''); await load();
  };

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await Admin.getUsers({ status: status !== 'all' ? status : undefined, planType: planType || undefined, q });
      setItems(res.items);
    } catch (e: any) {
      setError(e?.message || 'Failed to load users');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const initial = (u: Admin.UserRow) => {
    const name = u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ');
    const s = (name || u.email || '').trim();
    return s ? s.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="space-y-4 text-black">

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border rounded pl-9 pr-3 py-4 text-sm"
            placeholder="Search name or email…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter') load(); }}
          />
        </div>
        <select className="border rounded px-3 py-4 text-sm" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <select className="border rounded px-3 py-4 text-sm" value={planType} onChange={(e)=>setPlanType(e.target.value as any)}>
          <option value="">Any plan</option>
          <option value="Free">Free</option>
          <option value="Trial">Trial</option>
          <option value="Pro">Pro</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <button onClick={load} className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white text-sm rounded">
          <FiRefreshCcw className="opacity-90" /> Apply
        </button>
        <button onClick={reset} className="inline-flex items-center gap-2 px-8 py-4 border border-gray-200 text-sm rounded hover:bg-gray-50">
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto text-black">
        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-accent border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No users found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => {
                const name = u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ') || '-';
                return (
                  <TableRow key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {initial(u)}
                        </div>
                        <div>
                          <div className="font-medium text-black mb-2">{name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-black">{u.companyName || '-'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs border border-gray-200 bg-gray-50">{u.planType || 'Free'}</span>
                    </TableCell>
                    <TableCell>{u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString() : '—'}</TableCell>
                    <TableCell><UserStatusPill status={u.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/users/${u._id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                          <FiEye /> View
                        </Link>
                        {u.status !== 'suspended' ? (
                          <button onClick={async()=>{ await Admin.suspendUser(u._id); await load(); }} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-red-200 text-red-700 cursor-pointer hover:bg-red-50">
                            <FiSlash /> Suspend
                          </button>
                        ) : (
                          <button onClick={async()=>{ await Admin.activateUser(u._id); await load(); }} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-green-200 text-green-700 cursor-pointer hover:bg-green-50">
                            <FiCheckCircle /> Activate
                          </button>
                        )}
                        <button onClick={async()=>{ if(confirm('Delete user?')) { await Admin.deleteUser(u._id); await load(); } }} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-gray-200 hover:bg-gray-50">
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
