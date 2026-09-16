"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "../ThemeToggle";
import GlitchText from "../GlitchText";
import { useState, forwardRef } from "react";

const Header = forwardRef<HTMLElement>((_props, ref) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        ref={ref}
        className="sticky top-0 z-60 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-sm"
      >
        <nav className="flex flex-wrap items-center justify-between px-6 py-4">

        <Link href="/" className="flex items-center gap-3">
          <Image src="/pyramid2.png" alt="Society Logo" width={40} height={40} />
          <span className="text-xl sm:text-2xl md:text-3xl font-arts-crafts-regular">
            <GlitchText text="Society." />
          </span>
        </Link>

          <div className="flex items-center gap-6">
            <ul className="hidden md:flex items-center gap-6 mr-12 text-xl">
              <li>
                <Link href="/projects">
                  <GlitchText text="Projects" />
                </Link>
              </li>

              <li>
                <Link href="/services">
                  <GlitchText text="Services" />
                </Link>
              </li>

              <li>
                <Link href="/shop">
                  <GlitchText text="Shop" />
                </Link>
              </li>

              <li>
                <Link href="/about">
                  <GlitchText text="About" />
                </Link>
              </li>

              <li>
                <Link href="/news">
                  <GlitchText text="News" />
                </Link>
              </li>
            </ul>

            <button
              className="md:hidden mr-12 text-3xl -mt-[10px]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open Menu"
            >
              ☰
            </button>

            <ThemeToggle />
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col justify-start items-center overflow-y-auto pt-24 md:hidden">
          <button
            className="absolute top-4 right-6 text-xl font-light"
            onClick={() => setMenuOpen(false)}
            aria-label="Close Menu"
          >
            ✕
          </button>

          <ul className="flex flex-col items-center gap-8 text-3xl font-medium" onClick={() => setMenuOpen(false)}>
          <li>
              <Link href="/projects">
                <GlitchText text="Projects" />
              </Link>
            </li>

            <li>
              <Link href="/services">
                <GlitchText text="Services" />
              </Link>
            </li>

            <li>
              <Link href="/shop">
                <GlitchText text="Shop" />
              </Link>
            </li>

            <li>
              <Link href="/about">
                <GlitchText text="About" />
              </Link>
            </li>

            <li>
              <Link href="/news">
                <GlitchText text="News" />
              </Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
});

Header.displayName = "Header";

export default Header;