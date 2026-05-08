"use client";

import { ErrorState } from "@/components/error-state";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[admin] segment error", error.message, error.digest);
  return <ErrorState onRetry={reset} />;
}
