import Image from "next/image";

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
        <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-slate-950 px-3 py-2">
          <Image
            src="https://i.ibb.co/gLk7x7JD/nexus-logo-1.png"
            alt="NEXUS logo"
            width={144}
            height={44}
            className="h-11 w-auto object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      </div>
      {children}
    </div>
  );
}
