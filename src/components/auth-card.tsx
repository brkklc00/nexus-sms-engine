export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-indigo-950/40 backdrop-blur md:p-8">
      <div className="mb-6">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/20 text-indigo-200">
          N
        </div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      </div>
      {children}
    </div>
  );
}
