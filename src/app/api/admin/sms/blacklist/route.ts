import { requireAdmin } from "@/lib/api-auth";
import { ok, parsePagination } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { normalizePhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  phone: z.string().min(6),
  userId: z.string().nullable().optional(),
  reason: z.string().optional(),
  source: z.enum(["manual", "import", "provider"]).default("manual"),
});

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { page, limit, skip } = parsePagination(url);
  const userId = url.searchParams.get("userId") ?? undefined;

  const where = userId ? { userId } : {};
  const [items, total] = await Promise.all([
    prisma.smsBlacklist.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsBlacklist.count({ where }),
  ]);
  return ok({ items, total, page, limit });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = await parseJson(req, createSchema);
  if ("error" in parsed) return parsed.error;

  const normalized = normalizePhone(parsed.data.phone);
  if (!normalized.isValid || !normalized.e164) {
    return Response.json(
      { ok: false, error: { code: "HTTP_422", message: "Geçerli telefon numarası gerekli." } },
      { status: 422 },
    );
  }

  const item = await prisma.smsBlacklist.create({
    data: {
      userId: parsed.data.userId ?? null,
      phoneE164: normalized.e164,
      reason: parsed.data.reason,
      source: parsed.data.source,
    },
  });
  return ok(item);
}
