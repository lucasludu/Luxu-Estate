"use server";

import { cookies } from "next/headers";
import {
  isValidLocale,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  type Locale,
} from "@/i18n/config";

export async function setLocaleCookieAction(locale: string): Promise<Locale | null> {
  if (!isValidLocale(locale)) {
    return null;
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });

  return locale;
}

