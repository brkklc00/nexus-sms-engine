import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { CustomerShell } from "@/components/customer-shell";
import { getCurrentUser } from "@/lib/api-auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if ((user.role ?? UserRole.customer) === UserRole.admin) {
    redirect("/admin");
  }
  return <CustomerShell>{children}</CustomerShell>;
}
