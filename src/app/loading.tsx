import { LoadingState } from "@/components/loading-state";

export default function GlobalLoading() {
  return (
    <div className="nexus-bg min-h-screen p-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <LoadingState lines={10} />
      </div>
    </div>
  );
}
