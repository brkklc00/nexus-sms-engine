import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <main className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-10">
        <h1 className="text-3xl font-semibold">Nexus SMS Engine</h1>
        <p className="mt-4 text-slate-300">
          Uretim kalitesinde SMS kampanya, rehber ve kredi yonetimi platformu.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/giris" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium">
            Giris Yap
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Musteri Paneli
          </Link>
          <Link
            href="/admin/kullanicilar"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Admin Paneli
          </Link>
        </div>
      </main>
    </div>
  );
}
