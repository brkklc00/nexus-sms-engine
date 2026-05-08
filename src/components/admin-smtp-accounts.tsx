"use client";

import { useEffect, useMemo, useState } from "react";
import { ActionButton } from "@/components/action-button";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { FilterBar } from "@/components/filter-bar";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";

type SmtpAccount = {
  id: string;
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
  healthStatus: string;
  targetRatePerSecond: number;
  maxRatePerSecond: number;
  warmupEnabled: boolean;
  warmupStartRps: number;
  warmupIncrementStep: number;
  warmupMaxRps: number;
  dailyCap: number | null;
  hourlyCap: number | null;
  minuteCap: number | null;
  isThrottled: boolean;
  cooldownUntil: string | null;
  lastError: string | null;
};

type BulkPreset = "safe" | "balanced" | "fast" | "aggressive" | "custom" | "daily_target";
type BulkScope = "all_active" | "selected" | "healthy" | "error";

const presetDefaults: Record<Exclude<BulkPreset, "custom" | "daily_target">, Record<string, number | boolean>> = {
  safe: { targetRatePerSecond: 0.2, maxRatePerSecond: 0.5, warmupEnabled: true, warmupStartRps: 0.1, warmupIncrementStep: 0.1, warmupMaxRps: 1 },
  balanced: { targetRatePerSecond: 0.5, maxRatePerSecond: 1, warmupEnabled: true, warmupStartRps: 0.2, warmupIncrementStep: 0.2, warmupMaxRps: 2 },
  fast: { targetRatePerSecond: 1, maxRatePerSecond: 2, warmupEnabled: true, warmupStartRps: 0.5, warmupIncrementStep: 0.5, warmupMaxRps: 3 },
  aggressive: { targetRatePerSecond: 2, maxRatePerSecond: 5, warmupEnabled: true, warmupStartRps: 1, warmupIncrementStep: 1, warmupMaxRps: 5 },
};

