"use client";

import { ResourceTablePage } from "@/components/resource-table-page";

export default function SmsKrediHareketleriPage() {
  return (
    <ResourceTablePage
      title="Kredi Hareketleri"
      description="Kredi hareket kayıtlarınız canlı veriden listelenir."
      endpoint="/api/sms/credit-transactions"
      columns={[
        { key: "type", label: "Tip" },
        { key: "amount", label: "Tutar" },
        { key: "balanceBefore", label: "Önce" },
        { key: "balanceAfter", label: "Sonra" },
        { key: "reason", label: "Açıklama" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
