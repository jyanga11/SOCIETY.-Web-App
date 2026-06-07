"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-sm">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl sm:text-2xl md:text-3xl font-arts-crafts-regular">
          SoCIETY.
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-xl">
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-foreground/10">
            <ul className="flex flex-col p-4 gap-4">
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/news">News</Link></li>
            </ul>
          </div>
        )}
        <ThemeToggle />
      </nav>
    </header>
  );
}
