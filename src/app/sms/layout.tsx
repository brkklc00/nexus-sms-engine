import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { CustomerShell } from "@/components/customer-shell";
import { requireSession } from "@/lib/auth";

export default async function SmsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if ((session.user.role ?? UserRole.customer) === UserRole.admin) {
    redirect("/admin");
  }
  return <CustomerShell>{children}</CustomerShell>;
}
