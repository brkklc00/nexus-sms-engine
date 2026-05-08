"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminSaglayicilarPage() {
  return (
    <ResourceTablePage
      title="Sağlayıcı Ayarları"
      description="Sağlayıcı konfigürasyonları canlı API ile listelenir."
      endpoint="/api/admin/sms/providers"
      columns={[
        { key: "name", label: "Sağlayıcı" },
        { key: "type", label: "Tip" },
        { key: "baseUrl", label: "Base URL" },
        { key: "isActive", label: "Durum", render: (row) => (row.isActive ? "Aktif" : "Pasif") },
        { key: "priority", label: "Öncelik" },
        { key: "hourlyLimit", label: "Saatlik Limit" },
        { key: "dailyLimit", label: "Günlük Limit" },
      ]}
      actions={[
        {
          label: "Bakiye Test Et",
          href: (row) => `/api/admin/sms/providers/${row.id as string}/test-balance`,
        },
        {
          label: "Fiyat Test Et",
          href: (row) => `/api/admin/sms/providers/${row.id as string}/fetch-prices`,
        },
      ]}
    />
  );
}
