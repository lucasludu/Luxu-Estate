import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAuthServerClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "broker" | "agent" | "viewer";
export type UserStatus = "active" | "away" | "inactive" | "suspended";

export const VALID_USER_ROLES: readonly UserRole[] = [
  "admin",
  "broker",
  "agent",
  "viewer",
];

export const VALID_USER_STATUSES: readonly UserStatus[] = [
  "active",
  "away",
  "inactive",
  "suspended",
];

export interface AuthUserProfile {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  provider: string | null;
  role: UserRole;
  status: UserStatus;
}

export function isValidUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (VALID_USER_ROLES as readonly string[]).includes(value)
  );
}

export function isValidUserStatus(value: unknown): value is UserStatus {
  return (
    typeof value === "string" &&
    (VALID_USER_STATUSES as readonly string[]).includes(value)
  );
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

    const [{ data: roleRow }, { data: profileRow }] = await Promise.all([
      supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("status, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    const provider =
      typeof user.app_metadata?.provider === "string"
        ? user.app_metadata.provider
        : user.identities?.[0]?.provider ?? null;

    const role: UserRole = isValidUserRole(roleRow?.role_id)
      ? roleRow.role_id
      : "viewer";

    const status: UserStatus = isValidUserStatus(profileRow?.status)
      ? profileRow.status
      : "active";

    return {
      id: user.id,
      email: user.email ?? null,
      name:
        typeof profileRow?.full_name === "string" &&
        profileRow.full_name.trim().length > 0
          ? profileRow.full_name.trim()
          : extractDisplayName(user),
      avatarUrl:
        typeof profileRow?.avatar_url === "string" &&
        profileRow.avatar_url.trim().length > 0
          ? profileRow.avatar_url.trim()
          : extractAvatarUrl(user),
      provider,
      role,
      status,
    };
  } catch {
    return null;
  }
}

export async function requireAdminUser(
  nextPath = "/admin/properties"
): Promise<AuthUserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (user.role !== "admin" || user.status === "suspended") {
    redirect("/?error=unauthorized");
  }
  return user;
}
