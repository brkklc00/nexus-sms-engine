"use client";

import { ErrorState } from "@/components/error-state";

export default function SmsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[sms] segment error", error.message, error.digest);
  return <ErrorState onRetry={reset} />;
}
