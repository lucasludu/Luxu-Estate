"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAuthServerClient } from "@/lib/supabase/server";

export type SocialProvider = "google" | "github";

async function getRequestOrigin(): Promise<string> {
  const headerStore = await headers();
  const originHeader = headerStore.get("origin");
  if (originHeader) {
    return originHeader;
  }
  const host =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "localhost:3000";
  const proto =
    headerStore.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signInWithOAuthAction(provider: SocialProvider) {
  const supabase = await createSupabaseAuthServerClient();
  const origin = await getRequestOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOutAction() {
  const supabase = await createSupabaseAuthServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

