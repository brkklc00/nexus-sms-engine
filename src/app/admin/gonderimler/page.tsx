"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminGonderimlerPage() {
  return (
    <ResourceTablePage
      title="Tüm SMS Gönderimler"
      description="Kampanya kayıtlarını canlı API ile filtreleyin ve durumlarını izleyin."
      endpoint="/api/admin/sms/campaigns"
      columns={[
        { key: "name", label: "Kampanya" },
        { key: "user.email", label: "Müşteri" },
        { key: "provider.name", label: "Sağlayıcı" },
        { key: "status", label: "Durum" },
        { key: "totalCount", label: "Toplam" },
        { key: "deliveredCount", label: "Başarılı" },
        { key: "failedCount", label: "Başarısız" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
