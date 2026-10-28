"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type InquiryFormProps = {
  serviceType: string;
};

type InquirySubmissionResponse = {
  success: boolean;
  inquiry: {
    id: number;
    name?: string | null;
    service_type?: string | null;
  };
};

const fieldClassName =
  "w-full rounded-xl border border-foreground/15 bg-foreground/[0.035] px-4 py-3.5 text-base text-foreground outline-none transition-all duration-200 placeholder:text-foreground/35 hover:border-foreground/30 focus:border-purple-700 focus:bg-background focus:ring-4 focus:ring-purple-700/10 dark:focus:border-orange-500 dark:focus:ring-orange-500/10";

const labelClassName =
  "mb-2.5 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70";

export default function InquiryForm({ serviceType }: InquiryFormProps) {
  const router = useRouter();
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      formData.set(
        "newsletter_opt_in",
        newsletterOptIn ? "true" : "false"
      );
      const response = await fetch("/api/new_inquiry", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Unable to submit inquiry. Please try again.");
      }

      const result: InquirySubmissionResponse = await response.json();

      sessionStorage.setItem(
        "society:last-inquiry",
        JSON.stringify({
          id: result.inquiry.id,
          name: result.inquiry.name,
          service_type: result.inquiry.service_type ?? serviceType,
          newsletter_opt_in: newsletterOptIn,
          submitted_at: Date.now(),
        })
      );

      router.push("/thank-you");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit inquiry."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-3xl py-8 text-foreground sm:py-12"
    >
      {/* Honeypot: intentionally invisible to visitors. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="website">Leave this field empty</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Introduction */}
      <div className="mb-9 border-t border-foreground/15 pt-7 sm:mb-11">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-purple-700 dark:text-purple-700">
            Service inquiry
          </span>
          <span className="text-foreground/25" aria-hidden="true">/</span>
          <span className="text-xs font-medium text-foreground/55">
            {serviceType}
          </span>
        </div>

        <h2 className="max-w-3xl text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Lose yourself, find <span className="font-arts-crafts-regular text-orange-500">Society.</span>
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-foreground/60 sm:text-base">
          Tell us a little about yourself and what you have in mind.
          We&apos;ll take it from there.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-7">
        {/* Contact details */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-5">
          <div>
            <label htmlFor="user-name" className={labelClassName}>
              Your name <span className="text-orange-500" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="user-name"
              name="user-name"
              required
              autoComplete="name"
              maxLength={150}
              placeholder="Your full name"
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="user-email" className={labelClassName}>
              Email address <span className="text-orange-500" aria-hidden="true">*</span>
            </label>
            <input
              type="email"
              id="user-email"
              name="user-email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={fieldClassName}
            />
          </div>
        </div>

        {/* Project details */}
        <div>
          <label htmlFor="note" className={labelClassName}>
            Tell us about your project <span className="text-orange-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={6}
            required
            minLength={3}
            maxLength={5000}
            placeholder="What are you working on? What would you like to achieve? Share as much or as little as you'd like to get started..."
            className={`${fieldClassName} min-h-44 resize-y leading-relaxed`}
          />
          <p className="mt-2 text-xs leading-relaxed text-foreground/45">
            Goals, ideas, deadlines, references — whatever helps tell your story.
          </p>
        </div>
      </div>

      <input type="hidden" name="service_type" value={serviceType} />

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="mt-9 flex flex-col gap-5 border-t border-foreground/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-xs leading-relaxed text-foreground/45">
          By reaching out, you&apos;re starting a conversation. No commitment required.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex min-h-[52px] w-full sm:w-auto items-center justify-center gap-5 rounded-full border-2 border-orange-500 bg-transparent px-6 py-3 text-sm font-medium uppercase text-orange-500 transition hover:bg-orange-500 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-orange-500"
        >
          <span>{submitting ? "Sending..." : "Send inquiry"}</span>
          {submitting ? (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-purple-950/30 border-t-purple-950"
              aria-hidden="true"
            />
          ) : (
            <span
              className="text-xl leading-none transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              ↗
            </span>
          )}
        </button>
      </div>
      <div className="my-6">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            name="newsletter_opt_in"
            value="true"
            checked={newsletterOptIn}
            onChange={(e) => setNewsletterOptIn(e.target.checked)}
          />
          <span>
            Email me updates about SOCIETY. releases, projects,
            and exclusive announcements.
          </span>
        </label>
      </div>
    </form>
  );
}
