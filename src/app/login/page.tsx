import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { LoginForm } from "@/components/login-form";
import { authOptions } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    if ((session.user.role ?? UserRole.customer) === UserRole.admin) {
      redirect("/admin/dashboard");
    }
    redirect("/dashboard");
  }

  const params = await searchParams;
  return (
    <div className="nexus-bg flex min-h-screen items-center justify-center p-4 text-slate-100">
      <LoginForm initialError={params.error} />
    </div>
  );
}
