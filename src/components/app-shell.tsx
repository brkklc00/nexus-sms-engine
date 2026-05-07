"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui";

type NavItem = { href: string; label: string };

const customerNav: NavItem[] = [
  { href: "/dashboard", label: "Panel" },
  { href: "/sms/gonder", label: "SMS Gonder" },
  { href: "/sms/rehberler", label: "SMS Rehberleri" },
  { href: "/sms/kara-liste", label: "SMS Kara Liste" },
  { href: "/sms/bireysel", label: "Bireysel SMS" },
];

const adminNav: NavItem[] = [
  { href: "/admin/kullanicilar", label: "Kullanici Yonetimi" },
  { href: "/admin/saglayicilar", label: "Saglayici Ayarlari" },
  { href: "/admin/gonderimler", label: "Tum SMS Gonderimler" },
  { href: "/admin/rehberler", label: "Tum Telefon Rehberleri" },
  { href: "/admin/kara-liste", label: "Musteri SMS Kara Liste" },
  { href: "/admin/otp-gecmisi", label: "SMS OTP Gecmisi" },
  { href: "/admin/bireysel-gecmis", label: "Bireysel SMS Gecmisi" },
];

export function AppShell({
  children,
  isAdmin = false,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const items = isAdmin ? adminNav : customerNav;
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h1 className="mb-4 text-lg font-semibold">Nexus SMS Engine</h1>
          <nav className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition",
                  pathname.startsWith(item.href)
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="rounded-2xl border border-slate-800 bg-slate-900 p-6">{children}</main>
      </div>
    </div>
  );
}
