import { requireAdmin } from "@/lib/requireAdmin";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/lib/client";

const TZ = "America/Chicago";
const API = process.env.FASTAPI_URL;

type DropItem = {
  id: number;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string | null;
  size: string | null;
  stripe_price_id: string | null;
  unit_amount: number;
  currency: string;
};

type Drop = {
  id: number;
  name: string;
  slug: string;
  opens_at: string;
  closes_at: string;
  status: string;
  production_status: string;
  trello_card_id: string | null;
  items: DropItem[];
};

type DropSummary = {
  paid_orders: number;
  total_units: number;
  items: { drop_item_id: number; quantity_sold: number }[];
};

type SanityVariant = {
  sku: string;
  size: string;
  color: string | null;
};

type SanityProduct = {
  _id: string;
  title: string;
  category: string | null;
  price: number | null;
  sizeScale: string | null;
  variants: SanityVariant[];
};

/* ---------- helpers ---------- */

function tzParts(date: Date) {
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
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return {
    y: get("year"),
    mo: get("month"),
    d: get("day"),
    h: get("hour"),
    mi: get("minute"),
    s: get("second"),
  };
}

function tzOffsetMs(date: Date): number {
  const p = tzParts(date);
  const asUtc = Date.UTC(+p.y, +p.mo - 1, +p.d, +p.h, +p.mi, +p.s);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

// "2026-11-01T09:00" (wall-clock time in TZ) -> ISO string with timezone
function localToIso(value: string): string | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const asUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let ts = asUtc - tzOffsetMs(new Date(asUtc));
  ts = asUtc - tzOffsetMs(new Date(ts));
  return new Date(ts).toISOString();
}

// ISO string -> value for <input type="datetime-local"> in TZ
function isoToLocalInput(iso: string): string {
  const p = tzParts(new Date(iso));
  return `${p.y}-${p.mo}-${p.d}T${p.h}:${p.mi}`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatMoney(minorUnits: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(minorUnits / 100);
  } catch {
    return `${(minorUnits / 100).toFixed(2)} ${currency}`;
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail
        .map(
          (d: { loc?: string[]; msg: string }) =>
            `${d.loc?.slice(1).join(".") ?? "field"}: ${d.msg}`
        )
        .join("; ");
    }
  } catch {
    // fall through
  }
  return `Request failed (${response.status}).`;
}

function back(
  id: number | string,
  kind: "error" | "notice",
  message: string
): never {
  redirect(`/admin/drops/${id}?${kind}=${encodeURIComponent(message)}`);
}

/* ---------- data ---------- */

