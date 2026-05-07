import { AppShell } from "@/components/app-shell";
import { PagePlaceholder } from "@/components/page-placeholder";

export default function DashboardPage() {
  return (
    <AppShell>
      <PagePlaceholder
        title="Genel Dashboard"
        description="Bugun gonderilen SMS, kredi kullanimi, aktif kampanyalar, teslimat metrikleri ve kuyruk durumlarini tek ekranda izleyin."
        items={[
          "Bugun gonderilen toplam SMS",
          "Kullanilan kredi",
          "Aktif kampanya sayisi",
          "Teslim edildi / basarisiz / bekliyor dagilimi",
          "Saglayici bakiye ozeti",
          "Sinirli son aktivite listesi",
        ]}
      />
    </AppShell>
  );
}
