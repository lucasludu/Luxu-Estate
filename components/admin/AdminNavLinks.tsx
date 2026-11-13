"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavLinksProps {
  propertiesLabel: string;
  usersLabel: string;
  backToSiteLabel: string;
}

export function AdminNavLinks({
  propertiesLabel,
  usersLabel,
  backToSiteLabel,
}: AdminNavLinksProps) {
  const pathname = usePathname();
  const isProperties =
    pathname.startsWith("/admin/properties") || pathname === "/admin";
  const isUsers = pathname.startsWith("/admin/users");

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Link
        href="/admin/properties"
        aria-current={isProperties ? "page" : undefined}
        className={
          isProperties
            ? "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-mosque text-white shadow-sm ring-1 ring-mosque/20 transition-all"
            : "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-nordic-dark/70 hover:text-nordic-dark hover:bg-nordic-dark/5 transition-all"
        }
      >
        <span className="material-icons text-base">domain</span>
        <span>{propertiesLabel}</span>
      </Link>
      <Link
        href="/admin/users"
        aria-current={isUsers ? "page" : undefined}
        className={
          isUsers
            ? "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-mosque text-white shadow-sm ring-1 ring-mosque/20 transition-all"
            : "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-nordic-dark/70 hover:text-nordic-dark hover:bg-nordic-dark/5 transition-all"
        }
      >
        <span className="material-icons text-base">manage_accounts</span>
        <span>{usersLabel}</span>
      </Link>

      <div className="h-4 w-px bg-nordic-dark/15 mx-1 hidden sm:block" />

      <Link
        href="/"
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-nordic-dark/60 hover:text-nordic-dark hover:bg-nordic-dark/5 transition-all"
      >
        <span className="material-icons text-base">storefront</span>
        <span>{backToSiteLabel}</span>
      </Link>
    </div>
  );
}
