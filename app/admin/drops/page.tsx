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
  
  export default async function DropsPage() {
    const drops = await getDrops();
  
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
              {drops.map((drop) => (
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
            </tbody>
          </table>
        </div>
      </section>
    );
  }