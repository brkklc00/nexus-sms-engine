"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function SmsRehberPage() {
  return (
    <ResourceTablePage
      title="SMS Rehberleri"
      description="Kendi rehberlerinizi canlı API ile yönetin."
      endpoint="/api/sms/phone-books"
      columns={[
        { key: "name", label: "Rehber" },
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
