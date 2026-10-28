import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { auth } from "@clerk/nextjs/server";

const API = process.env.FASTAPI_URL;

export async function GET() {
  const access = await requireAdmin();

  if (!access.authorized) {
    return NextResponse.json(
      {
        error: access.status === 401
          ? "Sign in required"
          : "Admin access required",
      },
      { status: access.status },
    );
  }

  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { detail: "Sign in required" },
      { status: 401 },
    );
  }
  
  if (!API) {
    return NextResponse.json(
      { error: "FASTAPI_URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API}/inquiries`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Failed to fetch inquiries:", error);

    return NextResponse.json(
      { error: "Failed to connect to FastAPI" },
      { status: 502 }
    );
  }
}