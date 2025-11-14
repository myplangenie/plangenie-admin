"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as Auth from "@/services/auth";

export type AuthContextValue = {
  user: Auth.AuthUser | null;
  loading: boolean;
  initialized: boolean;
  login: (input: Auth.LoginInput) => Promise<Auth.AuthUser>;
  fetchMe: () => Promise<Auth.AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Auth.AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const login = useCallback(async (input: Auth.LoginInput) => {
    setLoading(true);
    try {
      const u = await Auth.login(input);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const u = await Auth.me();
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    Auth.clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    const token = Auth.getToken();
    if (token) {
      fetchMe().finally(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  }, [fetchMe]);

  const value = useMemo<AuthContextValue>(() => ({ user, loading, initialized, login, fetchMe, logout }), [user, loading, initialized, login, fetchMe, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

