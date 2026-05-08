"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  Gauge,
  History,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Send,
  Settings,
  ShieldAlert,
  Users,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/ui";

type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }> };

const customerNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sms/gonder", label: "SMS Gönder", icon: Send },
  { href: "/sms/bireysel", label: "Bireysel SMS", icon: MessageSquare },
  { href: "/sms/rehberler", label: "Rehberler", icon: BookOpen },
  { href: "/sms/kara-liste", label: "Kara Liste", icon: ShieldAlert },
  { href: "/sms/kampanyalar", label: "Kampanyalar", icon: BarChart3 },
  { href: "/sms/gecmis", label: "Geçmiş", icon: History },
  { href: "/sms/kredi-hareketleri", label: "Kredi Hareketleri", icon: CreditCard },
  { href: "/sms/hesabim", label: "Hesabım", icon: Settings },
];

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/gonderimler", label: "Tüm Gönderimler", icon: BarChart3 },
  { href: "/admin/rehberler", label: "Rehberler", icon: BookOpen },
  { href: "/admin/kara-liste", label: "Kara Liste", icon: ShieldAlert },
  { href: "/admin/bireysel-gecmis", label: "Bireysel Geçmiş", icon: History },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/saglayicilar", label: "Sağlayıcılar", icon: Gauge },
  { href: "/admin/kredi-hareketleri", label: "Kredi Hareketleri", icon: CreditCard },
  { href: "/admin/otp-gecmisi", label: "OTP Geçmişi", icon: MessageSquare },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
];

export function AppShell({
  children,
  role = "customer",
}: {
  children: React.ReactNode;
  role?: "admin" | "customer";
}) {
  const pathname = usePathname();
  const items = role === "admin" ? adminNav : customerNav;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="nexus-bg min-h-screen text-slate-100">
      <div className="mx-auto max-w-[1500px] px-3 py-4 md:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[76px_1fr]">
          <aside
            className={cn(
              "nexus-surface sticky top-4 flex h-[calc(100vh-2rem)] flex-col rounded-2xl p-2",
              mobileOpen ? "block" : "hidden md:flex",
            )}
          >
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-xl border border-indigo-400/30 bg-slate-950 p-2 shadow-[0_0_28px_rgba(79,70,229,0.25)]">
                <Image
                  src="https://i.ibb.co/gLk7x7JD/nexus-logo-1.png"
                  alt="NEXUS logo"
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain"
                />
              </div>
            </div>
            <nav className="flex-1 space-y-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center justify-center rounded-xl px-3 py-2.5 text-sm transition md:px-0",
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "border border-indigo-400/50 bg-gradient-to-br from-indigo-500/25 to-sky-400/20 text-indigo-100 shadow-[0_0_24px_rgba(79,70,229,0.28)]"
                      : "border border-transparent text-slate-400 hover:bg-slate-800/80 hover:text-slate-100",
                  )}
                  title={item.label}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="ml-3 md:hidden">{item.label}</span>
                </Link>
              ))}
            </nav>
            <button
              onClick={() => void signOut({ callbackUrl: "/login" })}
              className="mt-2 flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-3 md:hidden">Çıkış Yap</span>
            </button>
          </aside>

          <div className="space-y-4">
            <header className="nexus-surface flex items-center justify-between rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-white/10 bg-slate-950 p-1.5">
                  <Image
                    src="https://i.ibb.co/gLk7x7JD/nexus-logo-1.png"
                    alt="NEXUS"
                    width={84}
                    height={26}
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-indigo-300">NEXUS</p>
                  <h2 className="text-sm font-medium text-slate-100">SMS Operasyon Merkezi</h2>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="rounded-lg border border-white/10 bg-slate-800 p-2 md:hidden"
                aria-label="Menüyü aç"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </header>
            <main className="space-y-5">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
