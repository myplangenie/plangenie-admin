import React from "react";

export function PaymentStatusPill({ status }: { status: 'active'|'pending'|'overdue' }) {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`px-2 py-1 rounded-md text-xs border ${map[status]}`}>{label}</span>;
}

export function UserStatusPill({ status }: { status?: 'active'|'suspended' }) {
  const st = status || 'active';
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    suspended: 'bg-red-100 text-red-700 border-red-200',
  };
  const label = st.charAt(0).toUpperCase() + st.slice(1);
  return <span className={`px-2 py-1 rounded-md text-xs border ${map[st]}`}>{label}</span>;
}

