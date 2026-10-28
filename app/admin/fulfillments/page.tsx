import { requireAdmin } from "@/lib/requireAdmin";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

const API = process.env.FASTAPI_URL;
const TZ = "America/Chicago";
const PAGE_SIZE = 25;

const STATUSES = [
  "unfulfilled",
  "processing",
  "packing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

// Work that still has to be done by a person.
const NEEDS_ACTION: string[] = ["unfulfilled", "processing", "packing"];

type Fulfillment = {
  id: number;
  order_id: number;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
  // joined from the order and its drop
  drop_id?: number | null;
  drop_name?: string | null;
  order_payment_status?: string | null;
};

async function getFulfillments(): Promise<Fulfillment[]> {
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

  const response = await fetch(`${API}/fulfillments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Could not load fulfillments");
  }

  return response.json();
}

/* ---------- helpers ---------- */

const STATUS_STYLES: Record<string, string> = {
  unfulfilled: "bg-amber-100 text-amber-900",
  processing: "bg-blue-100 text-blue-900",
  packing: "bg-indigo-100 text-indigo-900",
  shipped: "bg-purple-100 text-purple-900",
  delivered: "bg-green-100 text-green-900",
  cancelled: "bg-neutral-200 text-neutral-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-neutral-100"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function isRefunded(item: Fulfillment) {
  const p = item.order_payment_status;
  return p === "refunded" || p === "cancelled" || p === "failed" || p === "expired";
}

function needsAction(item: Fulfillment) {
  return NEEDS_ACTION.includes(item.status) && !isRefunded(item);
}

function ageInDays(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    dateStyle: "medium",
  }).format(new Date(iso));
}

type Query = { filter?: string; drop?: string; page?: string };

function href(base: Query, changes: Partial<Query>) {
  const merged = { ...base, ...changes };
  const params = new URLSearchParams();
  if (merged.filter && merged.filter !== "needs_action") params.set("filter", merged.filter);
  if (merged.drop) params.set("drop", merged.drop);
  if (merged.page && merged.page !== "1") params.set("page", merged.page);
  const qs = params.toString();
  return `/admin/fulfillments${qs ? `?${qs}` : ""}`;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

/* ---------- page ---------- */

export default async function FulfillmentsPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const filter = query.filter ?? "needs_action"; // needs_action | all | a status
  const dropFilter = query.drop ?? "";
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);

  const all = await getFulfillments();

  // Drop options come from the data itself.
  const drops = new Map<number, string>();
  for (const f of all) {
    if (f.drop_id != null) drops.set(f.drop_id, f.drop_name ?? `Drop #${f.drop_id}`);
  }
  const hasDrops = drops.size > 0;

  const inScope = dropFilter
    ? all.filter((f) => String(f.drop_id) === dropFilter)
    : all;

  const counts = {
    needsAction: inScope.filter(needsAction).length,
    inTransit: inScope.filter((f) => f.status === "shipped").length,
    total: inScope.length,
  };

  const visible = inScope
    .filter((f) => {
      if (filter === "all") return true;
      if (filter === "needs_action") return needsAction(f);
      return f.status === filter;
    })
    // Oldest first: the longest-waiting orders go to the top.
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
        a.id - b.id
    );

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const tabs: { value: string; label: string }[] = [
    { value: "needs_action", label: "Needs action" },
    ...STATUSES.map((s) => ({ value: s, label: s })),
    { value: "all", label: "All" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Fulfillment</h1>
        <p className="mt-2 text-neutral-500">
          Track packing, shipping, and delivery.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Needs action" value={counts.needsAction} />
        <StatCard label="In transit" value={counts.inTransit} />
        <StatCard label="Total fulfillment records" value={counts.total} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-2 text-sm" aria-label="Filter by status">
          {tabs.map((tab) => {
            const active = filter === tab.value;
            return (
              <a
                key={tab.value}
                href={href(query, { filter: tab.value, page: "1" })}
                aria-current={active ? "page" : undefined}
                className={`rounded-full border px-3 py-1 capitalize ${
                  active ? "bg-black text-white" : "bg-white hover:bg-neutral-100"
                }`}
              >
                {tab.label.replaceAll("_", " ")}
              </a>
            );
          })}
        </nav>

        {hasDrops && (
          <form method="get" action="/admin/fulfillments" className="flex items-center gap-2 text-sm">
            {filter !== "needs_action" && (
              <input type="hidden" name="filter" value={filter} />
            )}
            <label htmlFor="drop" className="text-neutral-500">
              Drop
            </label>
            <select
              id="drop"
              name="drop"
              defaultValue={dropFilter}
              className="rounded-lg border bg-white px-3 py-2"
            >
              <option value="">All drops</option>
              {[...drops.entries()].map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-lg border bg-white px-3 py-2 hover:bg-neutral-100">
              Apply
            </button>
          </form>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-neutral-500">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              {hasDrops && <th className="p-4">Drop</th>}
              <th className="p-4">Status</th>
              <th className="p-4">Waiting</th>
              <th className="p-4">Carrier</th>
              <th className="p-4">Tracking number</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item) => {
              const open = NEEDS_ACTION.includes(item.status);
              const days = ageInDays(item.created_at);

              return (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-4 font-medium">#{item.order_id}</td>

                  <td className="p-4">
                    <a href={`/admin/fulfillments/${item.id}`}>
                      <div>{item.customer_name || "Guest"}</div>
                      <div className="mt-1 text-xs text-neutral-500">
                        {item.customer_email ?? "No email"}
                      </div>
                    </a>
                  </td>

                  {hasDrops && (
                    <td className="p-4">{item.drop_name ?? "—"}</td>
                  )}

                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={item.status} />
                      {isRefunded(item) && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                          {item.order_payment_status}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="whitespace-nowrap p-4">
                    {open ? (
                      <span
                        className={days >= 5 ? "font-medium text-red-700" : undefined}
                        title={`Created ${formatDate(item.created_at)}`}
                      >
                        {days === 0 ? "Today" : `${days}d`}
                      </span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>

                  <td className="p-4">{item.carrier || "Not assigned"}</td>

                  <td className="p-4">
                    {item.tracking_number || "Not available"}
                  </td>

                  <td className="p-4">
                    <a
                      href={`/admin/fulfillments/${item.id}`}
                      className="underline"
                    >
                      Manage
                    </a>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={hasDrops ? 8 : 7}
                  className="p-8 text-center text-neutral-500"
                >
                  {filter === "needs_action"
                    ? "Nothing needs action right now."
                    : "No fulfillment records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-neutral-500">
            Page {currentPage} of {pageCount} · {visible.length} records
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a
                href={href(query, { page: String(currentPage - 1) })}
                className="rounded-lg border bg-white px-3 py-2 hover:bg-neutral-100"
              >
                ← Previous
              </a>
            )}
            {currentPage < pageCount && (
              <a
                href={href(query, { page: String(currentPage + 1) })}
                className="rounded-lg border bg-white px-3 py-2 hover:bg-neutral-100"
              >
                Next →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}