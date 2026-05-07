import { ResourceTablePage } from "@/components/resource-table-page";

export default function SmsGecmisPage() {
  return (
    <ResourceTablePage
      title="SMS Gecmisi"
      description="Bireysel gonderim gecmisinizi canli API ile takip edin."
      endpoint="/api/sms/history/individual"
      columns={[
        { key: "toPhone", label: "Alici" },
        { key: "status", label: "Durum" },
        { key: "provider.name", label: "Saglayici" },
        { key: "costCredits", label: "Maliyet" },
        { key: "errorMessage", label: "Hata" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
