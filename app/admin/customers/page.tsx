import { requireAdmin } from "@/lib/requireAdmin";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const TZ = "America/Chicago";
const PAGE_SIZE = 50;

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

async function getCustomers(page: number): Promise<Customer[]> {
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
  
  const offset = (page - 1) * PAGE_SIZE;
  const response = await fetch(`${process.env.FASTAPI_URL}/customers?limit=${PAGE_SIZE}&offset=${offset}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store" 
  });

  if (!response.ok) {
    throw new Error("Could not load customers");
  }

  return response.json();
}

// Customers have no currency field yet, so this assumes USD.
function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { timeZone: TZ });
}

function formatLocation(address: Address | null) {
  if (!address) return "—";
  const text = [address.city, address.state].filter(Boolean).join(", ");
  return text || address.country || "—";
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const customers = await getCustomers(page);

  const hasPrevious = page > 1;
  const hasNext = customers.length === PAGE_SIZE;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Customers</h1>
        <p className="mt-2 text-neutral-500">
          Everyone who has paid for an order, with lifetime purchase totals.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-neutral-500">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Location</th>
              <th className="p-4">Total Spend</th>
              <th className="p-4">Orders</th>
              <th className="p-4">First Purchase</th>
              <th className="p-4">Last Purchase</th>
              <th className="p-4">Detail</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b last:border-0">
                <td className="p-4">
                  <div className="font-medium">{customer.name || "—"}</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {customer.email}
                  </div>
                </td>

                <td className="p-4">{formatLocation(customer.address)}</td>

                <td className="whitespace-nowrap p-4">
                  {formatMoney(customer.order_spend)}
                </td>

                <td className="p-4">
                  {customer.total_orders}
                  {customer.total_orders > 1 && (
                    <span className="ml-2 inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium">
                      repeat
                    </span>
                  )}
                </td>

                <td className="whitespace-nowrap p-4">
                  {formatDate(customer.first_purchase_at)}
                </td>

                <td className="whitespace-nowrap p-4">
                  {formatDate(customer.last_purchase_at)}
                </td>

                <td className="whitespace-nowrap p-4">
                  <a href={`/admin/customers/${customer.id}`}>
                    View
                  </a>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-500">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(hasPrevious || hasNext) && (
        <nav className="flex items-center justify-between text-sm">
          {hasPrevious ? (
            <Link className="underline" href={`/admin/customers?page=${page - 1}`}>
              ← Previous
            </Link>
          ) : (
            <span />
          )}

          <span className="text-neutral-500">Page {page}</span>

          {hasNext ? (
            <Link className="underline" href={`/admin/customers?page=${page + 1}`}>
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}