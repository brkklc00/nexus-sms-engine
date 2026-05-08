"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminKrediHareketleriPage() {
  return (
    <ResourceTablePage
      title="Kredi Hareketleri"
      description="Tüm kredi hareketleri transaction kayıtlarıyla listelenir."
      endpoint="/api/admin/credit-transactions"
      columns={[
        { key: "user.email", label: "Kullanıcı" },
        { key: "type", label: "Tip" },
        { key: "amount", label: "Tutar" },
        { key: "balanceBefore", label: "Önce" },
        { key: "balanceAfter", label: "Sonra" },
        { key: "reason", label: "Açıklama" },
        { key: "createdBy.email", label: "Admin" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
