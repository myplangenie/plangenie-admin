"use client";

import React, { useId, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Cell,
  LabelList,
} from "recharts";

// Real line chart for growth (Recharts)
export function MiniLineChart({
  points,
  height = 180,
  color = "#1D4374",
}: {
  points: number[];
  height?: number;
  color?: string;
}) {
  const id = useId();
  const data = useMemo(
    () => points.map((v, i) => ({ name: String(i + 1), value: v })),
    [points]
  );
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: any) => formatNumber(v)} />
          <Tooltip formatter={(v: any) => [formatNumber(v), "Users"]} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${id}-area)`} activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} animationDuration={500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Real bar chart for active vs inactive (Recharts)
export function SimpleBars({
  items,
  height = 180,
}: {
  items: Array<{ label: string; value: number; color?: string }>;
  height?: number;
}) {
  const id = useId();
  const data = useMemo(() => items, [items]);
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 24 }} barCategoryGap="35%" barGap={8}>
          <defs>
            {data.map((d, i) => (
              <linearGradient key={i} id={`${id}-bar-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={d.color || "#1D4374"} stopOpacity={0.9} />
                <stop offset="100%" stopColor={d.color || "#1D4374"} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: any) => formatNumber(v)} />
          <Tooltip formatter={(v: any) => [formatNumber(v), "Users"]} />
          <Bar dataKey="value" name="Users" barSize={36} radius={[8, 8, 0, 0]}>
            <LabelList dataKey="value" position="top" className="text-xs" formatter={(v: any) => formatNumber(v)} />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#${id}-bar-${index})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatNumber(n: number): string {
  try {
    return Number(n).toLocaleString();
  } catch { return String(n); }
}
