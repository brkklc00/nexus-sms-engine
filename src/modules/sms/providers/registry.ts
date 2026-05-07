import { SmsProvider } from "@prisma/client";
import { decryptSecret } from "@/lib/crypto";
import { UipappDiseAdapter } from "@/modules/sms/providers/uipapp-dise.adapter";
import { SmsProviderAdapter } from "@/modules/sms/providers/types";

export function providerRegistry(provider: SmsProvider): SmsProviderAdapter {
  const token = decryptSecret(provider.tokenEncrypted);
  switch (provider.slug) {
    case "uipapp-dise":
      return new UipappDiseAdapter({
        baseUrl: provider.baseUrl,
        token,
        timeoutSeconds: provider.timeoutSeconds,
      });
    default:
      throw new Error(`Desteklenmeyen saglayici: ${provider.slug}`);
  }
}
