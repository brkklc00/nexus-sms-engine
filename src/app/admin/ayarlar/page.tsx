import { PagePlaceholder } from "@/components/page-placeholder";

export default function AdminAyarlarPage() {
  return (
    <PagePlaceholder
      title="Ayarlar"
      description="Sistem seviyesi SMS ayarlarini ve operasyon tercihlerini bu alandan yonetin."
      items={[
        "Varsayilan chunk boyutu",
        "Rapor senkron araligi",
        "Rate limit varsayilanlari",
        "Genel sistem bildirimleri",
        "Audit policy ayarlari",
      ]}
    />
  );
}
