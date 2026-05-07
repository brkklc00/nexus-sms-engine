import { PagePlaceholder } from "@/components/page-placeholder";

export default function AdminGonderimlerPage() {
  return (
    <PagePlaceholder
      title="Tum SMS Gonderimler"
      description="Tum musterilere ait kampanya gecmisini filtreleyin, rapor senkronu calistirin, kampanya detaylarini inceleyin."
      items={[
        "Global kampanya gecmisi",
        "Arama/filtre/pagination",
        "Kampanya detay gorunumu",
        "Rapor senkron tetikleme",
        "Kuyruktaki kampanyalari iptal",
        "Export islemleri",
      ]}
    />
  );
}
