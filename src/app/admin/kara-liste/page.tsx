"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminKaraListePage() {
  return (
    <ResourceTablePage
      title="Müşteri SMS Kara Liste"
      description="Global ve kullanıcı bazlı blacklist kayıtları."
      endpoint="/api/admin/sms/blacklist"
      columns={[
        { key: "phoneE164", label: "Telefon" },
        { key: "userId", label: "Kullanıcı" },
        { key: "source", label: "Kaynak" },
        { key: "reason", label: "Sebep" },
        {
          key: "createdAt",
          label: "Oluşturma",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
