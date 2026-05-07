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
    <div className="nexus-surface w-full max-w-[480px] rounded-3xl p-6 md:p-8">
      <div className="nexus-surface-strong mb-6 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-slate-950 px-2.5 py-2">
            <Image
              src="https://i.ibb.co/gLk7x7JD/nexus-logo-1.png"
              alt="NEXUS logo"
              width={132}
              height={42}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white md:text-xl">{title}</h1>
            <p className="mt-1 text-xs text-slate-400 md:text-sm">{description}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
