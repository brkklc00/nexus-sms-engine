import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";

export default async function SmsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if ((session.user.role ?? UserRole.customer) === UserRole.admin) {
    redirect("/admin");
  }
  return <AppShell role="customer">{children}</AppShell>;
}
