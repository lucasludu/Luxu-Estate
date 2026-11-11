import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isValidLocale,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  resolveLocaleFromAcceptLanguage,
} from "@/i18n/config";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const existingCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (!isValidLocale(existingCookie)) {
    const detectedLocale = resolveLocaleFromAcceptLanguage(
      request.headers.get("accept-language")
    );

    response.cookies.set(LOCALE_COOKIE_NAME, detectedLocale, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

