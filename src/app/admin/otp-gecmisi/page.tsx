"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminOtpGecmisiPage() {
  return (
    <ResourceTablePage
      title="SMS OTP Geçmişi"
      description="OTP kayıtlarını canlı API verisiyle takip edin."
      endpoint="/api/admin/sms/otp-history"
      columns={[
        { key: "user.email", label: "Kullanıcı" },
        { key: "phoneE164", label: "Telefon" },
        { key: "purpose", label: "Amaç" },
        { key: "status", label: "Durum" },
        { key: "provider.name", label: "Sağlayıcı" },
        { key: "cost", label: "Maliyet" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
