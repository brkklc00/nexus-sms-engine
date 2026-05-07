import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const patchSchema = z.object({
  value: z.unknown(),
  type: z.string().optional(),
  description: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { key } = await params;
  const parsed = await parseJson(req, patchSchema);
  if ("error" in parsed) return parsed.error;
  const exists = await prisma.systemSetting.findUnique({ where: { key } });
  if (!exists) return fail("Ayar bulunamadi.", 404);
  const setting = await prisma.systemSetting.update({
    where: { key },
    data: {
      value: parsed.data.value as never,
      type: parsed.data.type,
      description: parsed.data.description,
      updatedById: auth.user.id,
    },
  });
  await writeAuditLog({
    userId: auth.user.id,
    action: "SETTING_UPDATE",
    entityType: "SystemSetting",
    entityId: setting.id,
    metadata: { key, value: parsed.data.value },
  });
  return ok(setting);
}
