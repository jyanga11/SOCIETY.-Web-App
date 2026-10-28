
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type InquiryConfirmation = {
  id?: number;
  name?: string;
  service_type?: string;
  submitted_at: number;
};

const STORAGE_KEY = "society:last-inquiry";
const CONFIRMATION_MAX_AGE = 30 * 60 * 1000;

export default function ThankYouPage() {
  const [inquiry, setInquiry] =
    useState<InquiryConfirmation | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (!stored) return;

    try {
      const data: InquiryConfirmation = JSON.parse(stored);

      // Don't show details from an old inquiry.
      if (
        typeof data.submitted_at !== "number" ||
        Date.now() - data.submitted_at > CONFIRMATION_MAX_AGE
      ) {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      setInquiry(data);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const firstName = inquiry?.name?.trim().split(/\s+/)[0];
  const service = inquiry?.service_type?.trim();

  return (
    <main className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden px-6 py-24 text-foreground transition-colors duration-300">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        {/* Confirmation symbol */}
        <div className="mx-auto mb-10 flex size-16 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </div>

        {/* Main heading */}
        <h1 className="font-black font-arts-crafts-regular leading-[0.9] tracking-[-0.06em] sm:text-7xl">
          Thank You
          <span className="block text-purple-700">
            {firstName ? ` ${firstName}` : ""}
          </span>
        </h1>

        {/* Personalized confirmation */}
        <div className="mx-auto mt-10 max-w-xl space-y-5">
          <p className="text-xl font-medium leading-relaxed sm:text-xl">
            {service
              ? `We've received your ${service} inquiry.`
              : "We've received your inquiry."}
          </p>
        </div>

        {/* Inquiry reference */}
        {inquiry?.id && (
          <div className="mx-auto mt-5 inline-flex flex-col items-center gap-2 px-8 py-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] opacity-45">
              Inquiry Reference
            </span>

            <span className="font-mono text-sm tracking-widest text-orange-500">
              #{String(inquiry.id).padStart(5, "0")}
            </span>
          </div>
        )}

        {/* Next steps */}
        <div className="mx-auto mt-12 max-w-lg border-t border-foreground/15 pt-8">
          <p className="mb-5 text-md font-semibold uppercase tracking-[0.2em] opacity-50">
            What happens next?
          </p>

          <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
            <div>
              <span className="text-md font-mono text-purple-700">
                01 /
              </span>

              <p className="mt-2 text-lg font-semibold">
                Review
              </p>

              <p className="mt-1 text-md leading-6 opacity-60">
                We'll take a look at your project and its
                requirements.
              </p>
            </div>

            <div>
              <span className="text-md font-mono text-purple-700">
                02 /
              </span>

              <p className="mt-2 text-lg font-semibold">
                Connect
              </p>

              <p className="mt-1 text-md leading-6 opacity-60">
                We'll reach out to discuss the next steps.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-orange-500 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-purple-700 transition-colors hover:bg-orange-400 sm:w-auto"
          >
            Back to Home
            <span className="ml-3" aria-hidden="true">
              ↗
            </span>
          </Link>

          <Link
            href="/projects"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-purple-700/35 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-purple-700 transition-colors hover:border-purple-700 hover:bg-purple-700/10 dark:border-orange-500/35 dark:text-orange-500 dark:hover:bg-orange-500/10 sm:w-auto"
          >
            Explore Our Work
          </Link>
        </div>
      </div>
    </main>
  );
}
