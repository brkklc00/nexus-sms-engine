import { PagePlaceholder } from "@/components/page-placeholder";

export default function AdminKrediHareketleriPage() {
  return (
    <PagePlaceholder
      title="Kredi Hareketleri"
      description="Tum musterilerin kredi hareketlerini denetleyin ve riskli islemleri takip edin."
      items={[
        "Musteri bazli kredi logu",
        "Reserve/release/deduct hareketleri",
        "Admin aksiyon gecmisi",
        "Tarih ve miktar filtreleri",
        "Denetim exportu",
      ]}
    />
  );
}
