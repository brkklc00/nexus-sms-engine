"use client";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Bu sayfa yüklenirken bir hata oluştu.",
  description = "Lütfen tekrar deneyin. Sorun devam ederse yöneticinize başvurun.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-center">
      <h3 className="text-base font-semibold text-rose-100">{title}</h3>
      <p className="mt-2 text-sm text-rose-200/90">{description}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-rose-300/40 bg-rose-950/40 px-4 py-2 text-sm text-rose-100"
        >
          Tekrar Dene
        </button>
      ) : null}
    </div>
  );
}
