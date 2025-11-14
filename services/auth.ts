"use client";

import { apiFetch } from "@/utils/api";

export type LoginInput = { email: string; password: string };

export type AuthUser = {
  _id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  isAdmin?: boolean;
};

const TOKEN_KEY = 'pg_token';

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export async function login(input: LoginInput) {
  const res = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", { method: 'POST', body: input });
  setToken(res.token);
  return res.user;
}

export async function me() {
  // Prefer admin endpoint if present; fallback to /auth/me
  try {
    const r = await apiFetch<{ user: AuthUser }>("/api/admin/me", { method: 'GET' });
    return r.user;
  } catch {
    const r = await apiFetch<{ user: AuthUser }>("/api/auth/me", { method: 'GET' });
    return r.user;
  }
}

