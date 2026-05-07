import { parsePhoneNumberFromString } from "libphonenumber-js";

export type NormalizedPhone = {
  raw: string;
  e164: string | null;
  countryCode: string | null;
  isValid: boolean;
};

export function normalizePhone(raw: string, defaultCountry = "TR"): NormalizedPhone {
  const input = raw.trim();
  if (!input) {
    return { raw, e164: null, countryCode: null, isValid: false };
  }

  const parsed = parsePhoneNumberFromString(input, defaultCountry as never);
  if (!parsed || !parsed.isValid()) {
    return { raw: input, e164: null, countryCode: null, isValid: false };
  }
  return {
    raw: input,
    e164: parsed.number,
    countryCode: parsed.country ?? null,
    isValid: true,
  };
}

export function parsePhoneInput(input: string): string[] {
  return input
    .split(/[\n,; ]+/g)
    .map((v) => v.trim())
    .filter(Boolean);
}
