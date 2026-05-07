export function PageHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      {badge ? (
        <span className="inline-flex rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
          {badge}
        </span>
      ) : null}
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>
    </div>
  );
}
