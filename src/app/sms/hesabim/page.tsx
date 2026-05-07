import { PagePlaceholder } from "@/components/page-placeholder";

export default function SmsHesabimPage() {
  return (
    <PagePlaceholder
      title="Hesabim"
      description="Profil, sifre ve varsayilan SMS ayarlarinizi guvenli sekilde yonetin."
      items={[
        "Profil bilgileri",
        "Sifre guncelleme",
        "Varsayilan saglayici",
        "Bildirim tercihleri",
        "Guvenlik oturumlari",
      ]}
    />
  );
}
