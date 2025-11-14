"use client";

import React, { useEffect, useState } from "react";
import * as Admin from "@/services/admin";
import { MiniLineChart, SimpleBars } from "@/components/Charts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function OverviewPage() {
  const [data, setData] = useState<Admin.OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await Admin.getOverview();
        if (!cancelled) setData(res);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  const growth = data.growthSeries?.map((p) => p.count) || [];
  const active = data.activeBreakdown?.active || 0;
  const inactive = data.activeBreakdown?.inactive || 0;
  const convPct = Math.round((data.conversionRate || 0) * 100);

  return (
    <div className="space-y-6 text-black">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat"><div className="text-sm text-gray-500">Total Users</div><div className="text-2xl font-semibold">{data.totalUsers}</div></div>
        <div className="stat"><div className="text-sm text-gray-500">Active Users</div><div className="text-2xl font-semibold">{data.activeUsers}</div></div>
        <div className="stat"><div className="text-sm text-gray-500">New Signups</div><div className="text-2xl font-semibold">{data.newSignups}</div></div>
        <div className="stat"><div className="text-sm text-gray-500">Conversion Rate</div><div className="text-2xl font-semibold">{convPct}%</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-black">User Growth</h2>
          </div>
          <div className="mt-2">
            {growth.length ? (
              <MiniLineChart points={growth} />
            ) : (
              <div className="text-sm text-gray-500">No data available.</div>
            )}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-black">Active vs Inactive</h2>
          </div>
          <div className="mt-2">
            <SimpleBars items={[{ label: 'Active', value: active, color: '#16a34a' }, { label: 'Inactive', value: inactive, color: '#ef4444' }]} />
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-medium text-black mb-3">Recent Signups</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentUsers?.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.name || '-'}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
