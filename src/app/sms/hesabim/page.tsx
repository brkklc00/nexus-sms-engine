import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export default async function SmsHesabimPage() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
      isActive: true,
      smsCreditBalance: true,
      smsMarkupPercent: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return (
    <div className="space-y-5">
      <PageHeader title="Hesabim" description="Profil ve kredi bilgilerinizi canli veriden goruntuleyin." badge="Profil" />
      <section className="nexus-surface rounded-2xl p-5">
        {!user ? (
          <p className="text-sm text-slate-300">Kullanici bilgisi bulunamadi.</p>
        ) : (
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Ad Soyad</dt>
              <dd className="mt-1 text-sm text-slate-100">{user.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">E-posta</dt>
              <dd className="mt-1 text-sm text-slate-100">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Rol</dt>
              <dd className="mt-1 text-sm text-slate-100">{user.role}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Durum</dt>
              <dd className="mt-1 text-sm text-slate-100">{user.isActive ? "Aktif" : "Pasif"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Kredi Bakiyesi</dt>
              <dd className="mt-1 text-sm text-slate-100">{String(user.smsCreditBalance)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Markup %</dt>
              <dd className="mt-1 text-sm text-slate-100">{String(user.smsMarkupPercent)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Olusturma</dt>
              <dd className="mt-1 text-sm text-slate-100">{new Date(user.createdAt).toLocaleString("tr-TR")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Son Guncelleme</dt>
              <dd className="mt-1 text-sm text-slate-100">{new Date(user.updatedAt).toLocaleString("tr-TR")}</dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
}
