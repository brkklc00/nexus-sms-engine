import { ResourceTablePage } from "@/components/resource-table-page";

export default function SmsRehberPage() {
  return (
    <ResourceTablePage
      title="SMS Rehberleri"
      description="Kendi rehberlerinizi canli API ile yonetin."
      endpoint="/api/sms/phone-books"
      columns={[
        { key: "name", label: "Rehber" },
        { key: "totalCount", label: "Toplam" },
        { key: "validCount", label: "Gecerli" },
        { key: "invalidCount", label: "Gecersiz" },
        { key: "blacklistedCount", label: "Kara Liste" },
        {
          key: "updatedAt",
          label: "Guncelleme",
          render: (row) => new Date(String(row.updatedAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
