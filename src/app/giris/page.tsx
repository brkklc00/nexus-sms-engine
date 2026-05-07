import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { LoginForm } from "@/components/login-form";
import { authOptions } from "@/lib/auth";

export default async function GirisPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    if ((session.user.role ?? UserRole.customer) === UserRole.admin) {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.25),_transparent_35%),#020617] p-4 text-slate-100">
      <LoginForm />
    </div>
  );
}
