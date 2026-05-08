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
    <div className="nexus-surface rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-5">
      {badge ? (
        <span className="inline-flex rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
          {badge}
        </span>
      ) : null}
      <h1 className="mt-3 text-xl font-semibold tracking-tight text-white md:text-2xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-300/95">{description}</p>
    </div>
  );
}
