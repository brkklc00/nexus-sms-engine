import { PagePlaceholder } from "@/components/page-placeholder";

export default function AdminKaraListePage() {
  return (
    <PagePlaceholder
      title="Musteri SMS Kara Liste"
      description="Global ve kullanici bazli blacklist kayitlarini arayin, filtreleyin ve yonetin."
      items={[
        "Global blacklist goruntuleme",
        "Kullanici blacklist filtreleme",
        "Toplu ekleme/silme",
        "Kaynak ve neden alanlari",
        "Performansli arama",
        "Export destegi",
      ]}
    />
  );
}
