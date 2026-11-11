/**
 * Internationalization (i18n) configuration.
 *
 * HOW TO ADD A NEW LANGUAGE IN THE FUTURE:
 * 1. Create a new JSON translation file in `i18n/dictionaries/<code.json>`
 *    (copy `i18n/dictionaries/en.json` as a template).
 * 2. Add the language code to `SUPPORTED_LOCALES` below.
 * 3. Add its metadata entry to `LANGUAGES` below.
 * 4. Register its dynamic loader in `i18n/index.ts`.
 */

export const SUPPORTED_LOCALES = ["es", "en", "de"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

/** 1 year in seconds */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface LanguageConfig {
  code: Locale;
  /** Native display name shown in the language selector */
  name: string;
  /** Short uppercase badge label */
  shortLabel: string;
  /** Flag emoji or symbol */
  flag: string;
  /** BCP 47 locale tag for Intl formatters */
  intlLocale: string;
}

export const LANGUAGES: Record<Locale, LanguageConfig> = {
  es: {
    code: "es",
    name: "Español",
    shortLabel: "ES",
    flag: "🇪🇸",
    intlLocale: "es-ES",
  },
  en: {
    code: "en",
    name: "English",
    shortLabel: "EN",
    flag: "🇺🇸",
    intlLocale: "en-US",
  },
  de: {
    code: "de",
    name: "Deutsch",
    shortLabel: "DE",
    flag: "🇩🇪",
    intlLocale: "de-DE",
  },
};

export const LANGUAGE_LIST: LanguageConfig[] = SUPPORTED_LOCALES.map(
  (code) => LANGUAGES[code]
);

export function isValidLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

/**
 * Parses an HTTP Accept-Language header and returns the best matching
 * supported locale, or `DEFAULT_LOCALE` if none matches.
 */
export function resolveLocaleFromAcceptLanguage(
  acceptLanguageHeader: string | null | undefined
): Locale {
  if (!acceptLanguageHeader) {
    return DEFAULT_LOCALE;
  }

  const parsed = acceptLanguageHeader
    .split(",")
    .map((part) => {
      const [rawTag, rawQ] = part.trim().split(";q=");
      const q = rawQ ? Number.parseFloat(rawQ) : 1;
      return {
        tag: rawTag.trim().toLowerCase(),
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const item of parsed) {
    if (isValidLocale(item.tag)) {
      return item.tag;
    }
    const baseTag = item.tag.split("-")[0];
    if (isValidLocale(baseTag)) {
      return baseTag;
    }
  }

  return DEFAULT_LOCALE;
}

