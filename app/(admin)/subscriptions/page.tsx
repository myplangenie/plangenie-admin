"use client";

import React, { useEffect, useState } from "react";
import * as Admin from "@/services/admin";
import { PaymentStatusPill } from "@/components/StatusPill";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function money(cents?: number) {
  if (!cents && cents !== 0) return '—';
  return `$${((cents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SubscriptionsPage() {
  const [data, setData] = useState<Admin.SubscriptionsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try { setData(await Admin.getSubscriptions()); }
    catch(e:any){ setError(e?.message || 'Failed to load subscriptions'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  const convPct = Math.round((data.conversionRate || 0) * 100);

  return (
    <div className="space-y-4 text-black">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat"><div className="text-sm text-gray-500">Paid Users</div><div className="text-2xl font-semibold">{data.totalPaid}</div></div>
        <div className="stat"><div className="text-sm text-gray-500">Trial Users</div><div className="text-2xl font-semibold">{data.trials}</div></div>
        <div className="stat"><div className="text-sm text-gray-500">Conversion Rate</div><div className="text-2xl font-semibold">{convPct}%</div></div>
        <div className="stat"><div className="text-sm text-gray-500">Est. Monthly Revenue</div><div className="text-2xl font-semibold">{money(data.estMonthlyRevenueCents)}</div></div>
      </div>

      <div className="card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan Type</TableHead>
              <TableHead>Renewal Date</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((s)=> (
              <TableRow key={s._id}>
                <TableCell>{s.user?.name || s.user?.email}</TableCell>
                <TableCell>{s.planType}</TableCell>
                <TableCell>{s.renewalDate ? new Date(s.renewalDate).toLocaleDateString() : '—'}</TableCell>
                <TableCell><PaymentStatusPill status={s.paymentStatus} /></TableCell>
                <TableCell>{money(s.amountCents)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
