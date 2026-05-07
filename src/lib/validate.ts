import { z } from "zod";
import { fail } from "@/lib/http";

export async function parseJson<T extends z.ZodTypeAny>(req: Request, schema: T) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { error: fail("Gecersiz veri.", 422, parsed.error.flatten()) };
  }
  return { data: parsed.data };
}
