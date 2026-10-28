
import { requireAdmin } from "@/lib/requireAdmin";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

// Dates typed into the form are interpreted in Chicago timezone.
const TZ = "America/Chicago";

function tzOffsetMs(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)!.value);

  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );

  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

// "2026-11-01T09:00" (wall-clock time in TZ) -> ISO string with timezone
function localToIso(value: string): string | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;

  const asUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let ts = asUtc - tzOffsetMs(new Date(asUtc));
  ts = asUtc - tzOffsetMs(new Date(ts)); // second pass handles DST edges
  return new Date(ts).toISOString();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((d: { loc?: string[]; msg: string }) =>
          `${d.loc?.slice(1).join(".") ?? "field"}: ${d.msg}`
        )
        .join("; ");
    }
  } catch {
    // fall through
  }
  return `Request failed (${response.status}).`;
}

function fail(message: string): never {
  redirect(`/admin/drops/new?error=${encodeURIComponent(message)}`);
}

async function createDrop(formData: FormData) {
  "use server";
  
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

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);
  const opensAt = localToIso(String(formData.get("opens_at") ?? ""));
  const closesAt = localToIso(String(formData.get("closes_at") ?? ""));
  const status = String(formData.get("status") ?? "draft");

  if (!name) fail("Name is required.");
  if (!slug) fail("Could not build a slug from that name. Enter one manually.");
  if (!opensAt || !closesAt) fail("Opening and closing dates are required.");
  if (new Date(closesAt!) <= new Date(opensAt!)) {
    fail("Closing date must be after opening date.");
  }
  if (!["draft", "scheduled"].includes(status)) {
    fail("New drops can only start as draft or scheduled.");
  }

  const response = await fetch(`${process.env.FASTAPI_URL}/drops`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      slug,
      opens_at: opensAt,
      closes_at: closesAt,
      status,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    fail(await readError(response));
  }

  const created = await response.json();
  redirect(`/admin/drops/${created.id}`);
}

const inputClass =
  "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm";

export default async function NewDropPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="max-w-2xl">
      <a href="/admin/drops" className="text-sm text-neutral-500 underline">
        ← Back to drops
      </a>

      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-semibold">Create drop</h1>
        <p className="mt-2 text-neutral-500">
          Set the name and sales window first. You can add products on the
          next screen.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <form action={createDrop} className="space-y-6 rounded-xl border bg-white p-6">
        <label className="block text-sm font-medium">
          Name
          <input name="name" required maxLength={255} className={inputClass} />
        </label>

        <label className="block text-sm font-medium">
          Slug
          <input
            name="slug"
            maxLength={255}
            placeholder="Leave blank to generate from the name"
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Opens
            <input
              type="datetime-local"
              name="opens_at"
              required
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium">
            Closes
            <input
              type="datetime-local"
              name="closes_at"
              required
              className={inputClass}
            />
          </label>
        </div>
        <p className="-mt-3 text-xs text-neutral-500">
          Times are in Central Time ({TZ}).
        </p>

        <label className="block text-sm font-medium">
          Status
          <select name="status" defaultValue="draft" className={inputClass}>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </label>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-3 text-sm text-white"
          >
            Create drop
          </button>
          <a href="/admin/drops" className="text-sm underline">
            Cancel
          </a>
        </div>
      </form>
    </section>
  );
}