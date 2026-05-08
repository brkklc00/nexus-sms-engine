"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminBireyselGecmisPage() {
  return (
    <ResourceTablePage
      title="Bireysel SMS Geçmişi"
      description="Bireysel SMS kayıtlarını canlı veride filtreleyin."
      endpoint="/api/admin/sms/individual-history"
      columns={[
        { key: "phoneE164", label: "Alıcı" },
        { key: "user.email", label: "Kullanıcı" },
        { key: "provider.name", label: "Sağlayıcı" },
        { key: "cost", label: "Maliyet" },
        { key: "status", label: "Durum" },
        { key: "providerMessageId", label: "Provider ID" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
