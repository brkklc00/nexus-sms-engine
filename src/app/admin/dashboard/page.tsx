import { Activity, MessageSquare, ShieldCheck, Users, Wallet, Zap } from "lucide-react";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const data = await Promise.all([
    Promise.all([
      prisma.user.count({ where: { role: "customer" } }),
      prisma.user.count({ where: { role: "customer", isActive: true } }),
    ]),
    prisma.user.aggregate({ _sum: { smsCreditBalance: true } }),
    Promise.all([
      prisma.smsMessage.count({ where: { createdAt: { gte: today } } }),
      prisma.smsMessage.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.smsMessage.count({ where: { status: "delivered" } }),
      prisma.smsMessage.count({ where: { status: "failed" } }),
      prisma.smsMessage.count({ where: { status: { in: ["queued", "waiting"] } } }),
    ]),
    Promise.all([
      prisma.smsCampaign.count(),
      prisma.smsCampaign.count({ where: { status: "running" } }),
      prisma.smsCampaign.count({ where: { status: "queued" } }),
      prisma.smsCampaign.count({ where: { status: "completed" } }),
    ]),
    Promise.all([prisma.smsProvider.count(), prisma.smsProvider.count({ where: { isActive: true } })]),
  ]).catch((error) => {
    console.error("[admin/dashboard] query error", error);
    return null;
  });

  if (!data) return <ErrorState />;
  const [users, credits, messages, campaigns, providers] = data;
  const [totalUsers, activeUsers] = users;
  const [todayMessages, monthMessages, successMessages, failedMessages, pendingMessages] = messages;
  const [totalCampaigns, runningCampaigns, queuedCampaigns, completedCampaigns] = campaigns;
  const [totalProviders, activeProviders] = providers;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kontrol Merkezi"
        description="SMS operasyonları, sağlayıcı sağlığı, kredi ve kampanya akışını tek ekrandan yönetin."
        badge={`Kuyruk Bekleyen: ${pendingMessages}`}
      />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Toplam Müşteri" value={String(totalUsers)} hint={`${activeUsers} aktif hesap`} icon={Users} />
        <StatCard title="Bugün Gönderilen" value={String(todayMessages)} hint={`Bu ay: ${monthMessages}`} icon={Zap} />
        <StatCard title="Toplam Kredi" value={String(credits._sum.smsCreditBalance ?? 0)} hint="Sistem bakiyesi" icon={Wallet} />
        <StatCard title="Aktif Sağlayıcı" value={`${activeProviders}/${totalProviders}`} hint="Sağlayıcı sağlığı" icon={ShieldCheck} />
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Mesaj Durum Özeti">
          <DataTable
            columns={["Metrik", "Değer", "Not"]}
            rows={[
              ["Başarılı SMS", String(successMessages), "Durum: delivered"],
              ["Başarısız SMS", String(failedMessages), "Durum: failed"],
              ["Bekleyen SMS", String(pendingMessages), "Durum: queued/waiting"],
            ]}
          />
        </ChartCard>
        <ChartCard title="Kampanya ve Kuyruk Özeti">
          <DataTable
            columns={["Başlık", "Değer", "Açıklama"]}
            rows={[
              ["Toplam Kampanya", String(totalCampaigns), "Tüm zamanlar"],
              ["Aktif Kampanya", String(runningCampaigns), "Durum: running"],
              ["Kuyrukta Kampanya", String(queuedCampaigns), "Durum: queued"],
              ["Tamamlanan Kampanya", String(completedCampaigns), "Durum: completed"],
              ["Kuyrukta Mesaj", String(pendingMessages), "Bekleyen job yaklaşımı"],
            ]}
          />
        </ChartCard>
      </section>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Başarılı SMS" value={String(successMessages)} hint="Tüm zamanlar" icon={MessageSquare} />
        <StatCard title="Başarısız SMS" value={String(failedMessages)} hint="Tüm zamanlar" icon={Activity} />
        <StatCard title="Bekleyen SMS" value={String(pendingMessages)} hint="Kuyruk" icon={Activity} />
        <StatCard title="Aktif Kampanya" value={String(runningCampaigns)} hint="Canlı operasyon" icon={ShieldCheck} />
      </section>
    </div>
  );
}
