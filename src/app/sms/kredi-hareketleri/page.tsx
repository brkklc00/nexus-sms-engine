import { PagePlaceholder } from "@/components/page-placeholder";

export default function SmsKrediHareketleriPage() {
  return (
    <PagePlaceholder
      title="Kredi Hareketleri"
      description="Kredi rezerv, dusum, iade ve duzeltme hareketlerini detayli olarak takip edin."
      items={[
        "Hareket turu bazli filtre",
        "Kampanya iliskisi",
        "Bakiye once/sonra",
        "Zaman sirali log",
        "Sayfalama ve export",
      ]}
    />
  );
}
