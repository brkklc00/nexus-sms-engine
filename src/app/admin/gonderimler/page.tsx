import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminGonderimlerPage() {
  return (
    <ResourceTablePage
      title="Tum SMS Gonderimler"
      description="Kampanya kayitlarini canli API ile filtreleyin ve durumlarini izleyin."
      endpoint="/api/admin/sms/campaigns"
      columns={[
        { key: "name", label: "Kampanya" },
        { key: "user.email", label: "Musteri" },
        { key: "provider.name", label: "Saglayici" },
        { key: "status", label: "Durum" },
        { key: "totalCount", label: "Toplam" },
        { key: "deliveredCount", label: "Basarili" },
        { key: "failedCount", label: "Basarisiz" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
