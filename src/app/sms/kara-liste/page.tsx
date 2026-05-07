import { ResourceTablePage } from "@/components/resource-table-page";

export default function KaraListePage() {
  return (
    <ResourceTablePage
      title="SMS Kara Liste"
      description="Kara liste kayitlarinizi canli API baglantisiyla goruntuleyin."
      endpoint="/api/sms/blacklist"
      columns={[
        { key: "phoneE164", label: "Telefon" },
        { key: "source", label: "Kaynak" },
        { key: "reason", label: "Sebep" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
      actions={[
        {
          label: "Sil",
          method: "DELETE",
          href: (row) => `/api/sms/blacklist/${row.id as string}`,
          confirmText: "Bu numarayi kara listeden silmek istediginize emin misiniz?",
        },
      ]}
    />
  );
}
