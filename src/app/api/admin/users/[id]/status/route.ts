import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;

  if (auth.user.id === id && parsed.data.isActive === false) {
    return fail("Kendi admin hesabınızı pasif yapamazsınız.", 422);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: parsed.data.isActive },
    select: { id: true, isActive: true },
  });
  await writeAuditLog({
    userId: auth.user.id,
    action: "USER_STATUS_CHANGE",
    entityType: "User",
    entityId: id,
    metadata: { isActive: parsed.data.isActive },
  });
  return ok(user);
}