async function getDrop(id: string): Promise<Drop> {
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

  const response = await fetch(`${API}/drops/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store"
  });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Failed to load drop");
  return response.json();
}

async function getSummary(id: string): Promise<DropSummary> {
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

  const response = await fetch(`${API}/drops/${id}/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to load drop summary");
  return response.json();
}

/* ---------- Sanity ---------- */

function getSanity() {
  return client.withConfig({
    useCdn: false, // admin screens need fresh data
    perspective: "published",
    // token: process.env.SANITY_READ_TOKEN, // only if dataset is private
  });
}

const PRODUCTS_QUERY = `*[_type == "product" && count(variants[active != false]) > 0]
  | order(title asc) {
    _id,
    title,
    category,
    price,
    "sizeScale": sizeScale->title,
    "variants": variants[active != false]{ sku, size, color }
  }`;

const PRODUCT_QUERY = `*[_type == "product" && _id == $id][0]{
  _id,
  title,
  "variants": variants[active != false]{ sku, size, color }
}`;

async function getSanityProducts(): Promise<{
  products: SanityProduct[];
  error: string | null;
}> {
  const access = await requireAdmin();

  if (!access.authorized) {
    if (access.status === 401) {
      redirect("/sign-in");
    }

    notFound();
  }

  try {
    const products = await getSanity().fetch<SanityProduct[]>(PRODUCTS_QUERY);
    return { products, error: null };
  } catch (err) {
    console.error("Could not load products from Sanity", err);
    return {
      products: [],
      error: "Could not load products from Sanity. Check the Sanity environment variables.",
    };
  }
}

/* ---------- status rules (UI-side; backend has none yet) ---------- */

type Transition = { to: string; label: string; danger?: boolean };

const TRANSITIONS: Record<string, Transition[]> = {
  draft: [
    { to: "scheduled", label: "Schedule" },
    { to: "open", label: "Open sales now" },
    { to: "cancelled", label: "Cancel drop", danger: true },
  ],
  scheduled: [
    { to: "open", label: "Open sales now" },
    { to: "draft", label: "Back to draft" },
    { to: "cancelled", label: "Cancel drop", danger: true },
  ],
  open: [
    { to: "closed", label: "Close sales" },
    { to: "cancelled", label: "Cancel drop", danger: true },
  ],
  closed: [],
  cancelled: [],
};

const isCatalogOpen = (status: string) =>
  status === "draft" || status === "scheduled";

/* ---------- server actions ---------- */

async function changeStatus(formData: FormData) {
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

  const id = String(formData.get("id"));
  const to = String(formData.get("to"));

  const drop = await getDrop(id);
  const allowed = (TRANSITIONS[drop.status] ?? []).some((t) => t.to === to);
  if (!allowed) back(id, "error", `Cannot change status from ${drop.status} to ${to}.`);

  const response = await fetch(`${API}/drops/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: to }),
    cache: "no-store",
  });

  if (!response.ok) back(id, "error", await readError(response));

  revalidatePath(`/admin/drops/${id}`);
  revalidatePath("/admin/drops");
  back(id, "notice", `Status changed to ${to}.`);
}

async function saveDetails(formData: FormData) {
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

  const id = String(formData.get("id"));
  const drop = await getDrop(id);

  const name = String(formData.get("name") ?? "").trim();
  const sanityId = String(formData.get("sanity_drop_id") ?? "").trim();

  if (!name) back(id, "error", "Name is required.");

  const changes: Record<string, string | null> = {
    name,
    sanity_drop_id: sanityId || null,
  };

  // Slug and dates are frozen once sales have started (enforced here,
  // not just by read-only inputs).
  if (isCatalogOpen(drop.status)) {
    const slug = String(formData.get("slug") ?? "").trim();
    const opensAt = localToIso(String(formData.get("opens_at") ?? ""));
    const closesAt = localToIso(String(formData.get("closes_at") ?? ""));

    if (!slug) back(id, "error", "Slug is required.");
    if (!opensAt || !closesAt) back(id, "error", "Opening and closing dates are required.");
    if (new Date(closesAt!) <= new Date(opensAt!)) {
      back(id, "error", "Closing date must be after opening date.");
    }

    changes.slug = slug;
    changes.opens_at = opensAt;
    changes.closes_at = closesAt;
  }

  const response = await fetch(`${API}/drops/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(changes),
    cache: "no-store",
  });

  if (!response.ok) back(id, "error", await readError(response));

  revalidatePath(`/admin/drops/${id}`);
  revalidatePath("/admin/drops");
  back(id, "notice", "Drop details saved.");
}

