"use client";

import React, { useEffect, useState } from "react";
import * as Admin from "@/services/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function Sev({ s }: { s: 'info'|'warning'|'error' }) {
  const map: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200',
  };
  return <span className={`px-2 py-1 rounded-md text-xs border ${map[s]}`}>{s}</span>;
}

export default function LogsPage() {
  const [items, setItems] = useState<Admin.SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try { const r = await Admin.getLogs(); setItems(r.items); }
    catch(e:any){ setError(e?.message || 'Failed to load logs'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="card overflow-x-auto">
        {loading ? <div className="p-4">Loading…</div> : error ? <div className="p-4 text-red-600">{error}</div> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((l) => (
                <TableRow key={l._id}>
                  <TableCell>{new Date(l.time).toLocaleString()}</TableCell>
                  <TableCell>{l.event}</TableCell>
                  <TableCell><Sev s={l.severity} /></TableCell>
                  <TableCell>{l.details || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
