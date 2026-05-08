import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

export default async function AccountPage() {
  const session = await requireSession();
  if ((session.user.role ?? UserRole.customer) === UserRole.admin) {
    redirect("/admin/ayarlar");
  }
  redirect("/sms/hesabim");
}
