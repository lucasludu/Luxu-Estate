import { Suspense } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getDictionarySync, type Dictionary } from "@/i18n";
import { getServerI18n } from "@/i18n/server";
import { getCurrentUser, type AuthUserProfile } from "@/lib/auth";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { NavbarUserMenu } from "@/components/layout/NavbarUserMenu";
import { AdminNavLinks } from "./AdminNavLinks";

function AdminNavbarView({
  locale,
  dict,
  user = null,
}: {
  locale: Locale;
  dict: Dictionary;
  user?: AuthUserProfile | null;
}) {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6 lg:gap-10">
            <Link
              href="/admin/properties"
              className="flex-shrink-0 flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-mosque flex items-center justify-center text-white shadow-sm">
                <span className="material-icons text-lg">apartment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-nordic-dark">
                  LuxeEstate
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-hint-of-green text-mosque border border-mosque/15">
                  Admin
                </span>
              </div>
            </Link>

            <AdminNavLinks
              propertiesLabel={dict.admin.nav.properties}
              usersLabel={dict.admin.nav.users}
              backToSiteLabel={dict.admin.nav.backToSite}
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSelector
              currentLocale={locale}
              ariaLabel={dict.navbar.languageSelectorAriaLabel}
            />
            {user && (
              <div className="hidden md:flex flex-col items-end pl-3 border-l border-nordic-dark/10">
                <span className="text-xs font-semibold text-nordic-dark leading-tight">
                  {user.name}
                </span>
                <span className="text-[11px] text-mosque font-medium leading-tight">
                  {dict.admin.nav.adminBadge}
                </span>
              </div>
            )}
            <NavbarUserMenu
              initialUser={user}
              profileAriaLabel={dict.navbar.profileAriaLabel}
              signInLabel={dict.navbar.signIn}
              signOutLabel={dict.navbar.signOut}
              adminDashboardLabel={dict.navbar.adminDashboard}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

async function AdminNavbarDynamic() {
  const [{ locale, dict }, user] = await Promise.all([
    getServerI18n(),
    getCurrentUser(),
  ]);
  return <AdminNavbarView locale={locale} dict={dict} user={user} />;
}

export function AdminNavbar() {
  const fallbackDict = getDictionarySync(DEFAULT_LOCALE);
  return (
    <Suspense
      fallback={<AdminNavbarView locale={DEFAULT_LOCALE} dict={fallbackDict} />}
    >
      <AdminNavbarDynamic />
    </Suspense>
  );
}

