import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-foreground/10 bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        
        {/* Left Side: Brand & Copyright */}
        <div className="flex flex-col gap-2 md:order-1 md:mt-0">
          <Link href="/" className="text-xl font-arts-crafts-regular">
            SoCIETY.
          </Link>
          <p className="text-sm text-muted-foreground/70">
            &copy; {currentYear} SoCIETY. All rights reserved.
          </p>
        </div>

        {/* Right Side: Footer Links */}
        <div className="mt-8 md:order-2 md:mt-0">
          <ul className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium">
            <li>
              <Link href="/projects" className="hover:opacity-70 transition-opacity">
                Projects
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:opacity-70 transition-opacity">
                Services
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:opacity-70 transition-opacity">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:opacity-70 transition-opacity">
                About
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:opacity-70 transition-opacity">
                News
              </Link>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}