import { Suspense } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getDictionarySync, type Dictionary } from "@/i18n";
import { getServerI18n } from "@/i18n/server";
import { getCurrentUser, type AuthUserProfile } from "@/lib/auth";
import { LanguageSelector } from "./LanguageSelector";
import { NavbarUserMenu } from "./NavbarUserMenu";

interface NavLinkItem {
  label: string;
  href: string;
  active?: boolean;
}

function getNavLinks(dict: Dictionary): NavLinkItem[] {
  return [
    { label: dict.navbar.buy, href: "/?type=buy", active: true },
    { label: dict.navbar.rent, href: "/?type=rent" },
    { label: dict.navbar.sell, href: "#" },
    { label: dict.navbar.savedHomes, href: "#" },
  ];
}

function NavbarView({
  locale,
  dict,
  user = null,
}: {
  locale: Locale;
  dict: Dictionary;
  user?: AuthUserProfile | null;
}) {
  const navLinks = getNavLinks(dict);

  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            href="/"
            aria-label={dict.navbar.homeAriaLabel}
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
            {navLinks.map((link) => (
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

          <div className="flex items-center space-x-4 sm:space-x-5">
            <LanguageSelector
              currentLocale={locale}
              ariaLabel={dict.navbar.languageSelectorAriaLabel}
            />
            <Link
              href="/"
              aria-label={dict.navbar.searchAriaLabel}
              className="text-nordic-dark hover:text-mosque transition-colors"
            >
              <span className="material-icons">search</span>
            </Link>
            <button
              type="button"
              aria-label={dict.navbar.notificationsAriaLabel}
              className="text-nordic-dark hover:text-mosque transition-colors relative"
            >
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>
            <NavbarUserMenu
              initialUser={user}
              profileAriaLabel={dict.navbar.profileAriaLabel}
              signInLabel={dict.navbar.signIn}
              signOutLabel={dict.navbar.signOut}
            />
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-nordic-dark/5 bg-background-light overflow-hidden h-0 transition-all duration-300">
        <div className="px-4 py-2 space-y-1">
          {navLinks.map((link) => (
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

async function NavbarDynamic() {
  const [{ locale, dict }, user] = await Promise.all([
    getServerI18n(),
    getCurrentUser(),
  ]);
  return <NavbarView locale={locale} dict={dict} user={user} />;
}

export function Navbar() {
  const fallbackDict = getDictionarySync(DEFAULT_LOCALE);
  return (
    <Suspense
      fallback={<NavbarView locale={DEFAULT_LOCALE} dict={fallbackDict} />}
    >
      <NavbarDynamic />
    </Suspense>
  );
}
