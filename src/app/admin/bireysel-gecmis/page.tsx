import { AppShell } from "@/components/app-shell";
import { PagePlaceholder } from "@/components/page-placeholder";

export default function AdminBireyselGecmisPage() {
  return (
    <AppShell isAdmin>
      <PagePlaceholder
        title="Bireysel SMS Gecmisi"
        description="Tum bireysel SMS kayitlarini kullanici/saglayici/durum/tarih filtreleriyle yonetin."
        items={[
          "Global bireysel SMS gecmisi",
          "Kullanici ve saglayici filtreleri",
          "Durum ve tarih filtreleri",
          "Rapor senkron tetikleme",
          "Sayfalama",
          "Export",
        ]}
      />
    </AppShell>
  );
}
