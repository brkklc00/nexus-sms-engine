import { PagePlaceholder } from "@/components/page-placeholder";

export default function AdminRehberlerPage() {
  return (
    <PagePlaceholder
      title="Tum Telefon Rehberleri"
      description="Tum kullanicilarin rehberlerini kullanici bazli filtreleyin ve varsayilan olarak sadece ozet metrikleri goruntuleyin."
      items={[
        "Kullanici bazli filtreleme",
        "Rehber ozet metrikleri",
        "Toplam/gecerli/gecersiz sayilar",
        "Yuksek hacimde performansli listeleme",
        "Varsayilan olarak satir ozeti",
        "Ihtiyac halinde detay goruntuleme",
      ]}
    />
  );
}
