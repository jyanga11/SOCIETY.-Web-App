import { requireAdmin } from "@/lib/requireAdmin";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const API = process.env.FASTAPI_URL;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
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

  if (!API) {
    return NextResponse.json(
      { detail: "FASTAPI_URL is not configured." },
      { status: 500 }
    );
  }

  const { id } = await params;

  try {
    const response = await fetch(`${API}/fulfillments/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { detail: "Could not connect to the API." },
      { status: 502 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
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

  if (!API) {
    return NextResponse.json(
      { detail: "FASTAPI_URL is not configured." },
      { status: 500 }
    );
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const response = await fetch(`${API}/fulfillments/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { detail: "Could not update the fulfillment." },
      { status: 502 }
    );
  }
}
