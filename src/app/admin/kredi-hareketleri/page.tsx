import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminKrediHareketleriPage() {
  return (
    <ResourceTablePage
      title="Kredi Hareketleri"
      description="Tum kredi hareketleri transaction kayitlariyla listelenir."
      endpoint="/api/admin/credit-transactions"
      columns={[
        { key: "user.email", label: "Kullanici" },
        { key: "type", label: "Tip" },
        { key: "amount", label: "Tutar" },
        { key: "balanceBefore", label: "Once" },
        { key: "balanceAfter", label: "Sonra" },
        { key: "reason", label: "Aciklama" },
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
