"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { AuthCard } from "@/components/auth-card";

function resolveErrorMessage(errorCode?: string | null) {
  if (!errorCode) return null;
  if (errorCode === "CredentialsSignin") return "E-posta veya sifre hatali.";
  if (errorCode === "Configuration") return "Sistem giris ayari eksik. Lutfen yoneticiyle iletisime gecin.";
  return "Giris yapilamadi. Lutfen bilgilerinizi kontrol edin.";
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(resolveErrorMessage(initialError));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/yonlendir",
    });

    if (result?.error || !result?.ok) {
      setError(resolveErrorMessage(result?.error) ?? "Giris yapilamadi. Lutfen tekrar deneyin.");
      setLoading(false);
      return;
    }
    router.push("/yonlendir");
  }

  return (
    <AuthCard title="NEXUS SMS Engine Girisi" description="Yonetim paneline guvenli erisim">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">E-posta</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="nexus-input text-sm"
              placeholder="ornek@domain.com"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Sifre</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="nexus-input pr-10 text-sm"
              placeholder="Sifrenizi girin"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-2 my-auto h-8 rounded-md border border-white/10 bg-slate-900/80 px-2 text-slate-400 transition hover:text-slate-100"
              aria-label="Sifreyi goster veya gizle"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-slate-900 accent-indigo-500"
          />
          Beni hatirla
        </label>

        {error ? (
          <p className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="nexus-btn-primary w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Giris yapiliyor..." : "Giris Yap"}
        </button>
      </form>
    </AuthCard>
  );
}
