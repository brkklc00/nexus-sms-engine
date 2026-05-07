import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminBireyselGecmisPage() {
  return (
    <ResourceTablePage
      title="Bireysel SMS Gecmisi"
      description="Bireysel SMS kayitlarini canli veride filtreleyin."
      endpoint="/api/admin/sms/individual-history"
      columns={[
        { key: "toPhone", label: "Alici" },
        { key: "user.email", label: "Kullanici" },
        { key: "provider.name", label: "Saglayici" },
        { key: "costCredits", label: "Maliyet" },
        { key: "status", label: "Durum" },
        { key: "providerMessageId", label: "Provider ID" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
