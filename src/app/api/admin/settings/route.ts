import { requireAdmin } from "@/lib/api-auth";
import { ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const upsertManySchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.unknown(),
      type: z.string().optional(),
      description: z.string().optional(),
    }),
  ),
});

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const items = await prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
  return ok(items);
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = await parseJson(req, upsertManySchema);
  if ("error" in parsed) return parsed.error;

  const data = await Promise.all(
    parsed.data.settings.map((item) =>
      prisma.systemSetting.upsert({
        where: { key: item.key },
        update: {
          value: item.value as never,
          type: item.type,
          description: item.description,
          updatedById: auth.user.id,
        },
        create: {
          key: item.key,
          value: item.value as never,
          type: item.type,
          description: item.description,
          updatedById: auth.user.id,
        },
      }),
    ),
  );
  await writeAuditLog({
    userId: auth.user.id,
    action: "SETTING_UPDATE_BULK",
    entityType: "SystemSetting",
    metadata: { keys: parsed.data.settings.map((item) => item.key) },
  });
  return ok(data);
}
