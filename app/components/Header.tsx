"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-sm">
        <nav className="flex flex-wrap items-center justify-between px-6 py-4">
          
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <Image
            src="/pyramid.png"
            alt="Society logo"
            width={40}
            height={40}
            className="dark:invert light:invert-0"
          />

          <span className="text-xl sm:text-2xl md:text-3xl font-arts-crafts-regular">
            SoCIETY.
          </span>
        </Link>

          <div className="flex items-center gap-6">
            <ul className="hidden md:flex items-center gap-6 mr-12 text-xl">
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/news">News</Link></li>
            </ul>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden mr-12 text-3xl -mt-[10px]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open Menu"
            >
              ☰
            </button>

            {/* Dark/Light Toggle */}
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Mobile Menu - Moved outside <header> to escape the backdrop-blur container block */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col justify-start items-center overflow-y-auto pt-24 md:hidden">
          
          {/* Close Button */}
          <button
            className="absolute top-4 right-6 text-xl font-light"
            onClick={() => setMenuOpen(false)}
            aria-label="Close Menu"
          >
            ✕
          </button>

          {/* Centered Mobile Links */}
          <ul className="flex flex-col items-center gap-8 text-3xl font-medium" onClick={() => setMenuOpen(false)}>
            <li><Link href="/projects" className="hover:opacity-70 transition-opacity">Projects</Link></li>
            <li><Link href="/services" className="hover:opacity-70 transition-opacity">Services</Link></li>
            <li><Link href="/shop" className="hover:opacity-70 transition-opacity">Shop</Link></li>
            <li><Link href="/about" className="hover:opacity-70 transition-opacity">About</Link></li>
            <li><Link href="/news" className="hover:opacity-70 transition-opacity">News</Link></li>
          </ul>
        </div>
      )}
    </>
  );
}