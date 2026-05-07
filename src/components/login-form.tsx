"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { AuthCard } from "@/components/auth-card";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/yonlendir",
    });

    if (result?.error) {
      setError("E-posta veya sifre hatali.");
    }
    setLoading(false);
  }

  return (
    <AuthCard title="Nexus SMS Engine Girisi" description="Yonetim paneline guvenli erisim">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">E-posta</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-indigo-400/40 transition focus:ring"
            placeholder="ornek@domain.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Sifre</label>
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 pr-10 text-sm text-white outline-none ring-indigo-400/40 transition focus:ring"
              placeholder="Sifrenizi girin"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-2 my-auto h-8 rounded-md px-2 text-slate-400 hover:text-slate-100"
              aria-label="Sifreyi goster veya gizle"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-slate-900"
          />
          Beni hatirla
        </label>

        {error ? <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Giris yapiliyor..." : "Giris Yap"}
        </button>
      </form>
    </AuthCard>
  );
}
