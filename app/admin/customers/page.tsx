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

async function getCustomerToken() {
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

async function fetchCustomers(token: string, offset: number): Promise<Customer[]> {
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

const sortOptions = {
  order_spend: "Total spend",
  total_orders: "Orders",
  first_purchase_at: "First purchase date",
  last_purchase_at: "Last purchase date",
};

type SortField = keyof typeof sortOptions;

function sortValue(customer: Customer, field: SortField) {
  const value = customer[field];
  if (typeof value === "number") return value;
  const timestamp = value ? Date.parse(value) : NaN;
  return Number.isFinite(timestamp) ? timestamp : null;
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[,\s]+/g, " ").trim();
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const term = normalize(query);
  const field = params.sort && Object.prototype.hasOwnProperty.call(sortOptions, params.sort)
    ? params.sort as SortField
    : undefined;
  const direction = params.dir === "asc" ? "asc" : "desc";
  const requestedPage = Number(params.page);
  let page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const token = await getCustomerToken();
  let customers: Customer[];
  let hasNext: boolean;

  if (term || field) {
    const matches: Customer[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const batch = await fetchCustomers(token, offset);
      for (const customer of batch) {
        const address = customer.address;
        const location = [address?.city, address?.state, address?.postal_code, address?.country]
          .filter(Boolean).join(" ");
        if (!term || [customer.email, customer.name, location].some(
          (value) => value && normalize(value).includes(term)
        )) matches.push(customer);
      }
      if (batch.length < PAGE_SIZE) break;
    }
    if (field) {
      matches.sort((a, b) => {
        const left = sortValue(a, field);
        const right = sortValue(b, field);
        if (left === right) return a.id - b.id;
        if (left === null) return 1;
        if (right === null) return -1;
        return direction === "asc" ? left - right : right - left;
      });
    }
    page = Math.min(page, Math.max(1, Math.ceil(matches.length / PAGE_SIZE)));
    customers = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    hasNext = page * PAGE_SIZE < matches.length;
  } else {
    customers = await fetchCustomers(token, (page - 1) * PAGE_SIZE);
    hasNext = customers.length === PAGE_SIZE;
  }
  const hasPrevious = page > 1;

  function pageHref(number: number) {
    const search = new URLSearchParams({ page: String(number) });
    if (query) search.set("q", query);
    if (field) {
      search.set("sort", field);
      search.set("dir", direction);
    }
    return `/admin/customers?${search}`;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Customers</h1>
        <p className="mt-2 text-neutral-500">
          Everyone who has paid for an order, with lifetime purchase totals.
        </p>
      </header>

      <form action="/admin/customers" method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-sm">
          Search customers
          <input type="search" name="q" defaultValue={query} placeholder="Email, name, or location"
            className="rounded-lg border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Sort by
          <select name="sort" defaultValue={field ?? ""} className="rounded-lg border px-3 py-2">
            <option value="">Default order</option>
            {Object.entries(sortOptions).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Direction
          <select name="dir" defaultValue={direction} className="rounded-lg border px-3 py-2">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white">Apply</button>
        {(query || field) && <Link href="/admin/customers" className="py-2 text-sm underline">Clear</Link>}
      </form>

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
                  {query ? "No customers match your search." : "No customers yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(hasPrevious || hasNext) && (
        <nav className="flex items-center justify-between text-sm">
          {hasPrevious ? (
            <Link className="underline" href={pageHref(page - 1)}>
              ← Previous
            </Link>
          ) : (
            <span />
          )}

          <span className="text-neutral-500">Page {page}</span>

          {hasNext ? (
            <Link className="underline" href={pageHref(page + 1)}>
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