import { requireAdmin } from "@/lib/requireAdmin";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

type Drop = {
    id: number;
    name: string;
    status: string;
    production_status: string;
    opens_at: string | null;
    closes_at: string | null;
  };
  
  async function getDrops(): Promise<Drop[]> {
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
      `${process.env.FASTAPI_URL}/drops`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
         
      }
    );
  
    if (!response.ok) {
      throw new Error("Failed to load drops");
    }
  
    return response.json();
  }
  
  const sortOptions = [
    { value: "open-asc", label: "Open date (earliest first)", field: "opens_at", direction: 1 },
    { value: "open-desc", label: "Open date (latest first)", field: "opens_at", direction: -1 },
    { value: "close-asc", label: "Close date (earliest first)", field: "closes_at", direction: 1 },
    { value: "close-desc", label: "Close date (latest first)", field: "closes_at", direction: -1 },
  ] as const;

  export default async function DropsPage({
    searchParams,
  }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }) {
    const params = await searchParams;
    const drops = await getDrops();
    const query = typeof params.q === "string" ? params.q.trim() : "";
    const term = query.toLowerCase();
    const salesStatuses = [...new Set(drops.map((drop) => drop.status).filter(Boolean))].sort();
    const productionStatuses = [...new Set(drops.map((drop) => drop.production_status).filter(Boolean))].sort();
    const salesStatus = typeof params.sales === "string" && salesStatuses.includes(params.sales)
      ? params.sales
      : "";
    const productionStatus = typeof params.production === "string" && productionStatuses.includes(params.production)
      ? params.production
      : "";
    const sort = sortOptions.find((option) => option.value === params.sort);
    const visibleDrops = drops.filter((drop) =>
      (!term || drop.name.toLowerCase().includes(term)) &&
      (!salesStatus || drop.status === salesStatus) &&
      (!productionStatus || drop.production_status === productionStatus)
    );

    if (sort) {
      visibleDrops.sort((a, b) => {
        const aDate = Date.parse(a[sort.field] ?? "");
        const bDate = Date.parse(b[sort.field] ?? "");
        if (!Number.isFinite(aDate)) return Number.isFinite(bDate) ? 1 : 0;
        if (!Number.isFinite(bDate)) return -1;
        return sort.direction * (aDate - bDate);
      });
    }
  
    return (
      <section>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Drops</h1>
            <p className="mt-2 text-neutral-500">
              Manage products, sales windows, and production.
            </p>
          </div>
  
          <a
            href="/admin/drops/new"
            className="rounded-lg bg-black px-4 py-3 text-white"
          >
            Create drop
          </a>
        </div>
  
        <form action="/admin/drops" method="get" className="mb-4 flex flex-wrap items-end gap-3">
          <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm">
            Drop name
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search drops"
              className="rounded-lg border bg-white px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Sales status
            <select name="sales" defaultValue={salesStatus} className="rounded-lg border bg-white px-3 py-2">
              <option value="">All sales statuses</option>
              {salesStatuses.map((status) => (
                <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Production status
            <select name="production" defaultValue={productionStatus} className="rounded-lg border bg-white px-3 py-2">
              <option value="">All production statuses</option>
              {productionStatuses.map((status) => (
                <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Sort by
            <select name="sort" defaultValue={sort?.value ?? ""} className="rounded-lg border bg-white px-3 py-2">
              <option value="">Default order</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm text-white">Apply</button>
          {(query || salesStatus || productionStatus || sort) && (
            <a href="/admin/drops" className="px-2 py-2 text-sm underline">Clear</a>
          )}
        </form>

        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-neutral-100">
              <tr>
                <th className="p-4">Drop</th>
                <th className="p-4">Sales Status</th>
                <th className="p-4">Production Status</th>
                <th className="p-4">Open Date</th>
                <th className="p-4">Close Date</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {visibleDrops.map((drop) => (
                <tr key={drop.id} className="border-b last:border-0">
                  <td className="p-4 font-medium">
                    <a href={`/admin/drops/${drop.id}`}>
                      {drop.name}
                    </a>
                  </td>
                  <td className="p-4">{drop.status}</td>
                  <td className="p-4">
                    {drop.production_status}
                  </td>
                  <td className="p-4">
                    {drop.opens_at
                      ? new Date(drop.opens_at).toLocaleString()
                      : "Not set"}
                  </td>
                  <td className="p-4">
                    {drop.closes_at
                      ? new Date(drop.closes_at).toLocaleString()
                      : "Not set"}
                  </td>
                  <td className="p-4">
                    <a
                      href={`/admin/drops/${drop.id}`}
                      className="underline"
                    >
                      Manage
                    </a>
                  </td>
                </tr>
              ))}
              {visibleDrops.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    {query || salesStatus || productionStatus ? "No drops match your filters." : "No drops yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
