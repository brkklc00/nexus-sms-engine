"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminRehberlerPage() {
  const searchParams = useSearchParams();
  const endpoint = useMemo(() => {
    const userId = searchParams.get("userId");
    return userId ? `/api/admin/sms/phone-books?userId=${encodeURIComponent(userId)}` : "/api/admin/sms/phone-books";
  }, [searchParams]);

  return (
    <ResourceTablePage
      title="Tüm Telefon Rehberleri"
      description="Tüm müşterilerin rehberlerini canlı veriden görüntüleyin."
      endpoint={endpoint}
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
      actions={[
        {
          label: "Sil",
          method: "DELETE",
          href: (row) => `/api/admin/phone-books/${row.id as string}`,
          confirmText: "Bu rehberi silmek istediğinize emin misiniz?",
        },
      ]}
    />
  );
}
