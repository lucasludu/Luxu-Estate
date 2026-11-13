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
  const isProperties = pathname.startsWith("/admin/properties") || pathname === "/admin";
  const isUsers = pathname.startsWith("/admin/users");

  return (
    <div className="flex items-center space-x-6 sm:space-x-8">
      <Link
        href="/admin/properties"
        className={
          isProperties
            ? "inline-flex items-center gap-1.5 px-1 py-2 border-b-2 border-mosque text-sm font-semibold text-mosque transition-colors"
            : "inline-flex items-center gap-1.5 px-1 py-2 border-b-2 border-transparent text-sm font-medium text-nordic-dark/65 hover:text-mosque hover:border-mosque/30 transition-colors"
        }
      >
        <span className="material-icons text-base">domain</span>
        <span>{propertiesLabel}</span>
      </Link>
      <Link
        href="/admin/users"
        className={
          isUsers
            ? "inline-flex items-center gap-1.5 px-1 py-2 border-b-2 border-mosque text-sm font-semibold text-mosque transition-colors"
            : "inline-flex items-center gap-1.5 px-1 py-2 border-b-2 border-transparent text-sm font-medium text-nordic-dark/65 hover:text-mosque hover:border-mosque/30 transition-colors"
        }
      >
        <span className="material-icons text-base">manage_accounts</span>
        <span>{usersLabel}</span>
      </Link>
      <Link
        href="/"
        className="hidden sm:inline-flex items-center gap-1 px-1 py-2 border-b-2 border-transparent text-sm font-medium text-nordic-dark/55 hover:text-nordic-dark transition-colors"
      >
        <span className="material-icons text-base">storefront</span>
        <span>{backToSiteLabel}</span>
      </Link>
    </div>
  );
}

