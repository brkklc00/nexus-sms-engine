import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function YonlendirPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  if ((session.user.role ?? UserRole.customer) === UserRole.admin) {
    redirect("/admin/dashboard");
  }
  redirect("/dashboard");
}
