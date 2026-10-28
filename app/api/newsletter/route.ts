import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const API = process.env.FASTAPI_URL;
  const TOKEN = process.env.INTERNAL_API_TOKEN;
  if (!API || !TOKEN) {
    console.error("Newsletter signup server configuration missing");
    return NextResponse.json({ error: "Signup temporarily unavailable" }, { status: 503 });
  }

  let body: { email?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof body.email !== "string" || body.email.length > 320 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }

  // Quietly accept bot submissions; don't store them.
  if (body.website) return NextResponse.json({ ok: true });

  try {
    const response = await fetch(`${API}/newsletter/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ email: body.email.trim().toLowerCase() }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error("Newsletter FastAPI error", response.status);
      return NextResponse.json({ error: "Signup temporarily unavailable" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter signup request failed", error);
    return NextResponse.json({ error: "Signup temporarily unavailable" }, { status: 502 });
  }
}
