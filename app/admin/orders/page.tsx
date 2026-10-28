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
  
  const response = await fetch(
    `${process.env.FASTAPI_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Could not load orders");
  }

  return response.json();
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

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="mt-2 text-neutral-500">
          Review purchases and payment status.
        </p>
      </header>

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
            {orders.map((order) => (
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

            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}