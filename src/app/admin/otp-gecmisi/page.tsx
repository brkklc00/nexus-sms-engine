import { AppShell } from "@/components/app-shell";
import { PagePlaceholder } from "@/components/page-placeholder";

export default function AdminOtpGecmisiPage() {
  return (
    <AppShell isAdmin>
      <PagePlaceholder
        title="SMS OTP Gecmisi"
        description="Gelecekte OTP modulu icin hazirlanan gecmis kayitlarini takip edin."
        items={[
          "OTP teslimat durumu",
          "Saglayici bazli filtre",
          "Kullanici bazli filtre",
          "Olusturma ve son kullanma zamanlari",
          "Maliyet bilgisi",
          "Sayfalama ve export",
        ]}
      />
    </AppShell>
  );
}
