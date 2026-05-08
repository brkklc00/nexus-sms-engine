"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function SmsGecmisPage() {
  return (
    <ResourceTablePage
      title="SMS Geçmişi"
      description="Bireysel gönderim geçmişinizi canlı API ile takip edin."
      endpoint="/api/sms/history/individual"
      columns={[
        { key: "phoneE164", label: "Alıcı" },
        { key: "status", label: "Durum" },
        { key: "provider.name", label: "Sağlayıcı" },
        { key: "cost", label: "Maliyet" },
        { key: "error", label: "Hata" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
