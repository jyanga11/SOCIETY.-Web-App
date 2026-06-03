import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-white/10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-2xl font-arts-crafts-regular">
          SoCIETY.
        </Link>
        <div className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-xl">
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
        </div>
        <button
          type="button"
          className="flex size-10 shrink-0 rounded-full border border-white/10"
          aria-label="Color Mode"
        >
        </button>
      </nav>
    </header>
  );
}
