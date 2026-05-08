import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { requireSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if ((session.user.role ?? UserRole.customer) !== UserRole.admin) {
    redirect("/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
