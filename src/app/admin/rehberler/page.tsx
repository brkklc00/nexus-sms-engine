"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminRehberlerPage() {
  return (
    <ResourceTablePage
      title="Tüm Telefon Rehberleri"
      description="Tüm müşterilerin rehberlerini canlı veriden görüntüleyin."
      endpoint="/api/admin/sms/phone-books"
      columns={[
        { key: "name", label: "Rehber" },
        { key: "user.email", label: "Sahip" },
        { key: "totalCount", label: "Toplam" },
        { key: "validCount", label: "Geçerli" },
        { key: "invalidCount", label: "Geçersiz" },
        { key: "blacklistedCount", label: "Kara Liste" },
        {
          key: "updatedAt",
          label: "Güncelleme",
          render: (row) => new Date(String(row.updatedAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
