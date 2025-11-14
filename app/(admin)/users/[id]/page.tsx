"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as Admin from "@/services/admin";
import { PaymentStatusPill, UserStatusPill } from "@/components/StatusPill";
import { FiArrowLeft, FiSlash, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type UserDetail = Admin.UserRow & { subscription?: { planType: 'Free'|'Trial'|'Pro'|'Enterprise'; renewalDate?: string; paymentStatus: 'active'|'pending'|'overdue'; amountCents?: number } | null };

function money(cents?: number) {
  if (!cents && cents !== 0) return '—';
  return `$${((cents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'account'|'subscription'>('account');

  async function load() {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/admin/users/${params.id}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(typeof window !== 'undefined' && localStorage.getItem('pg_token') ? { Authorization: `Bearer ${localStorage.getItem('pg_token')}` } : {}) } });
      const payload = await r.json();
      if (!r.ok) throw new Error(payload?.message || 'Failed to load');
      setItem(payload.user);
    } catch (e:any) {
      setError(e?.message || 'Failed to load');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params.id]);

  return (
    <div className="space-y-4">
      {/* Header with quick actions */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} aria-label="Back" className="inline-flex items-center justify-center size-9 rounded-full border border-gray-200 hover:bg-gray-50">
            <FiArrowLeft />
          </button>
          <div className="size-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
            {(() => {
              const s = (item?.fullName || item?.email || '').trim();
              return s ? s.charAt(0).toUpperCase() : '?';
            })()}
          </div>
          <div>
            <div className="text-lg font-semibold text-black">{item?.fullName || [item?.firstName, item?.lastName].filter(Boolean).join(' ') || '—'}</div>
            <div className="text-sm text-gray-500">{item?.email || ''}</div>
          </div>
          {item?.status ? (
            <div className="ml-2"><UserStatusPill status={item.status} /></div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {item?.status !== 'suspended' ? (
            <button
              onClick={async()=>{ if(!item) return; await Admin.suspendUser(item._id); await load(); }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded border border-red-200 text-red-700 hover:bg-red-50"
            >
              <FiSlash /> Suspend
            </button>
          ) : (
            <button
              onClick={async()=>{ if(!item) return; await Admin.activateUser(item._id); await load(); }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded border border-green-200 text-green-700 hover:bg-green-50"
            >
              <FiCheckCircle /> Activate
            </button>
          )}
          <button
            onClick={async()=>{ if(!item) return; if(confirm('Delete user?')) { await Admin.deleteUser(item._id); router.back(); } }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded border border-gray-200 hover:bg-gray-50"
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-accent border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : item && (
        <div className="card">
          {/* Tabs */}
          <div className="border-b px-4">
            <nav className="flex items-center gap-6">
              <button
                className={`py-3 text-sm font-medium border-b-2 ${tab==='account' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-black'}`}
                onClick={()=>setTab('account')}
              >
                Account
              </button>
              <button
                className={`py-3 text-sm font-medium border-b-2 ${tab==='subscription' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-black'}`}
                onClick={()=>setTab('subscription')}
              >
                Subscription
              </button>
            </nav>
          </div>

          {tab === 'account' ? (
            <div className="p-4">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                  <Input disabled value={item.fullName || [item.firstName, item.lastName].filter(Boolean).join(' ') || ''} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <Input disabled value={item.email || ''} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Organization</label>
                  <Input disabled value={item.companyName || ''} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Last Active</label>
                  <Input disabled value={item.lastActiveAt ? new Date(item.lastActiveAt).toLocaleString() : ''} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <div className="h-9 flex items-center">
                    <UserStatusPill status={item.status} />
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Type</TableHead>
                      <TableHead>Renewal Date</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.subscription ? (
                      <TableRow>
                        <TableCell>{item.subscription.planType}</TableCell>
                        <TableCell>{item.subscription.renewalDate ? new Date(item.subscription.renewalDate).toLocaleDateString() : '—'}</TableCell>
                        <TableCell><PaymentStatusPill status={item.subscription.paymentStatus} /></TableCell>
                        <TableCell>{money(item.subscription.amountCents)}</TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-sm text-gray-600">No subscription on record.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
