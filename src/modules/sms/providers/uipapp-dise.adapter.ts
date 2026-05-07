import { SmsProviderAdapter, SmsProviderSubmitParams } from "@/modules/sms/providers/types";

type UipappConfig = {
  baseUrl: string;
  token: string;
  timeoutSeconds: number;
};

export class UipappDiseAdapter implements SmsProviderAdapter {
  constructor(private readonly config: UipappConfig) {}

  private async post(path: string, payload: Record<string, unknown>) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutSeconds * 1000);
    const normalizedBase = this.config.baseUrl.replace(/\/$/, "");
    try {
      const response = await fetch(`${normalizedBase}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          user_token: this.config.token,
        }),
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(`Saglayici HTTP hatasi: ${response.status}`);
      }
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }

  async submit(params: SmsProviderSubmitParams) {
    try {
      const raw = await this.post("/submit", {
        origin: params.origin,
        message: params.message,
        numbers: params.numbers,
      });
      const reportId = typeof raw.report_id === "string" ? raw.report_id : undefined;
      const ok = raw.status === "successful" && Boolean(reportId);
      return { ok, reportId, raw, error: ok ? undefined : "Saglayici submit basarisiz." };
    } catch (error) {
      return { ok: false, raw: {}, error: error instanceof Error ? error.message : "Bilinmeyen hata" };
    }
  }

  async balance() {
    const raw = await this.post("/balance", {});
    return {
      balance: (raw.balance as string | number | undefined) ?? 0,
      currency: typeof raw.currency === "string" ? raw.currency : undefined,
      raw,
    };
  }

  async prices() {
    const raw = await this.post("/prices", {});
    const list = Array.isArray(raw.prices) ? raw.prices : [];
    return { prices: list, raw };
  }

  async report(reportId: string) {
    const raw = await this.post("/report", { report_id: reportId });
    return {
      waiting: Number(raw.waiting ?? 0),
      delivered: Number(raw.conducted ?? 0),
      undelivered: Number(raw.erroneous ?? 0),
      raw,
    };
  }
}
