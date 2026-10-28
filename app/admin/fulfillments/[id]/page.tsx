"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const TZ = "America/Chicago";

type Address = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

type Customer = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
};

type OrderItem = {
  id: number;
  product_name: string;
  variant_name: string | null;
  size: string | null;
  quantity: number;
};

type Fulfillment = {
  id: number;
  order_id: number;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  drop_name: string | null;
  order: {
    id: number;
    payment_status: string;
    customer_email: string | null;
    customer: Customer | null;
    shipping_details: { name?: string | null; address?: Address | null } | null;
    items: OrderItem[];
  } | null;
};

const STEPS = [
  { status: "unfulfilled", label: "Unfulfilled" },
  { status: "processing", label: "Processing" },
  { status: "packing", label: "Packing" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
] as const;

const NEXT_ACTION: Record<string, { label: string; status: string } | undefined> = {
  unfulfilled: { label: "Start processing", status: "processing" },
  processing: { label: "Start packing", status: "packing" },
  packing: { label: "Mark shipped", status: "shipped" },
  shipped: { label: "Mark delivered", status: "delivered" },
};

const STATUS_STYLE: Record<string, string> = {
  unfulfilled: "bg-amber-100 text-amber-900",
  processing: "bg-blue-100 text-blue-900",
  packing: "bg-indigo-100 text-indigo-900",
  shipped: "bg-purple-100 text-purple-900",
  delivered: "bg-green-100 text-green-900",
  cancelled: "bg-neutral-200 text-neutral-700",
};

function statusLabel(status: string) {
  return status === "packing" ? "Packing" : status.replaceAll("_", " ");
}

function formatDateTime(value?: string | null) {
    if (!value) return "Not yet";
  
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
  
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  }

  function addressFrom(data: Fulfillment): Address | null {
    return data.order?.shipping_details?.address ?? null;
  }

  function shippingName(data: Fulfillment): string | null {
    return (
      data.order?.shipping_details?.name ??
      data.order?.customer?.name ??
      null
    );
  }

function trackingUrl(carrier: string | null, tracking: string | null) {
  if (!carrier || !tracking) return null;
  const number = encodeURIComponent(tracking.trim());
  switch (carrier) {
    case "USPS": return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${number}`;
    case "UPS": return `https://www.ups.com/track?tracknum=${number}`;
    case "FedEx": return `https://www.fedex.com/fedextrack/?trknbr=${number}`;
    case "DHL": return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${number}`;
    default: return null;
  }
}

export default function FulfillmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [fulfillment, setFulfillment] = useState<Fulfillment | null>(null);
  const [carrier, setCarrier] = useState("USPS");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/fulfillments/${id}`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 404 ? "Fulfillment not found." : "Could not load this fulfillment.");
      const data: Fulfillment = await response.json();
      console.log("Fulfillment: ", data);
      setFulfillment(data);
      setCarrier(data.carrier || "USPS");
      setTrackingNumber(data.tracking_number || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this fulfillment.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { console.log("useEffect"); void load(); }, [load]);

  const address = fulfillment ? addressFrom(fulfillment) : null;
  const name = fulfillment ? shippingName(fulfillment) : null;
  const phone = fulfillment?.order?.customer?.phone ?? null;
  const paymentStatus = fulfillment?.order?.payment_status?.toLowerCase() ?? "";
  const unpaid = ["pending", "processing", "failed", "expired"].includes(paymentStatus);
  const refunded = ["refunded", "partially_refunded"].includes(paymentStatus);
  const blocked = unpaid || refunded;
  const action = fulfillment ? NEXT_ACTION[fulfillment.status] : undefined;
  const shippingReady = carrier.trim().length > 0 && trackingNumber.trim().length > 0;
  const shipDisabled = saving || blocked || fulfillment?.status === "delivered" ||
    fulfillment?.status === "cancelled" || !shippingReady;

  async function update(patch: Record<string, unknown>, successMessage: string) {
    if (!fulfillment) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/fulfillments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail || "Could not update fulfillment.");
      }
      // Reload canonical server state rather than assuming the mutation succeeded.
      await load();
      setNotice(successMessage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update fulfillment.");
    } finally {
      setSaving(false);
    }
  }

  async function advance() {
    if (!fulfillment || !action) return;
    if (action.status === "shipped") {
      if (shipDisabled) return;
      await update({ status: "shipped", carrier: carrier.trim(), tracking_number: trackingNumber.trim() }, "Fulfillment marked shipped.");
      return;
    }
    if (action.status === "delivered") {
      await update({ status: "delivered" }, "Fulfillment marked delivered.");
      return;
    }
    await update({ status: action.status }, `Status updated to ${statusLabel(action.status).toLowerCase()}.`);
  }

  async function cancelFulfillment() {
    if (!fulfillment || fulfillment.status === "cancelled" || fulfillment.status === "delivered") return;
    if (!window.confirm("Cancel this fulfillment? This will stop further fulfillment actions.")) return;
    await update({ status: "cancelled" }, "Fulfillment cancelled.");
  }

  async function copyAddress() {
    if (!address) return;
    const text = [
      name,
      address.line1,
      address.line2,
      [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
      address.country,
    ].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy address. Select and copy it manually.");
    }
  }

  if (loading) return <main className="mx-auto max-w-5xl p-6"><p className="text-sm text-neutral-500">Loading fulfillment…</p></main>;
  if (!fulfillment) return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <Link href="/admin/fulfillments" className="text-sm underline">← All fulfillments</Link>
      <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error || "Fulfillment not found."}</p>
    </main>
  );

  const tracking = trackingUrl(fulfillment.carrier, fulfillment.tracking_number);
  const orderEmail = fulfillment.order?.customer?.email
  return (
    <main className="mx-auto max-w-5xl space-y-7 p-4 sm:p-6">
      <Link href="/admin/fulfillments" className="text-sm text-neutral-500 underline underline-offset-4">← All fulfillments</Link>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm text-neutral-500">Fulfillment #{fulfillment.id}</p>
          <h1 className="mt-1 text-3xl font-semibold">Fulfillment for order #{fulfillment.order_id}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLE[fulfillment.status] ?? "bg-neutral-100 text-neutral-800"}`}>
              {statusLabel(fulfillment.status)}
            </span>
            {fulfillment.drop_name && <span className="rounded-full border px-3 py-1 text-xs">{fulfillment.drop_name}</span>}
          </div>
        </div>
        <Link href={`/admin/orders/${fulfillment.order_id}`} className="text-sm underline underline-offset-4">View order #{fulfillment.order_id} ↗</Link>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">{notice}</p>}
      {blocked && (
        <section role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <h2 className="font-semibold">{refunded ? "Order refunded or cancelled" : "Payment not completed"}</h2>
          <p className="mt-1">{refunded
            ? "Do not ship this order. Resolve the order/payment status before taking any fulfillment action."
            : `Payment status is "${paymentStatus || "unknown"}". Shipping is disabled until payment is confirmed as paid.`}</p>
        </section>
      )}

      <section className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Fulfillment progress</h2>
        <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STEPS.map((step, index) => {
            const currentIndex = STEPS.findIndex(s => s.status === fulfillment.status);
            const complete = currentIndex >= 0 && index < currentIndex;
            const current = step.status === fulfillment.status;
            return (
              <li key={step.status} className={`rounded-lg border p-3 ${current ? "border-black bg-black text-white" : complete ? "border-green-200 bg-green-50 text-green-900" : "bg-neutral-50 text-neutral-500"}`}>
                <div className="text-xs">{complete ? "Complete" : current ? "Current stage" : `Step ${index + 1}`}</div>
                <div className="mt-1 font-medium">{step.label}</div>
              </li>
            );
          })}
        </ol>
        {fulfillment.status === "cancelled" ? (
          <p className="mt-4 text-sm text-neutral-500">This fulfillment has been cancelled.</p>
        ) : (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {action && (
              <button
                type="button"
                onClick={() => void advance()}
                disabled={saving || (action.status === "shipped" ? shipDisabled : action.status === "delivered" && fulfillment.status !== "shipped")}
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? "Saving…" : action.label}
              </button>
            )}
            {fulfillment.status !== "delivered" && (
              <button type="button" onClick={() => void cancelFulfillment()} disabled={saving} className="px-3 py-2 text-sm text-red-700 underline underline-offset-4 disabled:opacity-40">
                Cancel fulfillment
              </button>
            )}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Pick list</h2>
        <p className="mt-1 text-sm text-neutral-500">Check each item and quantity before sealing the box.</p>
        {!fulfillment.order?.items?.length ? (
          <p className="mt-4 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500">No fulfillment items were returned by the API. Include the order items in the fulfillment detail response.</p>
        ) : (
          <ul className="mt-4 divide-y">
            {fulfillment.order.items.map((item, index) => (
              <li key={item.id ?? index} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="text-base font-semibold">{item.product_name}</p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {[item.variant_name, item.size ? `Size ${item.size}` : null].filter(Boolean).join(" · ") || "No variant specified"}
                  </p>
                </div>
                <div className="shrink-0 rounded-lg border px-4 py-2 text-center">
                  <div className="text-xs text-neutral-500">Qty</div>
                  <div className="text-xl font-semibold tabular-nums">{item.quantity}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Ship to</h2>
          <button type="button" onClick={() => void copyAddress()} disabled={!address} className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-40">
            {copied ? "Copied" : "Copy address"}
          </button>
        </div>
        {address ? (
          <div className="mt-4 space-y-1 text-sm">
            {name && <p className="font-semibold">{name}</p>}
            {address.line1 && <p>{address.line1}</p>}
            {address.line2 && <p>{address.line2}</p>}
            <p>{[address.city, address.state, address.postal_code].filter(Boolean).join(", ")}</p>
            {address.country && <p>{address.country}</p>}
            {phone && <p className="pt-1 text-neutral-600">Phone: {phone}</p>}
          </div>
        ) : (
          <p className="mt-4 text-sm text-amber-800">No shipping address was returned. Check the order’s Stripe Checkout Session payload.</p>
        )}
        <div className="mt-4 border-t pt-4 text-sm">
          <span className="text-neutral-500">Customer email</span>
          <p className="mt-1 break-all">{orderEmail || "No email on record"}</p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Shipping</h2>
        <p className="mt-1 text-sm text-neutral-500">Carrier and tracking are required before marking the order shipped.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Carrier
            <select value={carrier} onChange={e => setCarrier(e.target.value)} disabled={fulfillment.status === "shipped" || fulfillment.status === "delivered" || fulfillment.status === "cancelled"} className="mt-2 w-full rounded-lg border bg-white px-3 py-2.5 font-normal disabled:bg-neutral-100">
              <option value="USPS">USPS</option>
              <option value="UPS">UPS</option>
              <option value="FedEx">FedEx</option>
              <option value="DHL">DHL</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Tracking number
            <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} disabled={fulfillment.status === "shipped" || fulfillment.status === "delivered" || fulfillment.status === "cancelled"} placeholder="Enter tracking number" className="mt-2 w-full rounded-lg border px-3 py-2.5 font-normal disabled:bg-neutral-100" />
          </label>
        </div>
        {tracking && <p className="mt-4 text-sm"><a href={tracking} target="_blank" rel="noreferrer" className="underline underline-offset-4">Track package with {fulfillment.carrier} ↗</a></p>}
        {fulfillment.status === "packing" && (
          <button
            type="button"
            onClick={() =>
                void update(
                {
                    carrier: carrier.trim(),
                    tracking_number: trackingNumber.trim(),
                },
                "Shipping details saved."
                )
            }
            disabled={saving || !shippingReady || blocked}
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
            Save shipping details
          </button>
        )}
        {fulfillment.status === "shipped" && <p className="mt-4 text-sm text-neutral-600">Shipping details are saved. Mark the package delivered from the progress section when it arrives.</p>}
        {fulfillment.status === "delivered" && <p className="mt-4 text-sm text-green-800">This fulfillment is delivered. Shipping actions are locked.</p>}
        {blocked && <p className="mt-3 text-xs text-amber-800">Shipping actions are disabled because the order is not eligible to ship.</p>}
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <ol className="mt-4 space-y-4">
          <li className="flex gap-3">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-neutral-400" />
            <div><p className="text-sm font-medium">Fulfillment created</p><p className="mt-1 text-sm text-neutral-500">{formatDateTime(fulfillment.created_at)}</p></div>
          </li>
          <li className="flex gap-3">
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${fulfillment.shipped_at ? "bg-purple-600" : "bg-neutral-200"}`} />
            <div><p className="text-sm font-medium">Shipped</p><p className="mt-1 text-sm text-neutral-500">{formatDateTime(fulfillment.shipped_at)}</p></div>
          </li>
          <li className="flex gap-3">
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${fulfillment.delivered_at ? "bg-green-600" : "bg-neutral-200"}`} />
            <div><p className="text-sm font-medium">Delivered</p><p className="mt-1 text-sm text-neutral-500">{formatDateTime(fulfillment.delivered_at)}</p></div>
          </li>
        </ol>
      </section>
    </main>
  );
}
