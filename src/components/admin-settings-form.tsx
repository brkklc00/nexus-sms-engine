"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

type SettingItem = {
  key: string;
  value: unknown;
  type?: string | null;
  description?: string | null;
};

const defaults: SettingItem[] = [
  { key: "default_chunk_size", value: 500, type: "number", description: "Varsayilan SMS chunk boyutu" },
  { key: "report_sync_interval_min", value: 15, type: "number", description: "Rapor senkron araligi (dk)" },
  { key: "default_rate_limit", value: 60, type: "number", description: "Dakikalik varsayilan rate limit" },
  { key: "notifications_enabled", value: true, type: "boolean", description: "Sistem bildirimleri" },
  { key: "audit_policy", value: "strict", type: "string", description: "Audit policy seviyesi" },
  { key: "default_markup_percent", value: 10, type: "number", description: "Varsayilan markup yuzdesi" },
  { key: "global_blacklist_enabled", value: true, type: "boolean", description: "Global blacklist kontrolu" },
];

export function AdminSettingsForm() {
  const [items, setItems] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/settings", { cache: "no-store" });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; data?: SettingItem[] } | null;
    if (!response.ok || !json?.ok) {
      setItems([]);
      setLoading(false);
      return;
    }
    setItems(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  async function save() {
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: items }),
    });
    if (!response.ok) {
      setFeedback("Kayit basarisiz oldu.");
      return;
    }
    setFeedback("Ayarlar kaydedildi.");
    await load();
  }

  const merged = defaults.map((item) => items.find((x) => x.key === item.key) ?? item);

  return (
    <div className="space-y-5">
      <PageHeader title="Ayarlar" description="Sistem ayarlarini canli API baglantisiyla yonetin." badge="SystemSetting" />
      <section className="nexus-surface rounded-2xl p-5">
        {feedback ? <p className="mb-4 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">{feedback}</p> : null}
        {loading ? (
          <div className="grid gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-10 animate-pulse rounded-lg bg-slate-800/60" />
            ))}
          </div>
        ) : merged.length === 0 ? (
          <EmptyState title="Henuz ayar yok" description="Varsayilan ayarlari olusturup kaydedebilirsiniz." />
        ) : (
          <div className="space-y-3">
            {merged.map((item) => (
              <label key={item.key} className="block space-y-1">
                <span className="text-sm font-medium text-slate-200">{item.description ?? item.key}</span>
                <input
                  className="nexus-input py-2 pl-3"
                  value={typeof item.value === "string" || typeof item.value === "number" ? String(item.value) : JSON.stringify(item.value)}
                  onChange={(e) =>
                    setItems((prev) => {
                      const next = [...prev];
                      const existing = next.find((x) => x.key === item.key);
                      const value = item.type === "number" ? Number(e.target.value) : item.type === "boolean" ? e.target.value === "true" : e.target.value;
                      if (existing) {
                        existing.value = value;
                      } else {
                        next.push({ ...item, value });
                      }
                      return next;
                    })
                  }
                />
                <p className="text-xs text-slate-500">Anahtar: {item.key} - Tip: {item.type ?? "json"}</p>
              </label>
            ))}
          </div>
        )}
        <div className="mt-5 flex gap-2">
          <button onClick={() => void save()} className="nexus-btn-primary rounded-lg px-4 py-2 text-sm">
            Kaydet
          </button>
          <button
            onClick={() => {
              setItems(defaults);
              setFeedback("Varsayilanlar yuklendi. Kaydet'e basin.");
            }}
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-sm text-slate-200"
          >
            Varsayilanlara Don
          </button>
        </div>
      </section>
    </div>
  );
}
