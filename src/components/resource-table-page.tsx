"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

type Column<T = Record<string, unknown>> = {
  key: string;
  label: string;
  render?: (row: T) => string | number | null | undefined;
};

type RowAction<T = Record<string, unknown>> = {
  label: string;
  method?: "POST" | "DELETE" | "PATCH";
  href: (row: T) => string;
  confirmText?: string;
};

type Meta = { total: number; page: number; limit: number };

function pick(row: Record<string, unknown>, key: string): string | number {
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, row);
  if (typeof value === "number") return value;
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Evet" : "Hayir";
  return JSON.stringify(value);
}

export function ResourceTablePage<T extends Record<string, unknown>>({
  title,
  description,
  endpoint,
  columns,
  badge,
  actions,
}: {
  title: string;
  description: string;
  endpoint: string;
  columns: Column<T>[];
  badge?: string;
  actions?: RowAction<T>[];
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rows, setRows] = useState<T[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20 });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(meta.total / meta.limit)), [meta]);

  async function loadData() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(meta.limit));
    if (q.trim()) params.set("q", q.trim());

    const response = await fetch(`${endpoint}?${params.toString()}`, { cache: "no-store" });
    const json = (await response.json().catch(() => null)) as
      | { ok: true; data: { items?: T[]; total?: number; page?: number; limit?: number } | T[] }
      | { ok: false; message?: string }
      | null;

    if (!response.ok || !json || !json.ok) {
      setError("Veriler alinamadi.");
      setLoading(false);
      return;
    }

    if (Array.isArray(json.data)) {
      setRows(json.data);
      setMeta({ total: json.data.length, page: 1, limit: json.data.length || 20 });
    } else {
      setRows((json.data.items ?? []) as T[]);
      setMeta({
        total: json.data.total ?? 0,
        page: json.data.page ?? 1,
        limit: json.data.limit ?? 20,
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function runAction(action: RowAction<T>, row: T) {
    if (action.confirmText && !window.confirm(action.confirmText)) return;
    setFeedback(null);
    const response = await fetch(action.href(row), {
      method: action.method ?? "POST",
      headers: { "Content-Type": "application/json" },
    });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    if (!response.ok || json?.ok === false) {
      setFeedback(json?.message ?? "Islem basarisiz.");
      return;
    }
    setFeedback("Islem basariyla tamamlandi.");
    await loadData();
  }

  return (
    <div className="space-y-5">
      <PageHeader title={title} description={description} badge={badge ?? "Canli Veri"} />

      <section className="nexus-surface rounded-2xl p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara..."
            className="nexus-input max-w-sm py-2 pl-3"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPage(1);
                void loadData();
              }}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
            >
              Filtrele
            </button>
            <button
              onClick={() => {
                setQ("");
                setPage(1);
                void loadData();
              }}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
            >
              Temizle
            </button>
          </div>
        </div>

        {feedback ? <p className="mb-3 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">{feedback}</p> : null}
        {error ? <p className="mb-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}

        {loading ? (
          <div className="grid gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-10 animate-pulse rounded-lg bg-slate-800/60" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="Henuz kayit yok" description="Yeni kayit olusturdugunuzda bu liste otomatik guncellenir." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/90">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-3 py-2 text-left text-xs uppercase tracking-wide text-slate-400">
                      {column.label}
                    </th>
                  ))}
                  {actions?.length ? <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-slate-400">Aksiyon</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/80">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/70">
                    {columns.map((column) => (
                      <td key={column.key} className="px-3 py-2 text-slate-200">
                        {column.render ? column.render(row) : pick(row, column.key)}
                      </td>
                    ))}
                    {actions?.length ? (
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          {actions.map((action) => (
                            <button
                              key={action.label}
                              onClick={() => void runAction(action, row)}
                              className="rounded-md border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>
            Toplam: {meta.total} kayit - Sayfa {meta.page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-white/10 bg-slate-900 px-3 py-1 disabled:opacity-50"
            >
              Onceki
            </button>
            <button
              disabled={meta.page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-white/10 bg-slate-900 px-3 py-1 disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
