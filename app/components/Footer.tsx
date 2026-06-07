"use strict";
"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faTiktok, faYoutube, faFacebookF } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("info@builtbysociety.io");
      setCopied(true);
      
      // Reset the "Copied!" message after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <footer className="relative z-20 w-full border-t border-foreground/10 text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        
        {/* Brand & Copyright */}
        <div className="flex flex-col gap-2 md:order-1 md:mt-0">
          <Link href="/" className="text-xl font-arts-crafts-regular">
            SoCIETY.
          </Link>
          <p className="text-sm text-muted-foreground/70">
            &copy; {currentYear} SOCIETY. All rights reserved.
          </p>
        </div>

        {/* Footer Links & Icons */}
        <div className="mt-8 md:order-2 md:mt-0">
          <ul className="flex flex-wrap items-center gap-x-15 gap-y-4 font-medium">
            <li>
              <Link href="https://www.instagram.com/builtbysociety.io/" target="_blank" className="hover:opacity-70 transition-opacity" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} size="2xl" className="" />
                <span className="sr-only">Instagram</span>
              </Link>
            </li>
            <li>
              <Link href="https://www.tiktok.com/@societyofficial__" target="_blank" className="hover:opacity-70 transition-opacity" aria-label="TikTok">
                <FontAwesomeIcon icon={faTiktok} size="2xl" className="" />
                <span className="sr-only">TikTok</span>
              </Link>
            </li>
            <li>
              <Link href="https://www.youtube.com/@builtbysociety" target="_blank" className="hover:opacity-70 transition-opacity" aria-label="YouTube">
                <FontAwesomeIcon icon={faYoutube} size="2xl" className="" />
                <span className="sr-only">YouTube</span>
              </Link>
            </li>
            <li>
              <Link href="https://www.facebook.com/people/Society-Media-Agency/61583672024114/" target="_blank" className="hover:opacity-70 transition-opacity" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebookF} size="2xl" className="" />
                <span className="sr-only">Facebook</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Copy Email Button */}
        <button 
          onClick={handleCopy}
          className="md:order-3 hover:opacity-70 transition-opacity text-xl text-muted-foreground focus:outline-none"
          aria-label="Copy email address to clipboard"
        >
          {copied ? "copied to clipboard" : "info@builtbysociety.io"}
        </button>

      </div>
    </footer>
  );
}