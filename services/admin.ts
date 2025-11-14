"use client";

import { apiFetch } from "@/utils/api";

export type UserRow = {
  _id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  companyName?: string;
  lastActiveAt?: string;
  status?: 'active' | 'suspended';
  planType?: 'Free' | 'Trial' | 'Pro' | 'Enterprise';
};

export type OverviewMetrics = {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  conversionRate: number; // 0..1
  growthSeries: { date: string; count: number }[]; // latest 8 points
  activeBreakdown: { active: number; inactive: number };
  recentUsers: Array<{ _id: string; name: string; email: string; createdAt: string }>;
};

export type SubscriptionRow = {
  _id: string;
  user: { _id: string; email: string; name?: string };
  planType: 'Free' | 'Trial' | 'Pro' | 'Enterprise';
  renewalDate?: string;
  paymentStatus: 'active' | 'pending' | 'overdue';
  amountCents?: number;
};

export type SubscriptionsSummary = {
  totalPaid: number;
  trials: number;
  conversionRate: number; // 0..1
  estMonthlyRevenueCents: number;
  items: SubscriptionRow[];
};

export type SystemLog = { _id: string; time: string; event: string; severity: 'info'|'warning'|'error'; details?: string };

export async function getOverview() {
  return apiFetch<OverviewMetrics>("/api/admin/overview");
}

export async function getUsers(params?: { status?: 'active'|'inactive'|'suspended'|'all'; planType?: 'Free'|'Trial'|'Pro'|'Enterprise'|''; q?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.planType) qs.set('planType', params.planType);
  if (params?.q) qs.set('q', params.q);
  const query = qs.toString();
  return apiFetch<{ items: UserRow[] }>(`/api/admin/users${query ? `?${query}` : ''}`);
}

export async function suspendUser(id: string) {
  return apiFetch<{ ok: boolean; status: 'suspended'|'active' }>(`/api/admin/users/${id}/status`, { method: 'PATCH', body: { status: 'suspended' } });
}
export async function activateUser(id: string) {
  return apiFetch<{ ok: boolean; status: 'suspended'|'active' }>(`/api/admin/users/${id}/status`, { method: 'PATCH', body: { status: 'active' } });
}
export async function deleteUser(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' });
}

export async function getSubscriptions() {
  return apiFetch<SubscriptionsSummary>(`/api/admin/subscriptions`);
}

export async function getLogs() {
  return apiFetch<{ items: SystemLog[] }>(`/api/admin/logs`);
}

// Admin notifications (computed client-side from overview + subscriptions)
export type Severity = 'danger' | 'warning' | 'success' | 'info';
export type Notice = {
  nid: string;
  title: string;
  description?: string;
  severity: Severity;
  time?: string;
  read?: boolean;
};

function relTime(d?: string | Date) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    const now = new Date();
    const diffMs = dt.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return 'today';
    if (diffDays > 0) return `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
    const n = Math.abs(diffDays);
    return `${n} day${n === 1 ? '' : 's'} ago`;
  } catch { return ''; }
}

export async function getAdminNotifications() {
  const [overview, subs] = await Promise.allSettled([
    getOverview(),
    getSubscriptions(),
  ]);
  const notices: Notice[] = [];
  // New signups (recentUsers)
  if (overview.status === 'fulfilled') {
    const recent = overview.value?.recentUsers || [];
    for (const u of recent) {
      const label = (u as any)?.name || (u as any)?.email || 'New user';
      notices.push({
        nid: `signup-${(u as any)?._id}`,
        title: `New signup: ${label}`,
        description: (u as any)?.email || undefined,
        severity: 'success',
        time: relTime((u as any)?.createdAt),
        read: false,
      });
    }
  }
  // Subscriptions: pending/overdue alerts, and upcoming renewals within 7 days
  if (subs.status === 'fulfilled') {
    const items = subs.value?.items || [];
    const now = new Date();
    const near = (d?: string) => {
      if (!d) return false;
      const dt = new Date(d);
      const diff = (dt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
      return diff >= 0 && diff <= 7; // within 7 days
    };
    for (const s of items) {
      const who = s.user?.name || s.user?.email || 'User';
      if (s.paymentStatus === 'overdue') {
        notices.push({
          nid: `sub-overdue-${s._id}`,
          title: `Payment overdue: ${who}`,
          description: `${s.planType} plan`,
          severity: 'danger',
          time: relTime(s.renewalDate),
          read: false,
        });
      } else if (s.paymentStatus === 'pending') {
        notices.push({
          nid: `sub-pending-${s._id}`,
          title: `Pending payment: ${who}`,
          description: `${s.planType} plan`,
          severity: 'warning',
          time: relTime(s.renewalDate),
          read: false,
        });
      } else if (s.paymentStatus === 'active' && near(s.renewalDate)) {
        notices.push({
          nid: `sub-renew-${s._id}`,
          title: `Upcoming renewal: ${who}`,
          description: `${s.planType} plan`,
          severity: 'info',
          time: relTime(s.renewalDate),
          read: false,
        });
      }
    }
  }
  // Sort: danger -> warning -> success -> info, then by time presence
  const rank: Record<Severity, number> = { danger: 0, warning: 1, success: 2, info: 3 };
  notices.sort((a, b) => {
    const r = rank[a.severity] - rank[b.severity];
    if (r !== 0) return r;
    // keep recent signups/renewals toward top if time exists
    return String(b.time || '').localeCompare(String(a.time || ''));
  });
  return { items: notices };
}
