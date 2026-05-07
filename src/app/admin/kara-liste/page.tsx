import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminKaraListePage() {
  return (
    <ResourceTablePage
      title="Musteri SMS Kara Liste"
      description="Global ve kullanici bazli blacklist kayitlari."
      endpoint="/api/admin/sms/blacklist"
      columns={[
        { key: "phoneE164", label: "Telefon" },
        { key: "userId", label: "Kullanici" },
        { key: "source", label: "Kaynak" },
        { key: "reason", label: "Sebep" },
        {
          key: "createdAt",
          label: "Olusturma",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
