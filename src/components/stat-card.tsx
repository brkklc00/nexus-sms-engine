import { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
        <div className="rounded-lg border border-white/10 bg-slate-800 p-2">
          <Icon className="h-4 w-4 text-indigo-300" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