export function AdminSmtpAccounts() {
  const [rows, setRows] = useState<SmtpAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmText, setConfirmText] = useState<string | null>(null);

  const [scope, setScope] = useState<BulkScope>("all_active");
  const [preset, setPreset] = useState<BulkPreset>("balanced");
  const [dailyTarget, setDailyTarget] = useState("1000000");
  const [values, setValues] = useState({
    targetRatePerSecond: "0.5",
    maxRatePerSecond: "1",
    warmupEnabled: true,
    warmupStartRps: "0.2",
    warmupIncrementStep: "0.2",
    warmupMaxRps: "2",
    dailyCap: "",
    hourlyCap: "",
    minuteCap: "",
    resetThrottle: true,
    clearCooldown: true,
    clearLastError: false,
    onlyActive: true,
  });
  const [includeAuthErrors, setIncludeAuthErrors] = useState(false);
  const [setHealthy, setSetHealthy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/sms/providers", { cache: "no-store" });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; data?: SmtpAccount[] } | null;
    if (!response.ok || !json?.ok) {
      setError("SMTP hesapları alınamadı.");
      setRows([]);
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const filteredRows = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(term) || row.slug.toLowerCase().includes(term));
  }, [q, rows]);

  const selectedCount = selectedIds.length;

  const dailyPreview = useMemo(() => {
    const target = Number(dailyTarget);
    if (!Number.isFinite(target) || target <= 0) return null;
    const usable = rows.filter((row) => row.isActive && row.healthStatus === "healthy").length;
    if (!usable) return null;
    const globalRps = target / 86400;
    const perSmtpRps = globalRps / usable;
    const perSmtpDailyCap = Math.ceil(target / usable);
    const perSmtpHourlyCap = Math.ceil(perSmtpDailyCap / 24);
    const perSmtpMinuteCap = Math.ceil(perSmtpHourlyCap / 60);
    return {
      toplam: rows.length,
      kullanilacak: usable,
      gunlukHedef: target,
      smtpBasiGunluk: perSmtpDailyCap,
      smtpBasiRps: perSmtpRps,
      tahminiToplamRps: perSmtpRps * usable,
      saatlik: perSmtpHourlyCap,
      dakikalik: perSmtpMinuteCap,
    };
  }, [dailyTarget, rows]);

  function setPresetValues(nextPreset: BulkPreset) {
    setPreset(nextPreset);
    if (nextPreset === "custom" || nextPreset === "daily_target") return;
    const presetValue = presetDefaults[nextPreset];
    setValues((prev) => ({
      ...prev,
      targetRatePerSecond: String(presetValue.targetRatePerSecond),
      maxRatePerSecond: String(presetValue.maxRatePerSecond),
      warmupEnabled: Boolean(presetValue.warmupEnabled),
      warmupStartRps: String(presetValue.warmupStartRps),
      warmupIncrementStep: String(presetValue.warmupIncrementStep),
      warmupMaxRps: String(presetValue.warmupMaxRps),
    }));
  }

  async function applyBulk() {
    const affected = scope === "selected" ? selectedIds.length : rows.length;
    setConfirmText(`Bu işlem ${affected} SMTP hesabının rate/warmup ayarlarını güncelleyecek.`);
  }

  async function confirmBulkApply() {
    setConfirmText(null);
    const payload = {
      scope,
      smtpAccountIds: scope === "selected" ? selectedIds : undefined,
      preset,
      dailyTarget: preset === "daily_target" ? Number(dailyTarget) : undefined,
      values: {
        targetRatePerSecond: Number(values.targetRatePerSecond),
        maxRatePerSecond: Number(values.maxRatePerSecond),
        warmupEnabled: values.warmupEnabled,
        warmupStartRps: Number(values.warmupStartRps),
        warmupIncrementStep: Number(values.warmupIncrementStep),
        warmupMaxRps: Number(values.warmupMaxRps),
        dailyCap: values.dailyCap ? Number(values.dailyCap) : null,
        hourlyCap: values.hourlyCap ? Number(values.hourlyCap) : null,
        minuteCap: values.minuteCap ? Number(values.minuteCap) : null,
        resetThrottle: values.resetThrottle,
        clearCooldown: values.clearCooldown,
        clearLastError: values.clearLastError,
        onlyActive: values.onlyActive,
      },
    };
    const response = await fetch("/api/smtp/bulk-rate-warmup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; error?: { message?: string } } | null;
    if (!response.ok || !json?.ok) {
      setFeedback(json?.error?.message ?? "Toplu güncelleme başarısız.");
      return;
    }
    setFeedback("SMTP rate/warmup ayarları güncellendi.");
    setBulkOpen(false);
    await load();
  }

  async function applyResetThrottle() {
    const response = await fetch("/api/smtp/reset-throttle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope,
        smtpAccountIds: scope === "selected" ? selectedIds : undefined,
        includeAuthErrors,
        setHealthy,
      }),
    });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; error?: { message?: string } } | null;
    if (!response.ok || !json?.ok) {
      setFeedback(json?.error?.message ?? "Throttle temizleme başarısız.");
      return;
    }
    setFeedback("Rate limit/throttle durumu temizlendi.");
    setResetOpen(false);
    await load();
  }

  return (
    <div className="space-y-5">
      <PageHeader title="SMTP Hesapları" description="SMTP hız ve warmup ayarlarını toplu yönetin." badge="Rate Control" />
      {feedback ? <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">{feedback}</div> : null}
      <section className="nexus-surface rounded-2xl p-4">
        <FilterBar>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SMTP ara..." className="nexus-input max-w-sm py-2 pl-3" />
          <div className="flex gap-2">
            <ActionButton variant="primary" onClick={() => setBulkOpen(true)}>Toplu Rate / Warmup Ayarla</ActionButton>
            <ActionButton onClick={() => setResetOpen(true)}>Rate Limit / Throttle Temizle</ActionButton>
          </div>
        </FilterBar>
        {loading ? <LoadingState lines={8} /> : null}
        {!loading && error ? <ErrorState description={error} onRetry={() => void load()} /> : null}
        {!loading && !error && filteredRows.length === 0 ? <EmptyState title="SMTP hesabı yok" description="Önce SMTP sağlayıcı ekleyin." /> : null}
        {!loading && !error && filteredRows.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/90">
                <tr>
                  <th className="px-3 py-2 text-left text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={filteredRows.length > 0 && selectedCount === filteredRows.length}
                      onChange={(e) => setSelectedIds(e.target.checked ? filteredRows.map((r) => r.id) : [])}
                    />
                  </th>
                  {["SMTP", "Durum", "Target RPS", "Max RPS", "Warmup", "Günlük/Saatlik/Dakikalık", "Throttle", "Cooldown"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs uppercase tracking-wide text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/80">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/70">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={(e) =>
                          setSelectedIds((prev) =>
                            e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-slate-200">{row.name} <span className="text-xs text-slate-400">({row.slug})</span></td>
                    <td className="px-3 py-2 text-slate-200">{row.isActive ? "Aktif" : "Pasif"} / {row.healthStatus}</td>
                    <td className="px-3 py-2 text-slate-200">{row.targetRatePerSecond}</td>
                    <td className="px-3 py-2 text-slate-200">{row.maxRatePerSecond}</td>
                    <td className="px-3 py-2 text-slate-200">{row.warmupEnabled ? `${row.warmupStartRps} -> ${row.warmupMaxRps}` : "Kapalı"}</td>
                    <td className="px-3 py-2 text-slate-200">{row.dailyCap ?? "-"} / {row.hourlyCap ?? "-"} / {row.minuteCap ?? "-"}</td>
                    <td className="px-3 py-2 text-slate-200">{row.isThrottled ? "Evet" : "Hayır"}</td>
                    <td className="px-3 py-2 text-slate-200">{row.cooldownUntil ? new Date(row.cooldownUntil).toLocaleString("tr-TR") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {bulkOpen ? (
        <ModalFrame title="Toplu SMTP Rate ve Warmup Ayarları" onClose={() => setBulkOpen(false)}>
          <div className="grid gap-3">
            <label className="text-sm text-slate-300">Scope</label>
            <select className="nexus-input py-2 pl-3" value={scope} onChange={(e) => setScope(e.target.value as BulkScope)}>
              <option value="all_active">Tüm aktif SMTP’ler</option>
              <option value="selected">Sadece seçili SMTP’ler</option>
              <option value="healthy">Sadece sağlıklı SMTP’ler</option>
              <option value="error">Sadece hata durumundaki SMTP’ler</option>
            </select>

            <label className="text-sm text-slate-300">Preset</label>
            <select className="nexus-input py-2 pl-3" value={preset} onChange={(e) => setPresetValues(e.target.value as BulkPreset)}>
              <option value="safe">Güvenli</option>
              <option value="balanced">Dengeli</option>
              <option value="fast">Hızlı</option>
              <option value="aggressive">Agresif</option>
              <option value="custom">Özel</option>
              <option value="daily_target">Global hedefe göre dağıt</option>
            </select>

            {preset === "daily_target" ? (
              <>
                <input className="nexus-input py-2 pl-3" type="number" min={1} value={dailyTarget} onChange={(e) => setDailyTarget(e.target.value)} placeholder="Günlük hedef" />
                {dailyPreview ? (
                  <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
                    <p>Toplam SMTP: {dailyPreview.toplam}</p>
                    <p>Kullanılacak SMTP: {dailyPreview.kullanilacak}</p>
                    <p>Günlük hedef: {dailyPreview.gunlukHedef}</p>
                    <p>SMTP başı günlük limit: {dailyPreview.smtpBasiGunluk}</p>
                    <p>SMTP başı RPS: {dailyPreview.smtpBasiRps.toFixed(4)}</p>
                    <p>Tahmini toplam RPS: {dailyPreview.tahminiToplamRps.toFixed(4)}</p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                <input className="nexus-input py-2 pl-3" type="number" step="0.01" value={values.targetRatePerSecond} onChange={(e) => setValues((v) => ({ ...v, targetRatePerSecond: e.target.value }))} placeholder="Target RPS" />
                <input className="nexus-input py-2 pl-3" type="number" step="0.01" value={values.maxRatePerSecond} onChange={(e) => setValues((v) => ({ ...v, maxRatePerSecond: e.target.value }))} placeholder="Max RPS" />
                <input className="nexus-input py-2 pl-3" type="number" step="0.01" value={values.warmupStartRps} onChange={(e) => setValues((v) => ({ ...v, warmupStartRps: e.target.value }))} placeholder="Warmup başlangıç RPS" />
                <input className="nexus-input py-2 pl-3" type="number" step="0.01" value={values.warmupIncrementStep} onChange={(e) => setValues((v) => ({ ...v, warmupIncrementStep: e.target.value }))} placeholder="Warmup artış adımı" />
                <input className="nexus-input py-2 pl-3" type="number" step="0.01" value={values.warmupMaxRps} onChange={(e) => setValues((v) => ({ ...v, warmupMaxRps: e.target.value }))} placeholder="Warmup max RPS" />
                <label className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200">
                  <input type="checkbox" checked={values.warmupEnabled} onChange={(e) => setValues((v) => ({ ...v, warmupEnabled: e.target.checked }))} />
                  Warmup aktif
                </label>
              </div>
            )}

            <div className="grid gap-2 md:grid-cols-3">
              <input className="nexus-input py-2 pl-3" type="number" min={1} value={values.dailyCap} onChange={(e) => setValues((v) => ({ ...v, dailyCap: e.target.value }))} placeholder="Günlük limit / SMTP" />
              <input className="nexus-input py-2 pl-3" type="number" min={1} value={values.hourlyCap} onChange={(e) => setValues((v) => ({ ...v, hourlyCap: e.target.value }))} placeholder="Saatlik limit / SMTP" />
              <input className="nexus-input py-2 pl-3" type="number" min={1} value={values.minuteCap} onChange={(e) => setValues((v) => ({ ...v, minuteCap: e.target.value }))} placeholder="Dakikalık limit / SMTP" />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              {[
                ["resetThrottle", "Throttle durumunu sıfırla"],
                ["clearCooldown", "Cooldown temizle"],
                ["clearLastError", "Son hata bilgisini temizle"],
                ["onlyActive", "Sadece aktif SMTP’lere uygula"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={Boolean(values[key as keyof typeof values])}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <ActionButton onClick={() => setBulkOpen(false)}>Vazgeç</ActionButton>
              <ActionButton variant="primary" onClick={() => void applyBulk()}>Kaydet</ActionButton>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {resetOpen ? (
        <ModalFrame title="Rate Limit / Throttle Temizle" onClose={() => setResetOpen(false)}>
          <div className="grid gap-3">
            <select className="nexus-input py-2 pl-3" value={scope} onChange={(e) => setScope(e.target.value as BulkScope)}>
              <option value="all_active">Tüm aktif SMTP’ler</option>
              <option value="selected">Sadece seçili SMTP’ler</option>
              <option value="healthy">Sadece sağlıklı SMTP’ler</option>
              <option value="error">Sadece hata durumundaki SMTP’ler</option>
            </select>
            <label className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200">
              <input type="checkbox" checked={includeAuthErrors} onChange={(e) => setIncludeAuthErrors(e.target.checked)} />
              Auth hatalarını da temizle
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200">
              <input type="checkbox" checked={setHealthy} onChange={(e) => setSetHealthy(e.target.checked)} />
              healthStatus = healthy olarak işaretle
            </label>
            <div className="flex justify-end gap-2">
              <ActionButton onClick={() => setResetOpen(false)}>Vazgeç</ActionButton>
              <ActionButton variant="danger" onClick={() => void applyResetThrottle()}>Temizle</ActionButton>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {confirmText ? (
        <ModalFrame title="Onay" onClose={() => setConfirmText(null)}>
          <p className="text-sm text-slate-300">{confirmText}</p>
          <div className="mt-4 flex justify-end gap-2">
            <ActionButton onClick={() => setConfirmText(null)}>Vazgeç</ActionButton>
            <ActionButton variant="primary" onClick={() => void confirmBulkApply()}>Uygula</ActionButton>
          </div>
        </ModalFrame>
      ) : null}
    </div>
  );
}

function ModalFrame({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="nexus-surface w-full max-w-3xl rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <ActionButton onClick={onClose}>Kapat</ActionButton>
        </div>
        {children}
      </div>
    </div>
  );
}
