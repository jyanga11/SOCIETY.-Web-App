import Link from "next/link";
import { requireAdmin } from "@/lib/requireAdmin";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

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
  address: Address | null;
  hubspot_contact_id: string | null;
  first_purchase_at: string | null;
  last_purchase_at: string | null;
  total_orders: number;
  order_spend: number; // minor units (cents), net of refunds
  first_inquiry_at: string | null;
  last_inquiry_at: string | null;
  total_inquiries: number;
  service_spend: number; // minor units (cents), net of refunds
};

type Order = {
  id: number;
  payment_status: string;
  total_amount: number;
  refunded_amount: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
  items: { quantity: number }[];
};

type Inquiry = {
  id: number;
  customer_id: number | null;
  created_at: string;
  service_type: string | null;
  status: string;
  production_status: string | null;
  payment_status: string | null;
  total_amount: number | null;
  currency: string;
};

async function getAdminToken() {
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

  return token;
}

async function getCustomer(id: string, token: string): Promise<Customer> {
  const response = await fetch(`${process.env.FASTAPI_URL}/customers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Could not load customer");

  return response.json();
}

// Requires the customer_id filter on GET /orders (see backend note).
async function getCustomerOrders(id: string, token: string): Promise<Order[]> {
  const response = await fetch(`${process.env.FASTAPI_URL}/orders?customer_id=${id}&limit=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
  });

  if (!response.ok) throw new Error("Could not load customer orders");

  return response.json();
}

async function getCustomerInquiries(id: string, token: string): Promise<Inquiry[]> {
  const inquiries: Inquiry[] = [];
  const limit = 100;
  for (let offset = 0; ; offset += limit) {
    const response = await fetch(
      `${process.env.FASTAPI_URL}/inquiries?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    if (!response.ok) throw new Error("Could not load customer inquiries");
    const batch: Inquiry[] = await response.json();
    inquiries.push(...batch.filter((inquiry) => inquiry.customer_id === Number(id)));
    if (batch.length < limit) return inquiries;
  }
}

function formatMoney(amount: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { timeZone: TZ });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getAdminToken();
  const [customer, orders, inquiries] = await Promise.all([
    getCustomer(id, token),
    getCustomerOrders(id, token),
    getCustomerInquiries(id, token),
  ]);

  const address = customer.address;
  const cityLine = address
    ? [address.city, address.state, address.postal_code].filter(Boolean).join(", ")
    : "";

  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin/customers" className="text-sm text-neutral-500 underline">
          ← Customers
        </Link>
        <h1 className="mt-3 text-3xl font-semibold">
          {customer.name || customer.email}
        </h1>
        {customer.name && (
          <p className="mt-2 text-neutral-500">{customer.email}</p>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-sm font-medium text-neutral-500">Contact</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs text-neutral-500">Email</dt>
              <dd>{customer.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Phone</dt>
              <dd>{customer.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">HubSpot</dt>
              <dd>
                {customer.hubspot_contact_id ? (
                  process.env.HUBSPOT_PORTAL_ID ? (
                    <a
                      href={`https://app.hubspot.com/contacts/${process.env.HUBSPOT_PORTAL_ID}/record/0-1/${customer.hubspot_contact_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Contact {customer.hubspot_contact_id}
                    </a>
                  ) : (
                    `Contact ${customer.hubspot_contact_id}`
                  )
                ) : (
                  "Not synced yet"
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-sm font-medium text-neutral-500">Address on file</h2>
          {address && (address.line1 || cityLine || address.country) ? (
            <address className="mt-3 space-y-1 text-sm not-italic">
              {address.line1 && <p>{address.line1}</p>}
              {address.line2 && <p>{address.line2}</p>}
              {cityLine && <p>{cityLine}</p>}
              {address.country && <p>{address.country}</p>}
            </address>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">No address on file.</p>
          )}
          <p className="mt-4 text-xs text-neutral-500">
            Billing address when collected at checkout, otherwise the shipping
            address. Each order&apos;s ship-to address is on its own order page.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total orders" value={customer.total_orders} />
        <Stat label="Total order spend" value={formatMoney(customer.order_spend)} />
        <Stat label="First purchase" value={formatDate(customer.first_purchase_at)} />
        <Stat label="Last purchase" value={formatDate(customer.last_purchase_at)} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Orders</h2>

        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-neutral-50 text-neutral-500">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Date</th>
                <th className="p-4">Items</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Total</th>
                <th className="p-4">Refunded</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="p-4 font-medium">#{order.id}</td>
                  <td className="whitespace-nowrap p-4">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="p-4">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={order.payment_status} />
                  </td>
                  <td className="whitespace-nowrap p-4">
                    {formatMoney(order.total_amount, order.currency)}
                  </td>
                  <td className="whitespace-nowrap p-4">
                    {order.refunded_amount > 0
                      ? formatMoney(order.refunded_amount, order.currency)
                      : "—"}
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/orders/${order.id}`} className="underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    No orders found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total inquiries" value={customer.total_inquiries} />
        <Stat label="Total inquiry spend" value={formatMoney(customer.service_spend)} />
        <Stat label="First inquiry" value={formatDate(customer.first_inquiry_at)} />
        <Stat label="Last inquiry" value={formatDate(customer.last_inquiry_at)} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Inquiries</h2>
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-neutral-50 text-neutral-500">
              <tr>
                <th className="p-4">Inquiry</th>
                <th className="p-4">Date</th>
                <th className="p-4">Service</th>
                <th className="p-4">Status</th>
                <th className="p-4">Production</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Quote</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-b last:border-0">
                  <td className="p-4 font-medium">
                    <Link href={`/admin/inquiries/${inquiry.id}`} className="underline">
                      #{inquiry.id}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap p-4">{formatDate(inquiry.created_at)}</td>
                  <td className="p-4">{inquiry.service_type?.replaceAll("_", " ") || "—"}</td>
                  <td className="p-4"><StatusBadge status={inquiry.status} /></td>
                  <td className="p-4">
                    {inquiry.production_status ? <StatusBadge status={inquiry.production_status} /> : "—"}
                  </td>
                  <td className="p-4">
                    {inquiry.payment_status ? <StatusBadge status={inquiry.payment_status} /> : "—"}
                  </td>
                  <td className="whitespace-nowrap p-4">
                    {inquiry.total_amount == null ? "—" : formatMoney(inquiry.total_amount, inquiry.currency)}
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    No inquiries found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}