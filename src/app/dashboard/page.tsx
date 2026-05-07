import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Coins,
  MessageSquare,
  Radio,
  Send,
} from "lucide-react";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";

export default function DashboardPage() {
  const stats = [
    { title: "Toplam SMS", value: "128.430", icon: MessageSquare, hint: "Bu ay tum kanallar" },
    { title: "Bugun Gonderilen", value: "2.148", icon: Send, hint: "Dun'e gore +12%" },
    { title: "Basarili", value: "%96.4", icon: CheckCircle2, hint: "Teslimat orani" },
    { title: "Basarisiz", value: "78", icon: AlertTriangle, hint: "Son 24 saat" },
    { title: "Bekleyen", value: "234", icon: Clock3, hint: "Kuyruktaki mesajlar" },
    { title: "Aktif Kampanya", value: "6", icon: Activity, hint: "Calisan kampanyalar" },
    { title: "Toplam Rehber", value: "42", icon: BookOpen, hint: "Musteri bazli" },
    { title: "Toplam Numara", value: "74.920", icon: BarChart3, hint: "Dogrulanmis kayitlar" },
    { title: "Kredi Bakiyesi", value: "18.540", icon: Coins, hint: "Tahmini 12.1K SMS" },
    { title: "Saglayici Durumu", value: "Canli", icon: Radio, hint: "Uipapp ana hatti aktif" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="SMS Operasyon Dashboard"
        description="Gonderim performansi, kredi kullanimi, saglayici sagligi ve kuyruk metriklerini tek merkezden izleyin."
        badge="Musteri Operasyon"
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => (
          <StatCard key={item.title} title={item.title} value={item.value} hint={item.hint} icon={item.icon} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Son 7 Gun Gonderim Trendi" subtitle="Gunluk toplam gonderim">
          <div className="grid grid-cols-7 gap-2">
            {[42, 55, 48, 61, 74, 68, 79].map((value, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-md bg-indigo-500/70"
                  style={{ height: `${Math.max(20, value)}px` }}
                />
                <span className="text-[10px] text-slate-400">G{idx + 1}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Basarisizlik Dagilimi" subtitle="Son 24 saat">
          <div className="space-y-2">
            {[
              ["Gecersiz numara", "41%"],
              ["Saglayici timeout", "29%"],
              ["Blacklist", "18%"],
              ["Diger", "12%"],
            ].map(([label, pct]) => (
              <div key={label} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-sm">
                <span className="text-slate-300">{label}</span>
                <span className="font-medium text-slate-100">{pct}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Kuyruk Ozeti" subtitle="Canli kuyruk bilgisi">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
              <span className="text-slate-300">sms-send</span>
              <span className="text-slate-100">234 bekliyor</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
              <span className="text-slate-300">sms-report-sync</span>
              <span className="text-slate-100">16 senkronize ediliyor</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
              <span className="text-slate-300">Ortalama islem suresi</span>
              <span className="text-slate-100">1.8 sn</span>
            </div>
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Son Kampanyalar" subtitle="En guncel kampanya listesi">
          <DataTable
            columns={["Kampanya", "Durum", "Gonderim", "Basari"]}
            rows={[
              ["Indirim_Bulteni_1", "Calisiyor", "12.000", "%97"],
              ["Hatirlatma_2026_05", "Tamamlandi", "4.200", "%95"],
              ["Kargo_Bilgi", "Beklemede", "1.400", "-"],
            ]}
          />
        </ChartCard>

        <ChartCard title="Son Aktiviteler" subtitle="Sistem olay kayitlari">
          <DataTable
            columns={["Zaman", "Olay", "Detay"]}
            rows={[
              ["16:40", "Rapor senkron", "Kampanya #CMP-1021"],
              ["16:28", "Toplu gonderim", "2.000 alici kuyruga alindi"],
              ["16:10", "Kredi hareketi", "250 kredi dusumu"],
            ]}
          />
        </ChartCard>
      </section>
    </div>
  );
}
