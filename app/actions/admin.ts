"use server";

import { revalidatePath } from "next/cache";
import {
  getCurrentUser,
  isValidUserRole,
  isValidUserStatus,
  type UserRole,
  type UserStatus,
} from "@/lib/auth";
import { createSupabaseAuthServerClient } from "@/lib/supabase/server";

export interface AdminMutationResult {
  ok: boolean;
  error?: string;
}

export async function updateUserRoleAction(
  targetUserId: string,
  newRole: UserRole
): Promise<AdminMutationResult> {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    currentUser.role !== "admin" ||
    currentUser.status === "suspended"
  ) {
    return { ok: false, error: "unauthorized" };
  }

  if (!targetUserId || !isValidUserRole(newRole)) {
    return { ok: false, error: "invalid_input" };
  }

  if (targetUserId === currentUser.id && newRole !== "admin") {
    return { ok: false, error: "self_demote_forbidden" };
  }

  const supabase = await createSupabaseAuthServerClient();

  const { error } = await supabase.from("user_roles").upsert(
    {
      user_id: targetUserId,
      role_id: newRole,
      updated_by: currentUser.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateUserStatusAction(
  targetUserId: string,
  newStatus: UserStatus
): Promise<AdminMutationResult> {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    currentUser.role !== "admin" ||
    currentUser.status === "suspended"
  ) {
    return { ok: false, error: "unauthorized" };
  }

  if (!targetUserId || !isValidUserStatus(newStatus)) {
    return { ok: false, error: "invalid_input" };
  }

  if (targetUserId === currentUser.id && newStatus === "suspended") {
    return { ok: false, error: "self_suspend_forbidden" };
  }

  const supabase = await createSupabaseAuthServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

