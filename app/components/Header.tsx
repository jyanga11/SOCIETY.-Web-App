import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-white/10">
      <nav className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-arts-crafts-regular">SOCIETY.</Link>
        <ul className="flex items-center gap-6 text-sm sm:text-base">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/projects">Projects</Link></li>
          <li><Link href="/services">Services</Link></li>
          <li><Link href="/shop">Shop</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/news">News</Link></li>
        </ul>
      </nav>
    </header>
  );
}
