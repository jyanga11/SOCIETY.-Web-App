"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type AcceptStatus = "new" | "acknowledged" | "won" | "lost" | "rejected";
type Inquiry = {
  id: number;
  customer_id: number | null;
  email: string;
  description: string;
  service_type: string | null;
  source: string | null;
  status: AcceptStatus;
  production_status: string;
  payment_status: string;
  total_amount: number | null;
  invoice_description: string | null;
  payment_terms_days: number | null;
  currency: string;
  trello_card_id: string | null;
  stripe_invoice_url: string | null;
  stripe_invoice_id: string | null;
  created_at: string;
};

const STATUSES: AcceptStatus[] = ["new", "acknowledged", "won", "lost", "rejected"];
const money = (cents: number | null, currency: string) =>
  cents == null ? "Not quoted" : new Intl.NumberFormat("en-US", {
    style: "currency", currency: currency || "USD",
  }).format(cents / 100);
const date = (value: string) => new Date(value).toLocaleDateString(undefined, {
  month: "short", day: "numeric", year: "numeric",
});
const label = (value: string) => value.replaceAll("_", " ");

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState<AcceptStatus>("new");
  const [quote, setQuote] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [paymentTermsDays, setPaymentTermsDays] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const response = await fetch("/api/admin/inquiries", { cache: "no-store" });
      if (!response.ok) {
        const body = await response.text();
      
        console.error("Inquiries API error:", {
          status: response.status,
          body,
        });
      
        throw new Error(
          `Couldn't load inquiries (${response.status}): ${body}`
        );
      }
      const result: unknown = await response.json();
      // Accept either a plain array or a paginated { items: [...] } response.
      const items = Array.isArray(result) ? result :
        result && typeof result === "object" && "items" in result ?
          (result as { items: Inquiry[] }).items : null;
      if (!Array.isArray(items)) throw new Error("Unexpected inquiries API response");
      setInquiries(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load inquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = inquiries.find((i) => i.id === selectedId) ?? null;
  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status);
    setQuote(selected.total_amount == null ? "" : (selected.total_amount / 100).toFixed(2));
    setInvoiceDescription(selected.invoice_description ?? "");
    setPaymentTermsDays(selected.payment_terms_days == null ? "" : String(selected.payment_terms_days));
    setNotice("");
  }, [selectedId, selected?.status, selected?.total_amount, selected?.invoice_description, selected?.payment_terms_days]);

  const filtered = useMemo(() => inquiries.filter((i) => {
    const matchesStatus = filter === "all" || i.status === filter;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [i.email, i.service_type ?? "", i.description, String(i.id)]
      .some((value) => value.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [inquiries, search, filter]);

  async function save() {
    if (!selected || saving) return;
    const trimmed = quote.trim();
    const amount = trimmed === "" ? null : Math.round(Number(trimmed) * 100);
    const description = invoiceDescription.trim();
    const terms = paymentTermsDays === "" ? null : Number(paymentTermsDays);

    // All three invoice fields are required for every Save action.
    if (amount === null || !Number.isFinite(amount) || amount <= 0) {
      setNotice("Enter a positive quote amount.");
      return;
    }
    if (!description) {
      setNotice("Enter an invoice description.");
      return;
    }
    if (description.length > 1000) {
      setNotice("Invoice description must be 1,000 characters or fewer.");
      return;
    }
    if (terms === null || ![7, 14, 30].includes(terms)) {
      setNotice("Select payment terms.");
      return;
    }
    if (selected.stripe_invoice_id && (
      amount !== selected.total_amount ||
      description !== (selected.invoice_description ?? "") ||
      terms !== selected.payment_terms_days
    )) {
      setNotice("Invoice details can't be changed after an invoice has been created.");
      return;
    }

    const updates: {
      status?: AcceptStatus;
      total_amount?: number;
      invoice_description?: string;
      payment_terms_days?: number;
    } = {};
    if (status !== selected.status) updates.status = status;
    if (amount !== selected.total_amount) updates.total_amount = amount;
    if (description !== (selected.invoice_description ?? "")) updates.invoice_description = description;
    if (terms !== selected.payment_terms_days) updates.payment_terms_days = terms;
    if (!Object.keys(updates).length) { setNotice("No changes to save."); return; }
    setSaving(true); setNotice("");
    try {
      const response = await fetch(`/api/admin/inquiries/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.detail ?? body?.error;
        throw new Error(
          typeof message === "string"
            ? message
            : `Couldn't save inquiry (${response.status})`
        );
      }
      const updated: Inquiry = await response.json();
      setInquiries((current) => current.map((i) => i.id === updated.id ? updated : i));
      setNotice("Inquiry updated. Won inquiries will be queued for Trello and Stripe.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Couldn't save inquiry");
    } finally { setSaving(false); }
  }

  const counts = {
    total: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    active: inquiries.filter((i) => ["acknowledged", "won"].includes(i.status)).length,
    won: inquiries.filter((i) => i.status === "won").length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Inquiries</h1>
          <p className="mt-2 text-sm text-neutral-500">Review service requests, send quotes, and track projects.</p>
        </div>
        <button onClick={() => { setLoading(true); void load(); }} className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-neutral-100">Refresh</button>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {([ ["Total inquiries", counts.total], ["New leads", counts.new], ["Active / won", counts.active], ["Won", counts.won] ] as const).map(([name, count]) => (
          <div key={name} className="rounded-xl border bg-white p-5">
            <p className="text-sm text-neutral-500">{name}</p>
            <p className="mt-2 text-3xl font-semibold">{count}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-wrap gap-3 border-b p-4">
          <input aria-label="Search inquiries" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email, service, or ID" className="min-w-56 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300" />
          <select aria-label="Filter status" value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        </div>
        {error && <p role="alert" className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading ? <p className="p-8 text-center text-neutral-500">Loading inquiries…</p> : filtered.length === 0 ?
          <p className="p-8 text-center text-neutral-500">No inquiries match your filters.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500"><tr>
                <th className="px-5 py-3">Inquiry</th><th className="px-5 py-3">Service</th><th className="px-5 py-3">Accept Status</th><th className="px-5 py-3">Production Status</th><th className="px-5 py-3">Payment Status</th><th className="px-5 py-3">Quote</th><th className="px-5 py-3">Received</th>
              </tr></thead>
              <tbody className="divide-y">
                {filtered.map((i) => <tr key={i.id} onClick={() => setSelectedId(i.id)} className="cursor-pointer hover:bg-neutral-50">
                  <td className="px-5 py-4"><span className="font-medium">#{i.id}</span><div className="mt-1 max-w-48 truncate text-neutral-500">{i.email}</div></td>
                  <td className="px-5 py-4">{i.service_type || "General inquiry"}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-neutral-100 px-2.5 py-1 capitalize">{label(i.status)}</span></td>
                  <td className="px-5 py-4 capitalize text-neutral-600">{label(i.production_status)}</td>
                  <td className="px-5 py-4 capitalize text-neutral-600">{label(i.payment_status)}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{money(i.total_amount, i.currency)}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-neutral-500">{date(i.created_at)}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && <div className="fixed inset-0 z-[100] flex justify-end bg-black/40" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}>
        <aside role="dialog" aria-modal="true" aria-label={`Inquiry ${selected.id}`} className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-sm text-neutral-500">Service inquiry #{selected.id}</p><h2 className="mt-1 text-2xl font-semibold">{selected.service_type || "General inquiry"}</h2></div>
            <button onClick={() => setSelectedId(null)} aria-label="Close inquiry" className="rounded-lg border px-3 py-2 text-sm">Close</button>
          </div>
          <div className="mt-6 space-y-5 text-sm">
            <div><p className="text-neutral-500">Customer</p><a className="font-medium underline" href={`mailto:${selected.email}`}>{selected.email}</a></div>
            <div><p className="text-neutral-500">Received</p><p>{date(selected.created_at)}</p></div>
            <div><p className="text-neutral-500">Source</p><p>{selected.source || "Not specified"}</p></div>
            <div><p className="mb-2 text-neutral-500">Project description</p><p className="whitespace-pre-wrap rounded-lg bg-neutral-50 p-4 leading-relaxed">{selected.description}</p></div>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-neutral-50 p-4">
              <div><p className="text-neutral-500">Production</p><p className="mt-1 font-medium capitalize">{label(selected.production_status)}</p></div>
              <div><p className="text-neutral-500">Payment</p><p className="mt-1 font-medium capitalize">{label(selected.payment_status)}</p></div>
            </div>
            {selected.stripe_invoice_url && <a href={selected.stripe_invoice_url} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-medium underline">View Stripe invoice ↗</a>}
            <div className="border-t pt-6"><h3 className="mb-4 text-lg font-semibold">Manage Inquiry</h3>
              <label className="mb-2 block font-medium" htmlFor="inquiry-status">Accept Status</label>
              <select id="inquiry-status" value={status} onChange={(e) => setStatus(e.target.value as AcceptStatus)} className="mb-5 w-full rounded-lg border bg-white px-3 py-2.5">
                {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
              </select>
              <label className="mb-2 block font-medium" htmlFor="inquiry-quote">Quote ({selected.currency.toUpperCase()})</label>
              <input id="inquiry-quote" type="number" min="0.01" step="0.01" placeholder="0.00" value={quote} onChange={(e) => setQuote(e.target.value)} required disabled={Boolean(selected.stripe_invoice_id)} className="w-full rounded-lg border px-3 py-2.5 disabled:bg-neutral-100" />
              <label className="mb-2 mt-5 block font-medium" htmlFor="inquiry-invoice-description">Invoice description <span className="text-red-600">*</span></label>
              <textarea
                id="inquiry-invoice-description"
                rows={3}
                required
                maxLength={1000}
                placeholder="Describe the agreed deliverables and scope of work"
                value={invoiceDescription}
                onChange={(e) => setInvoiceDescription(e.target.value)}
                disabled={Boolean(selected.stripe_invoice_id)}
                className="w-full resize-y rounded-lg border px-3 py-2.5 disabled:bg-neutral-100"
              />
              <label className="mb-2 mt-5 block font-medium" htmlFor="inquiry-payment-terms">Payment terms <span className="text-red-600">*</span></label>
              <select
                id="inquiry-payment-terms"
                required
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(e.target.value)}
                disabled={Boolean(selected.stripe_invoice_id)}
                className="w-full rounded-lg border bg-white px-3 py-2.5 disabled:bg-neutral-100"
              >
                <option value="">Select payment terms</option>
                <option value="7">Net 7 — due in 7 days</option>
                <option value="14">Net 14 — due in 14 days</option>
                <option value="30">Net 30 — due in 30 days</option>
              </select>
              <p className="mt-3 text-xs text-neutral-500">All three invoice fields are required to save changes. Marking an inquiry as won queues its Trello card and Stripe invoice. Invoice details are locked once Stripe creates the invoice.</p>
              {notice && <p role="status" className="mt-4 rounded-lg bg-neutral-100 p-3 text-sm">{notice}</p>}
              <button onClick={() => void save()} disabled={saving} className="mt-5 w-full rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white hover:bg-neutral-700 disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        </aside>
      </div>}
    </div>
  );
}
