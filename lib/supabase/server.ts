import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getSupabaseCredentials() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY environment variables."
    );
  }

  return { url, key };
}

/**
 * Stateless Supabase client for public data queries inside `"use cache"` scopes
 * where reading `cookies()` is not allowed.
 */
export function createSupabaseServerClient() {
  const { url, key } = getSupabaseCredentials();

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Cookie-aware Supabase SSR client for Auth (Server Components, Server Actions, Route Handlers).
 */
export async function createSupabaseAuthServerClient() {
  const { url, key } = getSupabaseCredentials();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component; session refresh is handled by proxy.ts
        }
      },
    },
  });
}
