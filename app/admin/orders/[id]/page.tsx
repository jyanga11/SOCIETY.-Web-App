import { requireAdmin } from "@/lib/requireAdmin";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

const TZ = "America/Chicago";

type Order = {
  id: number;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  customer_id: number | null;
  customer: Customer | null;
  customer_email: string | null;
  payment_status: string;
  subtotal_amount: number | null;
  total_amount: number;
  refunded_amount: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
  items: OrderItem[];
  fulfillments: Fulfillment[];
};

type OrderItem = {
  id: number;
  drop_item_id: number | null;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  size: string | null;
  quantity: number;
  unit_amount: number;
  currency: string;
};

type Fulfillment = {
  id: number;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
};

type Customer = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  address: Address | null;
  total_orders: number;
  total_spend: number;
};

type Address = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

async function getOrder(id: string): Promise<Order> {
  const access = await requireAdmin();

  if (!access.authorized) {
    if (access.status === 401) {
      redirect("/sign-in");
    }

    notFound();
  }

  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    redirect("/sign-in");
  }
  
  const response = await fetch(`${process.env.FASTAPI_URL}/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Could not load order");

  return response.json();
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd className="mt-1 break-all text-sm">{children}</dd>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  const computedSubtotal = order.items.reduce(
    (sum, item) => sum + item.unit_amount * item.quantity,
    0
  );
  const subtotal = order.subtotal_amount ?? computedSubtotal;
  const other = order.total_amount - subtotal;
  const netTotal = order.total_amount - order.refunded_amount;

  const addr = order.customer?.address

  return (
    <div className="space-y-8">
      <header>
        <a href="/admin/orders" className="text-sm text-neutral-500 underline">
          ← Back to orders
        </a>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">Order #{order.id}</h1>
          <StatusBadge status={order.payment_status} />
        </div>
        <p className="mt-2 text-neutral-500">
          Placed {formatDate(order.created_at)} (Central Time)
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-neutral-500">Total</p>
          <p className="mt-2 text-3xl font-semibold">
            {formatMoney(order.total_amount, order.currency)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-neutral-500">Refunded</p>
          <p className="mt-2 text-3xl font-semibold">
            {formatMoney(order.refunded_amount, order.currency)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-neutral-500">Paid at</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(order.paid_at)}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Customer</h2>
          <dl className="mt-4 space-y-4">
            <Field label="Name">{order.customer?.name || "Guest"}</Field>
            <Field label="Email">
              {order.customer_email ? (
                <a href={`mailto:${order.customer_email}`} className="underline">
                  {order.customer_email}
                </a>
              ) : (
                "—"
              )}
            </Field>
          </dl>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Shipping address</h2>
          <div className="mt-4">
          {addr ? (
            <address className="not-italic">
              {order.customer?.name && <div>{order.customer.name}</div>}
              <div>{addr.line1}</div>
              {addr.line2 && <div>{addr.line2}</div>}
              <div>
                {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")}
              </div>
              {addr.country && <div>{addr.country}</div>}
            </address>
          ) : (
            <div className="text-neutral-500">No shipping address</div>
          )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Items</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-neutral-50 text-neutral-500">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Variant</th>
                <th className="p-3">Size</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Unit price</th>
                <th className="p-3 text-right">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">
                    {item.drop_item_id ? (
                      <span>{item.product_name}</span>
                    ) : (
                      item.product_name
                    )}
                  </td>
                  <td className="p-3">{item.variant_name ?? "—"}</td>
                  <td className="p-3">{item.size ?? "—"}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">
                    {formatMoney(item.unit_amount, item.currency)}
                  </td>
                  <td className="p-3 text-right">
                    {formatMoney(item.unit_amount * item.quantity, item.currency)}
                  </td>
                </tr>
              ))}

              {order.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-neutral-500">
                    No items on this order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-6 ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Subtotal</dt>
            <dd>{formatMoney(subtotal, order.currency)}</dd>
          </div>
          {other !== 0 && (
            <div className="flex justify-between">
              <dt className="text-neutral-500">Shipping, tax &amp; other</dt>
              <dd>{formatMoney(other, order.currency)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 font-medium">
            <dt>Total</dt>
            <dd>{formatMoney(order.total_amount, order.currency)}</dd>
          </div>
          {order.refunded_amount > 0 && (
            <>
              <div className="flex justify-between text-neutral-500">
                <dt>Refunded</dt>
                <dd>−{formatMoney(order.refunded_amount, order.currency)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt>Net</dt>
                <dd>{formatMoney(netTotal, order.currency)}</dd>
              </div>
            </>
          )}
        </dl>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Fulfillment</h2>

        {order.fulfillments.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Carrier</th>
                  <th className="p-3">Tracking</th>
                  <th className="p-3">Shipped</th>
                  <th className="p-3">Delivered</th>
                </tr>
              </thead>
              <tbody>
                {order.fulfillments.map((f) => (
                  <tr key={f.id} className="border-b last:border-0">
                    <td className="p-3">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="p-3">{f.carrier ?? "—"}</td>
                    <td className="p-3">{f.tracking_number ?? "—"}</td>
                    <td className="p-3">{formatDate(f.shipped_at)}</td>
                    <td className="p-3">{formatDate(f.delivered_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">
            {order.payment_status === "paid"
              ? "Paid, but no fulfillment has been created yet."
              : "No fulfillment yet."}
          </p>
        )}
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Stripe</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Checkout session">{order.stripe_session_id}</Field>
          <Field label="Payment intent">
            {order.stripe_payment_intent_id ?? "—"}
          </Field>
        </dl>
      </section>
    </div>
  );
}