import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const adminIds = (process.env.CLERK_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!adminIds.includes(userId)) {
    notFound();
  }
  return (
    <div className="relative z-50 min-h-screen bg-neutral-50 text-neutral-900 md:flex">
      <aside className="w-full border-b bg-white p-6 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <h1 className="text-xl font-bold">SOCIETY.</h1>
        <p className="mt-1 text-sm text-neutral-500">Admin</p>

        <nav className="mt-8 flex gap-5 md:flex-col md:gap-3">
          <Link href="/admin">Overview</Link>
          <Link href="/admin/customers">Customers</Link>
          <Link href="/admin/inquiries">Inquiries</Link>
          <Link href="/admin/drops">Drops</Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/admin/fulfillments">Fulfillment</Link>
          <Link href="/studio">Studio</Link>
        </nav>
        <div className="mt-8">
          <UserButton />
        </div>
      </aside>

      <main className="z-50 min-w-0 flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}