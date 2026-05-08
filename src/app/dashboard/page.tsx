import { Activity, AlertTriangle, BookOpen, CheckCircle2, Clock3, Coins, MessageSquare, Send } from "lucide-react";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { getCurrentUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const userId = user.id;
  const [today, monthStart] = [new Date(), new Date()];
  today.setHours(0, 0, 0, 0);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const data = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { smsCreditBalance: true } }),
    prisma.smsMessage.count({ where: { userId } }),
    prisma.smsMessage.count({ where: { userId, createdAt: { gte: today } } }),
    prisma.smsMessage.count({ where: { userId, status: "delivered" } }),
    prisma.smsMessage.count({ where: { userId, status: "failed" } }),
    prisma.smsMessage.count({ where: { userId, status: { in: ["queued", "waiting"] } } }),
    prisma.smsCampaign.count({ where: { userId, status: "running" } }),
    prisma.smsPhoneBook.count({ where: { userId } }),
    prisma.smsContact.count({ where: { phoneBook: { userId }, isValid: true } }),
    prisma.smsCampaign.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { name: true, status: true, totalCount: true, deliveredCount: true },
    }),
    prisma.smsMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { createdAt: true, status: true, phoneE164: true, error: true },
    }),
  ]).catch((error) => {
    console.error("[dashboard] query error", error);
    return null;
  });

  if (!data) return <ErrorState />;
  const [credit, totalSms, todaySms, success, failed, pending, activeCampaigns, phoneBooks, totalNumbers, campaigns, recentMessages] = data;
  const stats = [
    { title: "Toplam SMS", value: String(totalSms), icon: MessageSquare, hint: "Tüm zamanlar" },
    { title: "Bugün Gönderilen", value: String(todaySms), icon: Send, hint: "Günlük gönderim" },
    { title: "Başarılı", value: String(success), icon: CheckCircle2, hint: "Teslim edilen SMS" },
    { title: "Başarısız", value: String(failed), icon: AlertTriangle, hint: "Hata alan SMS" },
    { title: "Bekleyen", value: String(pending), icon: Clock3, hint: "Kuyruktaki SMS" },
    { title: "Aktif Kampanya", value: String(activeCampaigns), icon: Activity, hint: "Durum: running" },
    { title: "Toplam Rehber", value: String(phoneBooks), icon: BookOpen, hint: "Kendi rehberleriniz" },
    { title: "Toplam Numara", value: String(totalNumbers), icon: MessageSquare, hint: "Geçerli numaralar" },
    { title: "Kredi Bakiyesi", value: String(credit?.smsCreditBalance ?? 0), icon: Coins, hint: "Anlık bakiye" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="SMS Operasyon Dashboard"
        description="Gönderim performansı, kredi kullanımı, sağlayıcı sağlığı ve kuyruk metriklerini tek merkezden izleyin."
        badge="Müşteri Operasyon"
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => (
          <StatCard key={item.title} title={item.title} value={item.value} hint={item.hint} icon={item.icon} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Aylık Özet" subtitle="Bu ay için güncel değerler">
          <DataTable
            columns={["Metrik", "Değer"]}
            rows={[
              ["Bu ay gönderilen", String(await prisma.smsMessage.count({ where: { userId, createdAt: { gte: monthStart } } }))],
              ["Başarılı", String(success)],
              ["Başarısız", String(failed)],
              ["Bekleyen", String(pending)],
            ]}
          />
        </ChartCard>

        <ChartCard title="Kuyruk Özeti" subtitle="Canlı kuyruk bilgisi">
          <DataTable columns={["Durum", "Adet"]} rows={[["Bekleyen", String(pending)], ["Aktif kampanya", String(activeCampaigns)]]} />
        </ChartCard>

        <ChartCard title="Son Bireysel Mesajlar" subtitle="En yeni 5 kayıt">
          <DataTable
            columns={["Tarih", "Telefon", "Durum"]}
            rows={recentMessages.map((item) => [
              new Date(item.createdAt).toLocaleString("tr-TR"),
              item.phoneE164,
              item.status,
            ])}
          />
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Son Kampanyalar" subtitle="En güncel kampanya listesi">
          <DataTable
            columns={["Kampanya", "Durum", "Gönderim", "Başarı"]}
            rows={campaigns.map((item) => [item.name, item.status, String(item.totalCount), String(item.deliveredCount)])}
          />
        </ChartCard>

        <ChartCard title="Son Aktiviteler" subtitle="Sistem olay kayıtları">
          <DataTable
            columns={["Zaman", "Olay", "Detay"]}
            rows={recentMessages.map((item) => [
              new Date(item.createdAt).toLocaleString("tr-TR"),
              item.status,
              item.error ?? item.phoneE164,
            ])}
          />
        </ChartCard>
      </section>
    </div>
  );
}
