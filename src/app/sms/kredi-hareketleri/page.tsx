import { ResourceTablePage } from "@/components/resource-table-page";

export default function SmsKrediHareketleriPage() {
  return (
    <ResourceTablePage
      title="Kredi Hareketleri"
      description="Kredi hareket kayitlariniz canli veriden listelenir."
      endpoint="/api/sms/credit-transactions"
      columns={[
        { key: "type", label: "Tip" },
        { key: "amount", label: "Tutar" },
        { key: "balanceBefore", label: "Once" },
        { key: "balanceAfter", label: "Sonra" },
        { key: "reason", label: "Aciklama" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
