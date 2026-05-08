import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentUser } from "@/lib/api-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if ((user.role ?? UserRole.customer) !== UserRole.admin) {
    redirect("/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
