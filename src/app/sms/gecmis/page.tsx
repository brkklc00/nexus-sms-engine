import { PagePlaceholder } from "@/components/page-placeholder";

export default function SmsGecmisPage() {
  return (
    <PagePlaceholder
      title="SMS Gecmisi"
      description="Toplu ve bireysel SMS hareketlerini zaman filtresiyle inceleyin."
      items={[
        "Bireysel ve toplu gecmis",
        "Durum filtresi",
        "Saglayici filtresi",
        "Tarih araligi secimi",
        "CSV export",
      ]}
    />
  );
}
