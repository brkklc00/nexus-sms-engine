import { PagePlaceholder } from "@/components/page-placeholder";

export default function SmsGonderPage() {
  return (
    <PagePlaceholder
      title="SMS Gonder"
      description="Toplu SMS gonderimi icin rehber secin veya numara yapistirin, maliyeti gorun ve kampanyayi kuyruga alin."
      items={[
        "Rehber secimi veya toplu numara yapistirma",
        "Mesaj ve origin alani",
        "Saglayici secimi veya otomatik secim",
        "Blacklist ve duplicate atlama secenekleri",
        "Tahmini alici ve kredi maliyeti",
        "Chunk boyutu ile kuyruga alma",
      ]}
    />
  );
}
