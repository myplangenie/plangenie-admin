"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import Image from "next/image";
import Logo from "@/public/logo.svg";

export default function SignInPage() {
  const { login } = useAuthContext();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const u = await login({ email, password });
      if (!u.isAdmin) {
        setError("This account is not an admin.");
        return;
      }
      router.replace("/overview");
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm card p-6">
        <Image src={Logo} alt="logo" className="mx-auto block mb-10" />
        {/* <h1 className="text-xl font-semibold mb-4 text-primary">Plan Genie Admin Sign In</h1> */}
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-black mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border text-sm text-black rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-black mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border text-sm text-black rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg text-sm mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
