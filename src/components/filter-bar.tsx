export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-3 md:flex-row md:items-center md:justify-between">
      {children}
    </div>
  );
}
