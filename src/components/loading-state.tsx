export function LoadingState({ lines = 6 }: { lines?: number }) {
  return (
    <div className="grid gap-2">
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="h-10 animate-pulse rounded-lg bg-slate-800/70" />
      ))}
    </div>
  );
}
