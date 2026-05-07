import { PagePlaceholder } from "@/components/page-placeholder";

export default function KaraListePage() {
  return (
    <PagePlaceholder
      title="SMS Kara Liste"
      description="Tekli veya toplu numara ekleyin, kaynak/not tutun, arama filtreleme ve sayfalama ile listeleri yonetin."
      items={[
        "Tekli numara ekleme",
        "Toplu numara import",
        "Neden ve kaynak bilgisi",
        "Arama ve sayfalama",
        "Toplu silme islemleri",
        "Import/Export islemleri",
      ]}
    />
  );
}
