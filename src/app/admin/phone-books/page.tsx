import { redirect } from "next/navigation";

export default async function AdminPhoneBooksAliasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const userId = typeof params.userId === "string" ? params.userId : undefined;
  redirect(userId ? `/admin/rehberler?userId=${encodeURIComponent(userId)}` : "/admin/rehberler");
}
