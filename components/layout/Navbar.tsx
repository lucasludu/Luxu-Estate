import Link from "next/link";
import Image from "next/image";
import { USER_PROFILE } from "@/data/properties";

interface NavLinkItem {
  label: string;
  href: string;
  active?: boolean;
}

const NAV_LINKS: NavLinkItem[] = [
  { label: "Buy", href: "/?type=buy", active: true },
  { label: "Rent", href: "/?type=rent" },
  { label: "Sell", href: "#" },
  { label: "Saved Homes", href: "#" },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            href="/"
            aria-label="Go to LuxeEstate Home"
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-nordic-dark group-hover:bg-mosque transition-colors flex items-center justify-center">
              <span className="material-icons text-white text-lg">
                apartment
              </span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-nordic-dark group-hover:text-mosque transition-colors">
              LuxeEstate
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={
                  link.active
                    ? "text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1"
                    : "text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-6">
            <Link
              href="/"
              aria-label="Search"
              className="text-nordic-dark hover:text-mosque transition-colors"
            >
              <span className="material-icons">search</span>
            </Link>
            <button
              type="button"
              aria-label="Notifications"
              className="text-nordic-dark hover:text-mosque transition-colors relative"
            >
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>
            <button
              type="button"
              aria-label="Profile"
              className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-2"
            >
              <div className="relative w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all">
                <Image
                  alt={USER_PROFILE.name}
                  className="object-cover"
                  data-alt="User profile portrait smiling"
                  fill
                  sizes="36px"
                  src={USER_PROFILE.avatar}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-nordic-dark/5 bg-background-light overflow-hidden h-0 transition-all duration-300">
        <div className="px-4 py-2 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? "block px-3 py-2 rounded-md text-base font-medium text-mosque bg-mosque/10"
                  : "block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

