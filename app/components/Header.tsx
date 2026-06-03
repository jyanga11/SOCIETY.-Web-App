import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  return (
    <header className="w-full border-b border-foreground/10">
      <nav className="relative flex w-full items-center px-6 py-4">
        <Link href="/" className="shrink-0 text-2xl font-arts-crafts-regular">
          SoCIETY.
        </Link>

        <ul className="absolute left-3/4 flex -translate-x-1/2 items-center gap-6 text-xl">
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

        <ThemeToggle />
      </nav>
    </header>
  );
}
