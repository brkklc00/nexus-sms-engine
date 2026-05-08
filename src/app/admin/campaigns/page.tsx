import { redirect } from "next/navigation";

export default async function AdminCampaignsAliasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const userId = typeof params.userId === "string" ? params.userId : undefined;
  redirect(userId ? `/admin/gonderimler?userId=${encodeURIComponent(userId)}` : "/admin/gonderimler");
}
