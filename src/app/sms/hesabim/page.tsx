import { PageHeader } from "@/components/page-header";
import { ErrorState } from "@/components/error-state";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export default async function SmsHesabimPage() {
  const session = await requireSession();
  const user = await prisma.user
    .findUnique({
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
    })
    .catch((error) => {
      console.error("[sms/hesabim] query error", error);
      return null;
    });

  if (!user) return <ErrorState />;

  return (
    <div className="space-y-5">
      <PageHeader title="Hesabım" description="Profil ve kredi bilgilerinizi canlı veriden görüntüleyin." badge="Profil" />
      <section className="nexus-surface rounded-2xl p-5">
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
            <dt className="text-xs uppercase tracking-wide text-slate-400">Oluşturma</dt>
            <dd className="mt-1 text-sm text-slate-100">{new Date(user.createdAt).toLocaleString("tr-TR")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Son Güncelleme</dt>
            <dd className="mt-1 text-sm text-slate-100">{new Date(user.updatedAt).toLocaleString("tr-TR")}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
