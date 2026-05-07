import { ShieldCheck, Users, Wallet, Zap } from "lucide-react";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Admin Dashboard"
        description="Tum musterilerin SMS operasyonlarini, kredi hareketlerini ve saglayici performansini merkezi olarak yonetin."
        badge="Yonetici Operasyon"
      />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Toplam Musteri" value="128" hint="113 aktif hesap" icon={Users} />
        <StatCard title="Aylik Gonderim" value="1.2M" hint="Tum musteriler" icon={Zap} />
        <StatCard title="Toplam Kredi" value="984.230" hint="Sistem bakiyesi" icon={Wallet} />
        <StatCard title="Saglayici Sagligi" value="Stabil" hint="99.91% uptime" icon={ShieldCheck} />
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Saglayici Bazli Durum Ozeti">
          <DataTable
            columns={["Saglayici", "Basari", "Bekleyen", "Hata"]}
            rows={[
              ["Uipapp / Dise", "%96.8", "120", "44"],
              ["Yedek Saglayici", "%94.4", "16", "9"],
            ]}
          />
        </ChartCard>
        <ChartCard title="Son Kritik Olaylar">
          <DataTable
            columns={["Saat", "Kategori", "Bilgi"]}
            rows={[
              ["16:42", "Rate limit", "Musteri #U-24 icin limit yaklasimi"],
              ["16:31", "Fiyat guncelleme", "Uipapp fiyat cache yenilendi"],
              ["16:19", "Kampanya", "CMP-552 manuel iptal edildi"],
            ]}
          />
        </ChartCard>
      </section>
    </div>
  );
}
