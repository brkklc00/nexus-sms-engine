import { PagePlaceholder } from "@/components/page-placeholder";

export default function AdminKullanicilarPage() {
  return (
    <PagePlaceholder
      title="Kullanici Yonetimi"
      description="Kullanicilari ekleyin, duzenleyin, devre disi birakin, sifre sifirlayin ve kredi hareketlerini izleyin."
      items={[
        "Kullanici ekle/duzenle/devre disi birak",
        "Sifre sifirlama",
        "Kredi ekleme/cikarma",
        "Kredi hareket gecmisi",
        "SMS markup yuzdesi ayari",
        "Varsayilan saglayici atama",
      ]}
    />
  );
}
