"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faTiktok, faYoutube, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import GlitchText from "./GlitchText";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot: invisible to human visitors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("info@builtbysociety.io");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), website }),
      });
      if (!response.ok) throw new Error("Unable to submit newsletter signup");
      setEmail("");
      setMessage("Thanks! Your newsletter request has been received.");
    } catch {
      setIsError(true);
      setMessage("Couldn't submit your email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative z-20 w-full border-t border-foreground/10 text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-9 px-6 py-12 text-center lg:px-8">
        <div className="flex w-full flex-col items-center justify-between gap-8 md:flex-row md:text-left">
          {/* Brand and copyright */}
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-md font-arts-crafts-regular sm:text-xl">
              <div className="flex items-center gap-1">
                <Image src="/Motif_Logo.PNG" alt="Society Logo" className="h-5 w-auto dark:invert light:invert-0"/>
                <GlitchText text="Society." />
              </div>
            </Link>
            <p className="text-xs text-muted-foreground/70 sm:text-sm">
              &copy; {currentYear} SOCIETY. All rights reserved.
            </p>
          </div>

          {/* Social links */}
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 font-medium">
            <li><Link href="https://www.instagram.com/builtbysociety.io/" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} className="text-2xl sm:text-4xl" /></Link></li>
            <li><Link href="https://www.tiktok.com/@societyofficial__" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70" aria-label="TikTok"><FontAwesomeIcon icon={faTiktok} className="text-2xl sm:text-4xl" /></Link></li>
            <li><Link href="https://www.youtube.com/@builtbysociety" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70" aria-label="YouTube"><FontAwesomeIcon icon={faYoutube} className="text-2xl sm:text-4xl" /></Link></li>
            <li><Link href="https://www.facebook.com/people/Society-Media-Agency/61583672024114/" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70" aria-label="Facebook"><FontAwesomeIcon icon={faFacebookF} className="text-2xl sm:text-4xl" /></Link></li>
          </ul>

          <button onClick={handleCopy} type="button" className="cursor-pointer text-xl text-muted-foreground focus:outline-none" aria-label="Copy email address to clipboard">
            {copied ? "Copied to clipboard" : <GlitchText text="info@builtbysociety.io" />}
          </button>
        </div>

        {/* Compact newsletter signup */}
        <div className="w-full max-w-md border-t border-foreground/10 pt-7">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em]">Stay in the loop</p>
          <form onSubmit={handleNewsletterSubmit} className="flex w-full gap-2">
            <label htmlFor="footer-newsletter-email" className="sr-only">Email for the SOCIETY. newsletter</label>
            <input
              id="footer-newsletter-email"
              type="email"
              autoComplete="email"
              required
              maxLength={320}
              placeholder="Your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-w-0 flex-1 rounded-none border border-foreground/20 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
            <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
              <label htmlFor="footer-newsletter-website">Website</label>
              <input id="footer-newsletter-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
            </div>
            <button type="submit" disabled={isSubmitting} className="border border-foreground bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide text-background transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-50">
              {isSubmitting ? "Joining…" : "Join"}
            </button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">Monthly creative updates and drops. Unsubscribe anytime.</p>
          <p role="status" aria-live="polite" className={`mt-2 min-h-4 text-xs ${isError ? "text-red-500" : "text-muted-foreground"}`}>{message}</p>
        </div>
      </div>
    </footer>
  );
}
