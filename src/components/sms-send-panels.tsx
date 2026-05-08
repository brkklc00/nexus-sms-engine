"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { ResourceTablePage } from "@/components/resource-table-page";

type Provider = { id: string; name: string };
type PhoneBook = { id: string; name: string; totalCount: number };

export function SmsIndividualPanel() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [message, setMessage] = useState("");
  const [origin, setOrigin] = useState("NEXUS");
  const [providerId, setProviderId] = useState("");
  const [numbersText, setNumbersText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/sms/providers", { cache: "no-store" });
      const json = (await response.json().catch(() => null)) as
        | { ok?: boolean; data?: Provider[] }
        | null;
      const list = json?.ok && json.data ? json.data : [];
      setProviders(list);
      if (list[0]) setProviderId(list[0].id);
    })();
  }, []);

  async function submit() {
    const numbers = numbersText
      .split(/[\n,;\s]+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 10);

    const response = await fetch("/api/sms/send/individual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numbers, message, origin, providerId, queued: true }),
    });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    setFeedback(response.ok && json?.ok !== false ? "Bireysel SMS kuyruğa alındı." : (json?.message ?? "Gönderim başarısız."));
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Bireysel SMS" description="En fazla 10 alıcıya bireysel SMS gönderin." badge="Canlı Gönderim" />
      <section className="nexus-surface rounded-2xl p-5">
        {feedback ? <p className="mb-3 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">{feedback}</p> : null}
        <div className="grid gap-3 md:grid-cols-2">
          <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="nexus-input py-2 pl-3" placeholder="Origin" />
          <select value={providerId} onChange={(e) => setProviderId(e.target.value)} className="nexus-input py-2 pl-3">
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={numbersText}
          onChange={(e) => setNumbersText(e.target.value)}
          className="nexus-input mt-3 min-h-20 py-2 pl-3"
          placeholder="Telefonlar (virgül, boşluk veya satır ile)"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="nexus-input mt-3 min-h-24 py-2 pl-3"
          placeholder="Mesaj metni"
        />
        <button onClick={() => void submit()} className="nexus-btn-primary mt-3 rounded-lg px-4 py-2 text-sm">
          Gönder
        </button>
      </section>
      <ResourceTablePage
        title="Bireysel Geçmiş"
        description="Gönderilen bireysel SMS kayıtları"
        endpoint="/api/sms/history/individual"
        columns={[
          { key: "phoneE164", label: "Alıcı" },
          { key: "status", label: "Durum" },
          { key: "cost", label: "Maliyet" },
          {
            key: "createdAt",
            label: "Tarih",
            render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
          },
        ]}
      />
    </div>
  );
}

export function SmsBulkPanel() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [phoneBooks, setPhoneBooks] = useState<PhoneBook[]>([]);
  const [targetType, setTargetType] = useState<"phonebook" | "paste">("phonebook");
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("NEXUS");
  const [message, setMessage] = useState("");
  const [providerId, setProviderId] = useState("");
  const [phoneBookId, setPhoneBookId] = useState("");
  const [numbersText, setNumbersText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [providersRes, booksRes] = await Promise.all([
        fetch("/api/sms/providers", { cache: "no-store" }),
        fetch("/api/sms/phone-books", { cache: "no-store" }),
      ]);
      const providersJson = (await providersRes.json().catch(() => null)) as { ok?: boolean; data?: Provider[] } | null;
      const booksJson = (await booksRes.json().catch(() => null)) as { ok?: boolean; data?: { items?: PhoneBook[] } } | null;
      const providerItems = providersJson?.ok && providersJson.data ? providersJson.data : [];
      setProviders(providerItems);
      if (providerItems[0]) setProviderId(providerItems[0].id);
      const bookItems = booksJson?.ok ? (booksJson.data?.items ?? []) : [];
      setPhoneBooks(bookItems);
      if (bookItems[0]) setPhoneBookId(bookItems[0].id);
    })();
  }, []);

  async function submit() {
    const response = await fetch("/api/sms/send/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        origin,
        message,
        providerId,
        targetType,
        phoneBookId: targetType === "phonebook" ? phoneBookId : undefined,
        numbersText: targetType === "paste" ? numbersText : undefined,
        skipBlacklist: true,
        skipDuplicates: true,
      }),
    });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    setFeedback(response.ok && json?.ok !== false ? "Kampanya oluşturuldu ve kuyruğa alındı." : (json?.message ?? "Gönderim başarısız."));
  }

  return (
    <div className="space-y-5">
      <PageHeader title="SMS Gönder" description="Toplu kampanya oluşturup canlı kuyruğa alın." badge="Bulk Send" />
      <section className="nexus-surface rounded-2xl p-5">
        {feedback ? <p className="mb-3 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">{feedback}</p> : null}
        <div className="grid gap-3 md:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} className="nexus-input py-2 pl-3" placeholder="Kampanya adı" />
          <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="nexus-input py-2 pl-3" placeholder="Origin" />
          <select value={providerId} onChange={(e) => setProviderId(e.target.value)} className="nexus-input py-2 pl-3">
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
          <select value={targetType} onChange={(e) => setTargetType(e.target.value as "phonebook" | "paste")} className="nexus-input py-2 pl-3">
            <option value="phonebook">Rehber</option>
            <option value="paste">Manuel Numara</option>
          </select>
        </div>
        {targetType === "phonebook" ? (
          <select value={phoneBookId} onChange={(e) => setPhoneBookId(e.target.value)} className="nexus-input mt-3 py-2 pl-3">
            {phoneBooks.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name} ({book.totalCount})
              </option>
            ))}
          </select>
        ) : (
          <textarea
            value={numbersText}
            onChange={(e) => setNumbersText(e.target.value)}
            className="nexus-input mt-3 min-h-20 py-2 pl-3"
            placeholder="Telefonlar (virgül, boşluk veya satır ile)"
          />
        )}
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="nexus-input mt-3 min-h-24 py-2 pl-3" placeholder="Mesaj metni" />
        <button onClick={() => void submit()} className="nexus-btn-primary mt-3 rounded-lg px-4 py-2 text-sm">
          Kampanya Gönder
        </button>
      </section>
      <ResourceTablePage
        title="Kampanya Geçmişi"
        description="Kendi kampanyalarınız"
        endpoint="/api/sms/campaigns"
        columns={[
          { key: "name", label: "Kampanya" },
          { key: "status", label: "Durum" },
          { key: "totalCount", label: "Toplam" },
          { key: "deliveredCount", label: "Başarılı" },
          {
            key: "createdAt",
            label: "Tarih",
            render: (row) => new Date(String(row.createdAt)).toLocaleString("tr-TR"),
          },
        ]}
      />
    </div>
  );
}
