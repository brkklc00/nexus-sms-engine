import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminRehberlerPage() {
  return (
    <ResourceTablePage
      title="Tum Telefon Rehberleri"
      description="Tum musterilerin rehberlerini canli veriden goruntuleyin."
      endpoint="/api/admin/sms/phone-books"
      columns={[
        { key: "name", label: "Rehber" },
        { key: "user.email", label: "Sahip" },
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
