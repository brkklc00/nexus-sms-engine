"use client";

import { ErrorState } from "@/components/error-state";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[dashboard] segment error", error.message, error.digest);
  return <ErrorState onRetry={reset} />;
}
