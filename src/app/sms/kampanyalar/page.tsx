import { PagePlaceholder } from "@/components/page-placeholder";

export default function SmsKampanyalarPage() {
  return (
    <PagePlaceholder
      title="Kampanyalar"
      description="Toplu SMS kampanyalarini filtreleyin, durumlarini izleyin ve rapor senkron islemlerini yonetin."
      items={[
        "Kampanya listesi ve durumlar",
        "Teslimat/hatali dagilim gorunumu",
        "Rapor senkron islemi",
        "Kampanya iptal aksiyonu",
        "Pagination ve export",
      ]}
    />
  );
}
