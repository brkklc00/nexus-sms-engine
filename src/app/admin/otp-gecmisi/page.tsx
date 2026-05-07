import { ResourceTablePage } from "@/components/resource-table-page";

export default function AdminOtpGecmisiPage() {
  return (
    <ResourceTablePage
      title="SMS OTP Gecmisi"
      description="OTP kayitlarini canli API verisiyle takip edin."
      endpoint="/api/admin/sms/otp-history"
      columns={[
        { key: "user.email", label: "Kullanici" },
        { key: "phoneE164", label: "Telefon" },
        { key: "purpose", label: "Amac" },
        { key: "status", label: "Durum" },
        { key: "provider.name", label: "Saglayici" },
        { key: "costCredits", label: "Maliyet" },
        {
          key: "createdAt",
          label: "Tarih",
          render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
        },
      ]}
    />
  );
}
