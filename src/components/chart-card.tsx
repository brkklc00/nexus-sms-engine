export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
