"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminKullanicilarPage() {
  return (
    <ResourceTablePage
      title="Kullanıcı Yönetimi"
      description="Kullanıcı listesi, roller ve kredi özetleri canlı API'dan gelir."
      endpoint="/api/admin/users"
      columns={[
        { key: "name", label: "Ad" },
        { key: "email", label: "E-posta" },
        { key: "role", label: "Rol" },
        { key: "isActive", label: "Durum", render: (row) => (row.isActive ? "Aktif" : "Pasif") },
        { key: "smsCreditBalance", label: "Kredi" },
        { key: "smsMarkupPercent", label: "Markup %" },
        {
          key: "createdAt",
          label: "Oluşturma",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
