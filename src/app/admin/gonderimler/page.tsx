"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminGonderimlerPage() {
  const searchParams = useSearchParams();
  const endpoint = useMemo(() => {
    const userId = searchParams.get("userId");
    return userId ? `/api/admin/sms/campaigns?userId=${encodeURIComponent(userId)}` : "/api/admin/sms/campaigns";
  }, [searchParams]);

  return (
    <ResourceTablePage
      title="Tüm SMS Gönderimler"
      description="Kampanya kayıtlarını canlı API ile filtreleyin ve durumlarını izleyin."
      endpoint={endpoint}
      columns={[
        { key: "name", label: "Kampanya" },
        { key: "user.email", label: "Müşteri" },
        { key: "provider.name", label: "Sağlayıcı" },
        { key: "status", label: "Durum" },
        { key: "totalCount", label: "Toplam" },
        { key: "deliveredCount", label: "Başarılı" },
        { key: "failedCount", label: "Başarısız" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
      actions={[
        {
          label: "İptal Et",
          href: (row) => `/api/admin/campaigns/${row.id as string}/cancel`,
          confirmText: "Kampanyayı iptal etmek istediğinize emin misiniz?",
        },
        {
          label: "Rapor Senkronize Et",
          href: (row) => `/api/admin/campaigns/${row.id as string}/sync-report`,
        },
      ]}
    />
  );
}
