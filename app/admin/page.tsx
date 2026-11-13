import { requireAdmin } from "@/lib/requireAdmin";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

type AdminSummary = {
    active_drops: number;
    new_orders: number;
    new_inquiries: number;
    unprocessed_inquiries: number;
    awaiting_fulfillment: number;
    drops: {
      id: number;
      name: string;
      status: string;
      production_status: string;
      closes_at: string | null;
      units_sold: number;
      awaiting_fulfillment: number;
    }[];
    integration_errors: number;
  };
  
  async function getSummary(): Promise<AdminSummary> {
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
      `${process.env.FASTAPI_URL}/admin/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store"
      }
    );
  
    if (!response.ok) {
      throw new Error("Could not load admin summary");
    }
  
    return response.json();
  }
  
  function StatCard({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
      </div>
    );
  }
  
  export default async function AdminPage() {
    const summary = await getSummary();
  
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-semibold">Overview</h1>
          <p className="mt-2 text-neutral-500">
            Your business at a glance.
          </p>
        </header>
  
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="New Orders" value={summary.new_orders} />
          <StatCard label="New Inquiries" value={summary.new_inquiries} />
          <StatCard label="Unfulfilled Orders" value={summary.awaiting_fulfillment} />
          <StatCard label="Unprocessed Inquiries" value={summary.unprocessed_inquiries} />
        </section>

        <section aria-labelledby="active-drops-heading">
          <h2 id="active-drops-heading" className="text-lg font-semibold">
            Active Drops ({summary.active_drops})
          </h2>

          {summary.drops.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {summary.drops.map((drop) => (
                <article key={drop.id} className="space-y-3 rounded-xl border bg-white p-6">
                  <h3 className="text-xl">{drop.name}</h3>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-neutral-100 px-3 py-1">
                      Sales: {drop.status}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-3 py-1">
                      Production: {drop.production_status}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-neutral-500">Units Sold</dt>
                      <dd className="text-xl font-semibold">{drop.units_sold}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-neutral-500">Awaiting Fulfillment</dt>
                      <dd className="text-xl font-semibold">{drop.awaiting_fulfillment}</dd>
                    </div>
                  </dl>

                  <p className="text-sm text-neutral-500">
                    {drop.closes_at
                      ? `Closes ${new Date(drop.closes_at).toLocaleString()}`
                      : "No closing date set"}
                  </p>

                  <a
                    href={`/admin/drops/${drop.id}`}
                    className="inline-block text-sm underline"
                  >
                    Manage drop →
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">No active drops.</p>
          )}
        </section>

        {summary.integration_errors > 0 && (
          <section className="rounded-xl border border-amber-300 bg-amber-50 p-5">
            <h2 className="font-semibold">Integration issues</h2>
            <p className="mt-1 text-sm">
              {summary.integration_errors} integration errors need attention.
            </p>
          </section>
        )}
      </div>
    );
  }
