export interface SmsProviderSubmitParams {
  origin: string;
  message: string;
  numbers: string[];
}

export interface SmsProviderAdapter {
  submit(
    params: SmsProviderSubmitParams,
  ): Promise<{ ok: boolean; reportId?: string; raw: unknown; error?: string }>;
  balance(): Promise<{ balance: string | number; currency?: string; raw: unknown }>;
  prices(): Promise<{ prices: unknown[]; raw: unknown }>;
  report(reportId: string): Promise<{ waiting: number; delivered: number; undelivered: number; raw: unknown }>;
}
