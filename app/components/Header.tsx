"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-sm">
      {/* 1. Added 'flex-wrap' so the mobile menu can cleanly drop to its own line if needed */}
      <nav className="flex flex-wrap items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl sm:text-2xl md:text-3xl font-arts-crafts-regular">
          SoCIETY.
        </Link>

        <div className="flex items-center gap-6">
          <ul className="hidden md:flex items-center gap-6 mr-12 text-xl">
            <li>
              <Link href="/projects">Projects</Link>
            </li>
            <li>
              <Link href="/services">Services</Link>
            </li>
            <li>
              <Link href="/shop">Shop</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/news">News</Link>
            </li>
          </ul>

          {/* Mobile Menu Button - Kept inside the flow or right side */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          <ThemeToggle />
        </div>

        {/* Mobile Menu - Added 'w-full' so it spans the bottom when open */}
        {menuOpen && (
          <div className="w-full md:hidden mt-4 border-t border-foreground/10">
            <ul className="flex flex-col pt-4 gap-4">
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/news">News</Link></li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}