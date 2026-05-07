import { AppShell } from "@/components/app-shell";
import { PagePlaceholder } from "@/components/page-placeholder";

export default function AdminSaglayicilarPage() {
  return (
    <AppShell isAdmin>
      <PagePlaceholder
        title="Saglayici Ayarlari"
        description="SMS saglayicilarini yonetin, tokeni sifreli saklayin, bakiye/fiyat testleri yapin ve oncelik-limit kurallarini belirleyin."
        items={[
          "Saglayici ekle/duzenle",
          "Sifreli token saklama",
          "Aktif/Pasif ve oncelik",
          "Bakiye ve fiyat cekme testleri",
          "Saatlik/gunluk limitler",
          "Timeout ve retry ayarlari",
        ]}
      />
    </AppShell>
  );
}
