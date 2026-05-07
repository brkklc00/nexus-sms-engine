import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminKullanicilarPage() {
  return (
    <ResourceTablePage
      title="Kullanici Yonetimi"
      description="Kullanici listesi, roller ve kredi ozetleri canli API'dan gelir."
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
          label: "Olusturma",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