// Adds the ticked variants of one Sanity product to the drop. Names, sizes and
// IDs are re-read from Sanity here, so nothing the browser posts (other than
// which SKUs and the price) is trusted.
async function addProductVariants(formData: FormData) {
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

  const id = String(formData.get("id"));
  const productId = String(formData.get("product_id") ?? "");
  const skus = formData.getAll("sku").map(String);
  const price = Number.parseFloat(String(formData.get("price") ?? ""));

  if (!productId) back(id, "error", "Missing product.");
  if (skus.length === 0) back(id, "error", "Select at least one variant.");
  if (!Number.isFinite(price) || price < 0) back(id, "error", "Enter a valid price.");

  const drop = await getDrop(id);
  if (!isCatalogOpen(drop.status)) {
    back(id, "error", "Products cannot be added once sales have started.");
  }

  let product: Pick<SanityProduct, "_id" | "title" | "variants"> | null;
  try {
    product = await getSanity().fetch(PRODUCT_QUERY, { id: productId });
  } catch (err) {
    console.error("Could not load product from Sanity", productId, err);
    back(id, "error", "Could not load the product from Sanity.");
  }

  if (!product) back(id, "error", "That product no longer exists in Sanity.");

  const chosen = product!.variants.filter((v) => skus.includes(v.sku));
  if (chosen.length !== skus.length) {
    back(id, "error", "Some selected variants no longer exist or were deactivated in Sanity.");
  }

  const unitAmount = Math.round(price * 100); // API stores minor units (cents)
  const added: string[] = [];
  const failed: string[] = [];

  for (const variant of chosen) {
    const response = await fetch(`${API}/drops/${id}/items`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: product!._id,
        variant_id: variant.sku,
        product_name: product!.title,
        variant_name: variant.color || null,
        size: variant.size || null,
        stripe_price_id: null, // checkout builds the price inline from unit_amount
        unit_amount: unitAmount,
        currency: "USD",
      }),
      cache: "no-store",
    });

    if (response.ok) {
      added.push(variant.sku);
    } else {
      failed.push(`${variant.sku}: ${await readError(response)}`);
    }
  }

  revalidatePath(`/admin/drops/${id}`);
  revalidatePath("/admin/drops");

  if (failed.length > 0) {
    back(
      id,
      "error",
      `Added ${added.length} of ${chosen.length} variants of ${product!.title}. ${failed.join(" | ")}`
    );
  }

  back(
    id,
    "notice",
    `Added ${added.length} variant${added.length === 1 ? "" : "s"} of ${product!.title}.`
  );
}

/* ---------- UI ---------- */

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

const inputClass = "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm";
const readOnlyClass = `${inputClass} bg-neutral-100 text-neutral-500`;

