"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminKrediHareketleriPage() {
  const searchParams = useSearchParams();
  const endpoint = useMemo(() => {
    const userId = searchParams.get("userId");
    return userId ? `/api/admin/credit-transactions?userId=${encodeURIComponent(userId)}` : "/api/admin/credit-transactions";
  }, [searchParams]);

  return (
    <ResourceTablePage
      title="Kredi Hareketleri"
      description="Tüm kredi hareketleri transaction kayıtlarıyla listelenir."
      endpoint={endpoint}
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
