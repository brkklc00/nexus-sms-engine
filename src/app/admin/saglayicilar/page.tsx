import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminSaglayicilarPage() {
  return (
    <ResourceTablePage
      title="Saglayici Ayarlari"
      description="Saglayici konfigurasyonlari canli API ile listelenir."
      endpoint="/api/admin/sms/providers"
      columns={[
        { key: "name", label: "Saglayici" },
        { key: "type", label: "Tip" },
        { key: "baseUrl", label: "Base URL" },
        { key: "isActive", label: "Durum", render: (row) => (row.isActive ? "Aktif" : "Pasif") },
        { key: "priority", label: "Oncelik" },
        { key: "hourlyLimit", label: "Saatlik Limit" },
        { key: "dailyLimit", label: "Gunluk Limit" },
      ]}
    />
  );
}
