import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.2),_transparent_40%),#020617] p-6 text-slate-100">
      <main className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900/80 p-10 shadow-2xl shadow-indigo-950/40 backdrop-blur md:p-14">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Nexus Platform</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Nexus SMS Engine</h1>
        <p className="mt-5 max-w-2xl text-sm text-slate-300 md:text-base">
          SMS gonderim, rehber yonetimi, kredi takibi ve kampanya operasyonlarini tek merkezden guvenli sekilde yonetin.
        </p>
        <div className="mt-10">
          <Link href="/giris" className="inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-500">
            Giris Yap
          </Link>
          <p className="mt-3 text-xs text-slate-400">Tek giris ile rolunuze uygun panele otomatik yonlendirilirsiniz.</p>
        </div>
      </main>
    </div>
  );
}
