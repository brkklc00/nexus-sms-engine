"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function SmsKampanyalarPage() {
  return (
    <ResourceTablePage
      title="Kampanyalar"
      description="Kendi kampanyalarinizi canli API ile goruntuleyin."
      endpoint="/api/sms/campaigns"
      columns={[
        { key: "name", label: "Kampanya" },
        { key: "status", label: "Durum" },
        { key: "totalCount", label: "Toplam" },
        { key: "deliveredCount", label: "Basarili" },
        { key: "failedCount", label: "Basarisiz" },
        { key: "queuedCount", label: "Bekleyen" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
      actions={[
        {
          label: "Iptal",
          href: (row) => `/api/sms/campaigns/${row.id as string}/cancel`,
          confirmText: "Kampanyayi iptal etmek istediginize emin misiniz?",
        },
        {
          label: "Rapor Senkron",
          href: (row) => `/api/sms/campaigns/${row.id as string}/report-sync`,
        },
      ]}
    />
  );
}
