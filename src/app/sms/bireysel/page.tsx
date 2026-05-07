import { PagePlaceholder } from "@/components/page-placeholder";

export default function BireyselSmsPage() {
  return (
    <PagePlaceholder
      title="Bireysel SMS"
      description="Maksimum 10 aliciya hizli bireysel SMS gonderin, kredi dusumunu ve gonderim sonucunu aninda izleyin."
      items={[
        "En fazla 10 alici",
        "Numara yapistirma alani",
        "Mesaj ve origin secimi",
        "Saglayici secimi",
        "Aninda veya kuyruklu gonderim",
        "Bireysel gecmise otomatik kayit",
      ]}
    />
  );
}
