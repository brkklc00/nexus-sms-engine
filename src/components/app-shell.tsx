"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
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
  X,
} from "lucide-react";
import { cn } from "@/lib/ui";

type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }> };

const customerNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sms/gonder", label: "SMS Gonder", icon: Send },
  { href: "/sms/bireysel", label: "Bireysel SMS", icon: MessageSquare },
  { href: "/sms/rehberler", label: "Rehberler", icon: BookOpen },
  { href: "/sms/kara-liste", label: "Kara Liste", icon: ShieldAlert },
  { href: "/sms/kampanyalar", label: "Kampanyalar", icon: BarChart3 },
  { href: "/sms/gecmis", label: "Gecmis", icon: History },
  { href: "/sms/kredi-hareketleri", label: "Kredi Hareketleri", icon: CreditCard },
  { href: "/sms/hesabim", label: "Hesabim", icon: Settings },
];

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/gonderimler", label: "Kampanyalar", icon: BarChart3 },
  { href: "/admin/rehberler", label: "Rehberler", icon: BookOpen },
  { href: "/admin/kara-liste", label: "Kara Liste", icon: ShieldAlert },
  { href: "/admin/bireysel-gecmis", label: "Bireysel Gecmis", icon: History },
  { href: "/admin/kullanicilar", label: "Kullanicilar", icon: Users },
  { href: "/admin/saglayicilar", label: "Saglayicilar", icon: Gauge },
  { href: "/admin/kredi-hareketleri", label: "Kredi Hareketleri", icon: CreditCard },
  { href: "/admin/otp-gecmisi", label: "OTP Gecmisi", icon: MessageSquare },
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(79,70,229,0.16),_transparent_35%),#020617] text-slate-100">
      <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-6">
        <header className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 backdrop-blur">
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[88px_1fr]">
          <aside
            className={cn(
              "rounded-2xl border border-white/10 bg-slate-900/80 p-3 backdrop-blur md:block",
              mobileOpen ? "block" : "hidden",
            )}
          >
          <div className="mb-3 flex items-center justify-center md:mb-4">
            <div className="rounded-xl border border-white/10 bg-slate-950 p-2">
              <Image
                src="https://i.ibb.co/gLk7x7JD/nexus-logo-1.png"
                alt="NEXUS logo"
                width={110}
                height={34}
                className="h-7 w-auto object-contain md:h-6"
              />
            </div>
          </div>
          <nav className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                )}
                title={item.label}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="md:hidden">{item.label}</span>
              </Link>
            ))}
          </nav>
          </aside>
          <main className="space-y-5 rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
