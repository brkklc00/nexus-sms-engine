"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ActionButton } from "@/components/action-button";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { FilterBar } from "@/components/filter-bar";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";

type Provider = { id: string; name: string };
type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  isActive: boolean;
  smsCreditBalance: string;
  smsMarkupPercent: string;
  defaultProvider?: { id: string; name: string } | null;
  createdAt: string;
};

type ModalType =
  | null
  | { kind: "create" }
  | { kind: "edit"; user: UserItem }
  | { kind: "status"; user: UserItem }
  | { kind: "password"; user: UserItem }
  | { kind: "credit"; user: UserItem; creditType: "add" | "deduct" }
  | { kind: "detail"; user: UserItem };

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function AdminUsersCrud() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState<ModalType>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (q.trim()) params.set("q", q.trim());
      const [usersRes, providersRes] = await Promise.all([
        fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" }),
        fetch("/api/admin/providers", { cache: "no-store" }),
      ]);
      const usersJson = (await usersRes.json().catch(() => null)) as
        | { ok?: boolean; data?: { items?: UserItem[]; total?: number } }
        | null;
      const providersJson = (await providersRes.json().catch(() => null)) as
        | { ok?: boolean; data?: Provider[] }
        | null;
      if (!usersRes.ok || !usersJson?.ok) {
        setError("Kullanıcılar yüklenemedi.");
        setUsers([]);
        setTotal(0);
      } else {
        setUsers(usersJson.data?.items ?? []);
        setTotal(usersJson.data?.total ?? 0);
      }
      setProviders(providersJson?.ok && providersJson.data ? providersJson.data : []);
    } catch (requestError) {
      console.error("[admin-users-crud] load error", requestError);
      setError("Kullanıcılar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function submitCreate(formData: FormData) {
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? "customer"),
      isActive: formData.get("isActive") === "true",
      initialCredit: toNumber(String(formData.get("initialCredit") ?? "0")),
      smsMarkupPercent: toNumber(String(formData.get("smsMarkupPercent") ?? "0")),
      defaultProviderId: String(formData.get("defaultProviderId") ?? "") || null,
    };
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; error?: { message?: string } } | null;
    if (!response.ok || !json?.ok) {
      setToast({ type: "error", message: json?.error?.message ?? "Kullanıcı oluşturulamadı." });
      return;
    }
    setModal(null);
    setToast({ type: "success", message: "Kullanıcı oluşturuldu." });
    await load();
  }

  async function submitEdit(formData: FormData, userId: string) {
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      role: String(formData.get("role") ?? "customer"),
      isActive: formData.get("isActive") === "true",
      smsMarkupPercent: toNumber(String(formData.get("smsMarkupPercent") ?? "0")),
      defaultProviderId: String(formData.get("defaultProviderId") ?? "") || null,
    };
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; error?: { message?: string } } | null;
    if (!response.ok || !json?.ok) {
      setToast({ type: "error", message: json?.error?.message ?? "Kullanıcı güncellenemedi." });
      return;
    }
    setModal(null);
    setToast({ type: "success", message: "Kullanıcı güncellendi." });
    await load();
  }

  async function submitStatus(user: UserItem) {
    const response = await fetch(`/api/admin/users/${user.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; error?: { message?: string } } | null;
    if (!response.ok || !json?.ok) {
      setToast({ type: "error", message: json?.error?.message ?? "Durum güncellenemedi." });
      return;
    }
    setModal(null);
    setToast({ type: "success", message: "Kullanıcı durumu güncellendi." });
    await load();
  }

  async function submitPassword(formData: FormData, user: UserItem) {
    const payload = {
      password: String(formData.get("password") ?? ""),
      passwordConfirm: String(formData.get("passwordConfirm") ?? ""),
    };
    const response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; error?: { message?: string } } | null;
    if (!response.ok || !json?.ok) {
      setToast({ type: "error", message: json?.error?.message ?? "Şifre güncellenemedi." });
      return;
    }
    setModal(null);
    setToast({ type: "success", message: "Şifre güncellendi." });
  }

  async function submitCredit(formData: FormData, user: UserItem, creditType: "add" | "deduct") {
    const payload = {
      type: creditType,
      amount: toNumber(String(formData.get("amount") ?? "0")),
      description: String(formData.get("description") ?? ""),
    };
    const response = await fetch(`/api/admin/users/${user.id}/credit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; error?: { message?: string } } | null;
    if (!response.ok || !json?.ok) {
      setToast({ type: "error", message: json?.error?.message ?? "Kredi işlemi başarısız." });
      return;
    }
    setModal(null);
    setToast({
      type: "success",
      message: creditType === "add" ? "Kredi eklendi." : "Kredi düşüldü.",
    });
    await load();
  }

  async function openDetail(user: UserItem) {
    setModal({ kind: "detail", user });
    const response = await fetch(`/api/admin/users/${user.id}/summary`, { cache: "no-store" });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; data?: Record<string, unknown> } | null;
    if (!response.ok || !json?.ok) {
      setDetail(null);
      setToast({ type: "warning", message: "Detay bilgisi alınamadı." });
      return;
    }
    setDetail(json.data ?? null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kullanıcı Yönetimi"
        description="Kullanıcı oluşturma, düzenleme, kredi ve şifre işlemlerini tek panelden yönetin."
        badge="Admin CRUD"
      />

      {toast ? (
        <div
          className={[
            "rounded-xl border px-4 py-2 text-sm",
            toast.type === "success" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "",
            toast.type === "error" ? "border-rose-400/30 bg-rose-500/10 text-rose-200" : "",
            toast.type === "warning" ? "border-amber-400/30 bg-amber-500/10 text-amber-200" : "",
          ].join(" ")}
        >
          {toast.message}
        </div>
      ) : null}

      <section className="nexus-surface rounded-2xl p-4">
        <FilterBar>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="nexus-input max-w-sm py-2 pl-3"
            placeholder="Ad veya e-posta ara..."
          />
          <div className="flex gap-2">
            <ActionButton
              onClick={() => {
                setPage(1);
                void load();
              }}
            >
              Filtrele
            </ActionButton>
            <ActionButton
              variant="primary"
              onClick={() => {
                setModal({ kind: "create" });
              }}
            >
              + Yeni Kullanıcı
            </ActionButton>
          </div>
        </FilterBar>

        {loading ? <LoadingState lines={8} /> : null}
        {!loading && error ? <ErrorState description={error} onRetry={() => void load()} /> : null}
        {!loading && !error && users.length === 0 ? (
          <EmptyState title="Henüz kullanıcı yok" description="Yeni kullanıcı ekleyerek başlayabilirsiniz." />
        ) : null}

        {!loading && !error && users.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/90">
                <tr>
                  {[
                    "Ad",
                    "E-posta",
                    "Rol",
                    "Durum",
                    "Kredi",
                    "Markup %",
                    "Varsayılan Sağlayıcı",
                    "Oluşturma",
                    "Son Giriş",
                    "Aksiyonlar",
                  ].map((header) => (
                    <th key={header} className="px-3 py-2 text-left text-xs uppercase tracking-wide text-slate-400">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/80">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/70">
                    <td className="px-3 py-2 text-slate-200">{user.name}</td>
                    <td className="px-3 py-2 text-slate-200">{user.email}</td>
                    <td className="px-3 py-2 text-slate-200">{user.role}</td>
                    <td className="px-3 py-2 text-slate-200">{user.isActive ? "Aktif" : "Pasif"}</td>
                    <td className="px-3 py-2 text-slate-200">{String(user.smsCreditBalance)}</td>
                    <td className="px-3 py-2 text-slate-200">{String(user.smsMarkupPercent)}</td>
                    <td className="px-3 py-2 text-slate-200">{user.defaultProvider?.name ?? "-"}</td>
                    <td className="px-3 py-2 text-slate-200">{new Date(user.createdAt).toLocaleString("tr-TR")}</td>
                    <td className="px-3 py-2 text-slate-200">-</td>
                    <td className="px-3 py-2">
                      <details className="relative">
                        <summary className="cursor-pointer list-none rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-200">
                          İşlemler
                        </summary>
                        <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-white/10 bg-slate-950 p-2 shadow-xl">
                          <div className="grid gap-1">
                            <ActionButton onClick={() => void openDetail(user)}>Detay</ActionButton>
                            <ActionButton onClick={() => setModal({ kind: "edit", user })}>Düzenle</ActionButton>
                            <ActionButton onClick={() => setModal({ kind: "credit", user, creditType: "add" })}>Kredi Ekle</ActionButton>
                            <ActionButton onClick={() => setModal({ kind: "credit", user, creditType: "deduct" })}>Kredi Düş</ActionButton>
                            <ActionButton onClick={() => setModal({ kind: "password", user })}>Şifre Sıfırla</ActionButton>
                            <ActionButton variant={user.isActive ? "danger" : "default"} onClick={() => setModal({ kind: "status", user })}>
                              {user.isActive ? "Pasif Yap" : "Aktif Yap"}
                            </ActionButton>
                            <Link className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" href={`/admin/campaigns?userId=${user.id}`}>
                              Kullanıcı Kampanyaları
                            </Link>
                            <Link className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" href={`/admin/phone-books?userId=${user.id}`}>
                              Kullanıcı Rehberleri
                            </Link>
                            <Link className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" href={`/admin/credit-transactions?userId=${user.id}`}>
                              Kredi Hareketleri
                            </Link>
                          </div>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>
            Toplam: {total} kayıt - Sayfa {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <ActionButton disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Önceki
            </ActionButton>
            <ActionButton disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
              Sonraki
            </ActionButton>
          </div>
        </div>
      </section>

      {modal?.kind === "create" ? (
        <UserModal
          title="Yeni Kullanıcı"
          providers={providers}
          onClose={() => setModal(null)}
          onSubmit={submitCreate}
          submitText="Kullanıcı Oluştur"
        />
      ) : null}
      {modal?.kind === "edit" ? (
        <UserModal
          title="Kullanıcı Düzenle"
          providers={providers}
          user={modal.user}
          onClose={() => setModal(null)}
          onSubmit={(formData) => void submitEdit(formData, modal.user.id)}
          submitText="Güncelle"
        />
      ) : null}
      {modal?.kind === "status" ? (
        <ConfirmModal
          title={modal.user.isActive ? "Kullanıcıyı Pasif Yap" : "Kullanıcıyı Aktif Yap"}
          description={`"${modal.user.name}" kullanıcısının durumunu değiştirmek istediğinize emin misiniz?`}
          onClose={() => setModal(null)}
          onConfirm={() => void submitStatus(modal.user)}
          confirmText={modal.user.isActive ? "Pasif Yap" : "Aktif Yap"}
          confirmVariant={modal.user.isActive ? "danger" : "primary"}
        />
      ) : null}
      {modal?.kind === "password" ? (
        <PasswordModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSubmit={(formData) => void submitPassword(formData, modal.user)}
        />
      ) : null}
      {modal?.kind === "credit" ? (
        <CreditModal
          user={modal.user}
          creditType={modal.creditType}
          onClose={() => setModal(null)}
          onSubmit={(formData) => void submitCredit(formData, modal.user, modal.creditType)}
        />
      ) : null}
      {modal?.kind === "detail" ? (
        <DetailModal user={modal.user} detail={detail} onClose={() => setModal(null)} />
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
      <div className="nexus-surface w-full max-w-2xl rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <ActionButton onClick={onClose}>Kapat</ActionButton>
        </div>
        {children}
      </div>
    </div>
  );
}

function UserModal({
  title,
  providers,
  user,
  onClose,
  onSubmit,
  submitText,
}: {
  title: string;
  providers: Provider[];
  user?: UserItem;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  submitText: string;
}) {
  return (
    <ModalFrame title={title} onClose={onClose}>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          onSubmit(formData);
        }}
      >
        <input name="name" defaultValue={user?.name ?? ""} required minLength={2} placeholder="Ad" className="nexus-input py-2 pl-3" />
        <input name="email" type="email" defaultValue={user?.email ?? ""} required placeholder="E-posta" className="nexus-input py-2 pl-3" />
        {!user ? (
          <input name="password" type="password" required minLength={8} placeholder="Şifre (min 8 karakter)" className="nexus-input py-2 pl-3" />
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <select name="role" defaultValue={user?.role ?? "customer"} className="nexus-input py-2 pl-3">
            <option value="customer">customer</option>
            <option value="admin">admin</option>
          </select>
          <select name="isActive" defaultValue={user?.isActive ? "true" : "false"} className="nexus-input py-2 pl-3">
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
          {!user ? <input name="initialCredit" type="number" min={0} step="0.01" defaultValue="0" className="nexus-input py-2 pl-3" placeholder="Başlangıç kredisi" /> : null}
          <input
            name="smsMarkupPercent"
            type="number"
            min={0}
            step="0.01"
            defaultValue={String(user?.smsMarkupPercent ?? "0")}
            className="nexus-input py-2 pl-3"
            placeholder="SMS markup %"
          />
        </div>
        <select name="defaultProviderId" defaultValue={user?.defaultProvider?.id ?? ""} className="nexus-input py-2 pl-3">
          <option value="">Varsayılan sağlayıcı yok</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <ActionButton onClick={onClose}>Vazgeç</ActionButton>
          <ActionButton type="submit" variant="primary">
            {submitText}
          </ActionButton>
        </div>
      </form>
    </ModalFrame>
  );
}

function PasswordModal({
  user,
  onClose,
  onSubmit,
}: {
  user: UserItem;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <ModalFrame title={`Şifre Sıfırla - ${user.name}`} onClose={onClose}>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(new FormData(event.currentTarget));
        }}
      >
        <input name="password" type="password" minLength={8} required className="nexus-input py-2 pl-3" placeholder="Yeni şifre" />
        <input name="passwordConfirm" type="password" minLength={8} required className="nexus-input py-2 pl-3" placeholder="Şifre tekrar" />
        <div className="flex justify-end gap-2">
          <ActionButton onClick={onClose}>Vazgeç</ActionButton>
          <ActionButton type="submit" variant="primary">
            Şifreyi Güncelle
          </ActionButton>
        </div>
      </form>
    </ModalFrame>
  );
}

function CreditModal({
  user,
  creditType,
  onClose,
  onSubmit,
}: {
  user: UserItem;
  creditType: "add" | "deduct";
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <ModalFrame title={`${creditType === "add" ? "Kredi Ekle" : "Kredi Düş"} - ${user.name}`} onClose={onClose}>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(new FormData(event.currentTarget));
        }}
      >
        <input name="amount" type="number" min={0.01} step="0.01" required className="nexus-input py-2 pl-3" placeholder="Tutar" />
        <textarea name="description" required className="nexus-input min-h-24 py-2 pl-3" placeholder="Açıklama" />
        <div className="flex justify-end gap-2">
          <ActionButton onClick={onClose}>Vazgeç</ActionButton>
          <ActionButton type="submit" variant={creditType === "add" ? "primary" : "danger"}>
            {creditType === "add" ? "Kredi Ekle" : "Kredi Düş"}
          </ActionButton>
        </div>
      </form>
    </ModalFrame>
  );
}

function ConfirmModal({
  title,
  description,
  onClose,
  onConfirm,
  confirmText,
  confirmVariant,
}: {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmText: string;
  confirmVariant: "primary" | "danger";
}) {
  return (
    <ModalFrame title={title} onClose={onClose}>
      <p className="text-sm text-slate-300">{description}</p>
      <div className="mt-4 flex justify-end gap-2">
        <ActionButton onClick={onClose}>Vazgeç</ActionButton>
        <ActionButton variant={confirmVariant} onClick={onConfirm}>
          {confirmText}
        </ActionButton>
      </div>
    </ModalFrame>
  );
}

function DetailModal({
  user,
  detail,
  onClose,
}: {
  user: UserItem;
  detail: Record<string, unknown> | null;
  onClose: () => void;
}) {
  const stats = (detail?.stats ?? {}) as { phoneBookCount?: number; blacklistCount?: number; lastLoginAt?: string | null };
  const recentCredits = (detail?.recentCredits ?? []) as Array<Record<string, unknown>>;
  const recentCampaigns = (detail?.recentCampaigns ?? []) as Array<Record<string, unknown>>;

  return (
    <ModalFrame title={`Kullanıcı Detayı - ${user.name}`} onClose={onClose}>
      {!detail ? (
        <LoadingState lines={4} />
      ) : (
        <div className="space-y-4 text-sm text-slate-200">
          <div className="grid gap-2 md:grid-cols-2">
            <p>
              <span className="text-slate-400">E-posta:</span> {user.email}
            </p>
            <p>
              <span className="text-slate-400">Kredi:</span> {String(user.smsCreditBalance)}
            </p>
            <p>
              <span className="text-slate-400">Rehber Sayısı:</span> {String(stats.phoneBookCount ?? 0)}
            </p>
            <p>
              <span className="text-slate-400">Blacklist Sayısı:</span> {String(stats.blacklistCount ?? 0)}
            </p>
            <p>
              <span className="text-slate-400">Son Giriş:</span>{" "}
              {stats.lastLoginAt ? new Date(stats.lastLoginAt).toLocaleString("tr-TR") : "-"}
            </p>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Son Kredi Hareketleri</h4>
            {recentCredits.length === 0 ? (
              <EmptyState title="Kredi hareketi yok" description="Henüz kredi işlemi görünmüyor." />
            ) : (
              <ul className="space-y-1">
                {recentCredits.map((credit, index) => (
                  <li key={index} className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2">
                    {String(credit.type)} - {String(credit.amount)} ({new Date(String(credit.createdAt)).toLocaleString("tr-TR")})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Son Kampanyalar</h4>
            {recentCampaigns.length === 0 ? (
              <EmptyState title="Kampanya yok" description="Henüz kampanya görünmüyor." />
            ) : (
              <ul className="space-y-1">
                {recentCampaigns.map((campaign, index) => (
                  <li key={index} className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2">
                    {String(campaign.name)} - {String(campaign.status)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </ModalFrame>
  );
}
