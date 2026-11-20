import { requireAdmin } from "@/lib/requireAdmin";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

type Customer = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  total_orders: number;
  total_spend: number;
};

type Order = {
  id: number;
  stripe_session_id: string;
  customer_id: number | null;
  customer: Customer | null;
  customer_email: string | null;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  items: { quantity: number }[];
};
  
async function getOrders(): Promise<Order[]> {
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
  
  const orders: Order[] = [];
  const limit = 100;
  for (let offset = 0; ; offset += limit) {
    const response = await fetch(
      `${process.env.FASTAPI_URL}/orders?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    if (!response.ok) throw new Error("Could not load orders");

    const batch: Order[] = await response.json();
    orders.push(...batch);
    if (batch.length < limit) return orders;
  }
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orders = await getOrders();
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const term = query.toLowerCase();
  const statuses = [...new Set(orders.map((order) => order.payment_status))].sort();
  const status = typeof params.status === "string" && statuses.includes(params.status)
    ? params.status
    : "";
  const oldestFirst = params.sort === "oldest";
  const visibleOrders = orders.filter((order) =>
    (!term || (order.customer?.name || "Guest").toLowerCase().includes(term)) &&
    (!status || order.payment_status === status)
  );
  visibleOrders.sort((a, b) => {
    const dateOrder = Date.parse(a.created_at) - Date.parse(b.created_at);
    return oldestFirst ? dateOrder || a.id - b.id : -dateOrder || b.id - a.id;
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="mt-2 text-neutral-500">
          Review purchases and payment status.
        </p>
      </header>

      <form action="/admin/orders" method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm">
          Customer name
          <input type="search" name="q" defaultValue={query} placeholder="Search by customer name"
            className="rounded-lg border bg-white px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Payment status
          <select name="status" defaultValue={status} className="rounded-lg border bg-white px-3 py-2">
            <option value="">All payment statuses</option>
            {statuses.map((value) => (
              <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Order date
          <select name="sort" defaultValue={oldestFirst ? "oldest" : "newest"}
            className="rounded-lg border bg-white px-3 py-2">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm text-white">Apply</button>
        {(query || status || oldestFirst) && <a href="/admin/orders" className="py-2 text-sm underline">Clear</a>}
      </form>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-neutral-500">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Items</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Total</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>

          <tbody>
            {visibleOrders.map((order) => (
              <tr key={order.id} className="border-b last:border-0">
                <td className="p-4 font-medium">#{order.id}</td>

                <td className="p-4">
                  <a href={`/admin/orders/${order.id}`}>
                    <div>{order.customer?.name || "Guest"}</div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {order.customer_email}
                    </div>
                  </a>
                </td>

                <td className="whitespace-nowrap p-4">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>

                <td className="p-4">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>

                <td className="p-4">
                  <StatusBadge status={order.payment_status} />
                </td>

                <td className="whitespace-nowrap p-4">
                  {formatMoney(order.total_amount, order.currency)}
                </td>

                <td className="p-4">
                  <a
                    href={`/admin/orders/${order.id}`}
                    className="underline"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}

            {visibleOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-500">
                  {query || status ? "No orders match your filters." : "No orders yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
