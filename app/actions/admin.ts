"use server";

import { revalidatePath, updateTag } from "next/cache";
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

export interface UpdatePropertyInput {
  title: string;
  location: string;
  price: number;
  isMonthly?: boolean;
  beds: number;
  baths: number;
  areaM2: number;
  garage?: number;
  category: "House" | "Apartment" | "Villa" | "Penthouse";
  listingType: "sale" | "rent";
  badge?: string | null;
  featured?: boolean;
}

export async function updatePropertyAction(
  propertyId: string,
  input: UpdatePropertyInput
): Promise<AdminMutationResult> {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    currentUser.role !== "admin" ||
    currentUser.status === "suspended"
  ) {
    return { ok: false, error: "unauthorized" };
  }

  if (!propertyId || !input.title?.trim() || !input.location?.trim()) {
    return { ok: false, error: "invalid_input" };
  }

  const supabase = await createSupabaseAuthServerClient();

  const { error } = await supabase
    .from("properties")
    .update({
      title: input.title.trim(),
      location: input.location.trim(),
      price: Math.max(0, Number(input.price) || 0),
      is_monthly: Boolean(input.isMonthly ?? input.listingType === "rent"),
      beds: Math.max(0, Math.floor(Number(input.beds) || 0)),
      baths: Math.max(0, Number(input.baths) || 0),
      area_m2: Math.max(0, Math.floor(Number(input.areaM2) || 0)),
      garage: Math.max(0, Math.floor(Number(input.garage ?? 2))),
      category: input.category,
      listing_type: input.listingType,
      badge: input.badge && input.badge.trim() ? input.badge.trim() : null,
      featured: Boolean(input.featured),
    })
    .eq("id", propertyId);

  if (error) {
    return { ok: false, error: error.message };
  }

  try {
    updateTag("properties");
  } catch {
    // ignore if called outside tag cache context
  }
  revalidatePath("/admin/properties");
  revalidatePath("/admin");
  revalidatePath("/");

  return { ok: true };
}

export async function deletePropertyAction(
  propertyId: string
): Promise<AdminMutationResult> {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    currentUser.role !== "admin" ||
    currentUser.status === "suspended"
  ) {
    return { ok: false, error: "unauthorized" };
  }

  if (!propertyId) {
    return { ok: false, error: "invalid_input" };
  }

  const supabase = await createSupabaseAuthServerClient();

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId);

  if (error) {
    return { ok: false, error: error.message };
  }

  try {
    updateTag("properties");
  } catch {
    // ignore if called outside tag cache context
  }
  revalidatePath("/admin/properties");
  revalidatePath("/admin");
  revalidatePath("/");

  return { ok: true };
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

