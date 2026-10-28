import { NextResponse } from "next/server";
import { ipAddress } from "@vercel/functions";
import { inquiryRateLimit } from "@/lib/rate-limit";
import { inquirySchema } from "@/lib/validations/inquiry";


export async function POST(req: Request) {
    // 1. Reject oversized requests.
    const contentLength = req.headers.get("content-length");

    if (
        !contentLength ||
        !/^\d+$/.test(contentLength) ||
        Number(contentLength) > 16_384
    ) {
        return NextResponse.json(
            { error: "Invalid or oversized request." },
            { status: 413 }
        );
    }

    // 2. Identify the visitor and apply rate limiting.
    const ip = ipAddress(req);
    console.log("IP: ", ip);
    if (!ip) {
        return NextResponse.json(
            { error: "Unable to process request." },
            { status: 400 }
        );
    }

    try {
        const { success, reset } =
            await inquiryRateLimit.limit(ip);

        if (!success) {
            return NextResponse.json(
                { error: "Too many submissions. Try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(
                            Math.max(
                                1,
                                Math.ceil((reset - Date.now()) / 1000)
                            )
                        ),
                    },
                }
            );
        }
    } catch {
        // Fail closed if rate limiting is unavailable.
        return NextResponse.json(
            { error: "Service temporarily unavailable." },
            { status: 503 }
        );
    }

    // 3. Parse the form.
    let formData: FormData;

    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json(
            { error: "Invalid form submission." },
            { status: 400 }
        );
    }

    // 4. Check the honeypot.
    const honeypot = formData.get("website");

    if (typeof honeypot !== "string" || honeypot.trim() !== "") {
        // Don't process the inquiry.
        return NextResponse.redirect(
            new URL("/thank-you", req.url),
            303
        );
    }

    // 5. Validate the actual form fields.
    const result = inquirySchema.safeParse({
        "user-name": formData.get("user-name"),
        "user-email": formData.get("user-email"),
        note: formData.get("note"),
        service_type: formData.get("service_type"),
        source: "website",
        newsletter_opt_in: formData.get("newsletter_opt_in") ?? "false",
    });

    if (!result.success) {
        return NextResponse.json(
            {
                error: "Please check your email and description.",
                details: result.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    // 6. Forward validated data to your FastAPI backend.
    const backendUrl = process.env.FASTAPI_URL;

    if (!backendUrl) {
        console.error("FASTAPI_URL is not configured.");

        return NextResponse.json(
            { error: "Service temporarily unavailable." },
            { status: 503 }
        );
    }

    try {
        const response = await fetch(
            `${backendUrl.replace(/\/+$/, "")}/inquiries`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: result.data["user-name"],
                    email: result.data["user-email"],
                    description: result.data.note,
                    service_type: result.data.service_type,
                    source: "website",
                    newsletter_opt_in: result.data.newsletter_opt_in,
                                    }),
                cache: "no-store",
                signal: AbortSignal.timeout(10_000),
            }
        );

        if (!response.ok) {
            console.error(
              "Inquiry backend returned status:",
              response.status,
              await response.text()
            );
          
            return NextResponse.json(
              { error: "Unable to submit inquiry." },
              { status: 502 }
            );
          }
          
          const inquiry = await response.json();
          
          return NextResponse.json(
            {
              success: true,
              inquiry: {
                id: inquiry.id,
                name: inquiry.name ?? null,
                service_type: inquiry.service_type ?? null,
              },
            },
            { status: 201 }
          );
    } catch (error) {
        console.error("Inquiry submission failed:", error);

        return NextResponse.json(
            { error: "Unable to submit inquiry. Please try again." },
            { status: 502 }
        );
    }
}