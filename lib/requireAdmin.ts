import "server-only";
import { auth } from "@clerk/nextjs/server";

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    return { authorized: false, status: 401 } as const;
  }

  const adminIds = (process.env.CLERK_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!adminIds.includes(userId)) {
    return { authorized: false, status: 403 } as const;
  }

  return { authorized: true, userId } as const;
}