import "server-only";
import { cookies, headers } from "next/headers";
import {
  isValidLocale,
  LOCALE_COOKIE_NAME,
  resolveLocaleFromAcceptLanguage,
  type Locale,
} from "./config";
import { getDictionarySync, type Dictionary } from "./index";

/**
 * Reads the active locale from the user's cookie on the server,
 * falling back to the `Accept-Language` header or `DEFAULT_LOCALE`.
 *
 * Note: Under Next.js `cacheComponents: true`, call this inside a
 * `<Suspense>` boundary so the static shell can still be prerendered.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (isValidLocale(cookieValue)) {
    return cookieValue;
  }

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  return resolveLocaleFromAcceptLanguage(acceptLanguage);
}

export async function getServerI18n(): Promise<{
  locale: Locale;
  dict: Dictionary;
}> {
  const locale = await getLocale();
  const dict = getDictionarySync(locale);
  return { locale, dict };
}