export default async function DropDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { id } = await params;
  const { error, notice } = await searchParams;

  const [drop, summary] = await Promise.all([getDrop(id), getSummary(id)]);

  const editable = isCatalogOpen(drop.status);
  const { products, error: sanityError } = editable
    ? await getSanityProducts()
    : { products: [] as SanityProduct[], error: null };

  const sold = new Map(
    summary.items.map((i) => [i.drop_item_id, i.quantity_sold])
  );
  const inDrop = new Set(
    drop.items.map((i) => `${i.product_id}::${i.variant_id}`)
  );

  // Schedule is only offered for drafts; cancel is offered whenever the
  // transition rules allow it (draft, scheduled, open).
  const canSchedule = drop.status === "draft";
  const canCancel = (TRANSITIONS[drop.status] ?? []).some(
    (t) => t.to === "cancelled"
  );

  return (
    <div className="space-y-8">
      <header>
        <a href="/admin/drops" className="text-sm text-neutral-500 underline">
          ← Back to drops
        </a>
        <h1 className="mt-4 text-3xl font-semibold">{drop.name}</h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-neutral-100 px-3 py-1">
            Sales: {drop.status}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1">
            Production: {drop.production_status}
          </span>
        </div>
        <p className="mt-3 text-sm text-neutral-500">
          {formatDate(drop.opens_at)} → {formatDate(drop.closes_at)} (Central
          Time)
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800">
          {notice}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Paid orders" value={summary.paid_orders} />
        <StatCard label="Units sold" value={summary.total_units} />
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Details</h2>

        {!editable && (
          <p className="mt-2 text-sm text-neutral-500">
            Slug and dates are locked because sales have started.
          </p>
        )}

        <form action={saveDetails} className="mt-4 space-y-5">
          <input type="hidden" name="id" value={drop.id} />

          <label className="block text-sm font-medium">
            Name
            <input
              name="name"
              required
              maxLength={255}
              defaultValue={drop.name}
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium">
            Slug
            <input
              name="slug"
              maxLength={255}
              defaultValue={drop.slug}
              readOnly={!editable}
              className={editable ? inputClass : readOnlyClass}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Opens
              <input
                type="datetime-local"
                name="opens_at"
                defaultValue={isoToLocalInput(drop.opens_at)}
                readOnly={!editable}
                className={editable ? inputClass : readOnlyClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Closes
              <input
                type="datetime-local"
                name="closes_at"
                defaultValue={isoToLocalInput(drop.closes_at)}
                readOnly={!editable}
                className={editable ? inputClass : readOnlyClass}
              />
            </label>
          </div>

          <div className="text-sm text-neutral-500">
            Production: {drop.production_status}
            {drop.trello_card_id && <> · Trello card {drop.trello_card_id}</>}
          </div>

          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Save details
          </button>
        </form>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Products</h2>

        {drop.items.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-neutral-100">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Variant</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Units sold</th>
                </tr>
              </thead>
              <tbody>
                {drop.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{item.product_name}</td>
                    <td className="p-3 font-mono text-xs">{item.variant_id}</td>
                    <td className="p-3">{item.variant_name ?? "—"}</td>
                    <td className="p-3">{item.size ?? "—"}</td>
                    <td className="p-3">
                      {formatMoney(item.unit_amount, item.currency)}
                    </td>
                    <td className="p-3">{sold.get(item.id) ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">
            No products in this drop yet.
          </p>
        )}

        {editable ? (
          <div className="mt-6 space-y-4 border-t pt-6">
            <div>
              <h3 className="font-medium">Add from Sanity</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Open a product, tick the variants to include, and set the price
                for this drop. Each ticked variant becomes its own item.
              </p>
            </div>

            {sanityError && (
              <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
                {sanityError}
              </p>
            )}

            {!sanityError && products.length === 0 && (
              <p className="text-sm text-neutral-500">
                No products with active variants found in Sanity.
              </p>
            )}

            <div className="space-y-3">
              {products.map((product) => {
                const remaining = product.variants.filter(
                  (v) => !inDrop.has(`${product._id}::${v.sku}`)
                ).length;

                return (
                  <details
                    key={product._id}
                    className="rounded-lg border bg-neutral-50 p-4"
                  >
                    <summary className="cursor-pointer text-sm font-medium">
                      {product.title}
                      <span className="ml-2 font-normal text-neutral-500">
                        {[product.category, product.sizeScale]
                          .filter(Boolean)
                          .join(" · ")}
                        {remaining === 0
                          ? " · all variants added"
                          : ` · ${remaining} available`}
                      </span>
                    </summary>

                    <form action={addProductVariants} className="mt-4 space-y-4">
                      <input type="hidden" name="id" value={drop.id} />
                      <input type="hidden" name="product_id" value={product._id} />

                      <div className="flex flex-wrap gap-3">
                        {product.variants.map((variant) => {
                          const already = inDrop.has(
                            `${product._id}::${variant.sku}`
                          );
                          return (
                            <label
                              key={variant.sku}
                              className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm ${
                                already ? "opacity-50" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                name="sku"
                                value={variant.sku}
                                disabled={already}
                              />
                              <span>
                                {[variant.size, variant.color]
                                  .filter(Boolean)
                                  .join(" · ")}
                                <span className="ml-2 font-mono text-xs text-neutral-500">
                                  {variant.sku}
                                </span>
                                {already && (
                                  <span className="ml-2 text-xs text-neutral-500">
                                    already in drop
                                  </span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap items-end gap-4">
                        <label className="block text-sm font-medium">
                          Price (USD)
                          <input
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            defaultValue={
                              typeof product.price === "number"
                                ? product.price.toFixed(2)
                                : ""
                            }
                            className={`${inputClass} w-36`}
                          />
                        </label>

                        <button
                          type="submit"
                          disabled={remaining === 0}
                          className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-40"
                        >
                          Add selected variants
                        </button>
                      </div>
                    </form>
                  </details>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="mt-6 border-t pt-4 text-sm text-neutral-500">
            The catalog is locked because sales have started.
          </p>
        )}
      </section>

      {(canSchedule || canCancel) && (
        <form action={changeStatus} className="flex flex-wrap gap-3">
          <input type="hidden" name="id" value={drop.id} />

          {canSchedule && (
            <button
              type="submit"
              name="to"
              value="scheduled"
              className="rounded-lg bg-black px-4 py-2 text-sm text-white"
            >
              Schedule drop
            </button>
          )}

          {canCancel && (
            <button
              type="submit"
              name="to"
              value="cancelled"
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              Cancel drop
            </button>
          )}
        </form>
      )}
    </div>
  );
}