"use client";

import { ErrorState } from "@/components/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[app:error]", error.message, error.digest);
  return (
    <div className="nexus-bg flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <ErrorState onRetry={reset} />
      </div>
    </div>
  );
}
