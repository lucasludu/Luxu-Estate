import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAuthServerClient } from "@/lib/supabase/server";

export interface AuthUserProfile {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  provider: string | null;
}

function extractAvatarUrl(user: User): string | null {
  const meta = user.user_metadata;
  if (
    typeof meta?.avatar_url === "string" &&
    meta.avatar_url.trim().length > 0
  ) {
    return meta.avatar_url.trim();
  }
  if (typeof meta?.picture === "string" && meta.picture.trim().length > 0) {
    return meta.picture.trim();
  }

  if (Array.isArray(user.identities)) {
    for (const identity of user.identities) {
      const data = identity.identity_data;
      if (
        typeof data?.avatar_url === "string" &&
        data.avatar_url.trim().length > 0
      ) {
        return data.avatar_url.trim();
      }
      if (typeof data?.picture === "string" && data.picture.trim().length > 0) {
        return data.picture.trim();
      }
    }
  }

  return null;
}

function extractDisplayName(user: User): string {
  const meta = user.user_metadata;
  const candidates = [
    meta?.full_name,
    meta?.name,
    meta?.user_name,
    meta?.preferred_username,
    user.email?.split("@")[0],
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return "User";
}

export async function getCurrentUser(): Promise<AuthUserProfile | null> {
  try {
    const cookieStore = await cookies();
    const hasAuthCookie = cookieStore
      .getAll()
      .some((cookie) => cookie.name.startsWith("sb-"));

    if (!hasAuthCookie) {
      return null;
    }

    await connection();
    const supabase = await createSupabaseAuthServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const provider =
      typeof user.app_metadata?.provider === "string"
        ? user.app_metadata.provider
        : user.identities?.[0]?.provider ?? null;

    return {
      id: user.id,
      email: user.email ?? null,
      name: extractDisplayName(user),
      avatarUrl: extractAvatarUrl(user),
      provider,
    };
  } catch {
    return null;
  }
}
