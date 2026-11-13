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
import type { PropertyImage } from "@/data/properties";

export interface AdminMutationResult {
  ok: boolean;
  error?: string;
}

export interface CreatePropertyInput {
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
  images?: PropertyImage[];
  amenities?: string[];
}

export async function createPropertyAction(
  input: CreatePropertyInput
): Promise<AdminMutationResult> {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    currentUser.role !== "admin" ||
    currentUser.status === "suspended"
  ) {
    return { ok: false, error: "unauthorized" };
  }

  if (!input.title?.trim() || !input.location?.trim()) {
    return { ok: false, error: "invalid_input" };
  }

  const supabase = await createSupabaseAuthServerClient();
  const id = crypto.randomUUID();
  const baseSlug =
    input.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "property";
  const slug = `${baseSlug}-${id.slice(0, 6)}`;

  const defaultImage = {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    alt: input.title.trim(),
  };

  const imagesToInsert =
    input.images && input.images.length > 0 ? input.images : [defaultImage];

  const amenitiesToInsert =
    input.amenities && input.amenities.length > 0
      ? input.amenities
      : [
          "Swimming Pool",
          "High-speed Wifi",
          "Air Conditioning",
          "Parking",
        ];

  const { error } = await supabase.from("properties").insert({
    id,
    slug,
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
    images: imagesToInsert,
    description: [
      "Experience modern luxury in this architecturally stunning home designed with an emphasis on indoor-outdoor living. The residence features floor-to-ceiling glass walls that flood the interiors with natural light.",
      "The open-concept kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for culinary enthusiasts. Retreat to the primary suite, a sanctuary of relaxation with a spa-inspired bath and private balcony.",
    ],
    amenities: amenitiesToInsert,
  });

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
  images?: PropertyImage[];
  amenities?: string[];
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

  const updateData: Record<string, unknown> = {
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
  };

  if (input.images && input.images.length > 0) {
    updateData.images = input.images;
  }
  if (input.amenities && input.amenities.length > 0) {
    updateData.amenities = input.amenities;
  }

  const { error } = await supabase
    .from("properties")
    .update(updateData)
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

export interface CreateUserInput {
  email: string;
  fullName: string;
  role: UserRole;
  status?: UserStatus;
}

export async function createUserAction(
  input: CreateUserInput
): Promise<AdminMutationResult> {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    currentUser.role !== "admin" ||
    currentUser.status === "suspended"
  ) {
    return { ok: false, error: "unauthorized" };
  }

  if (
    !input.email?.trim() ||
    !input.fullName?.trim() ||
    !isValidUserRole(input.role)
  ) {
    return { ok: false, error: "invalid_input" };
  }

  const supabase = await createSupabaseAuthServerClient();
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    email: input.email.trim().toLowerCase(),
    full_name: input.fullName.trim(),
    avatar_url: null,
    provider: "email",
    status:
      input.status && isValidUserStatus(input.status) ? input.status : "active",
    created_at: now,
    updated_at: now,
  });

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: userId,
    role_id: input.role,
    updated_by: currentUser.id,
    updated_at: now,
  });

  if (roleError) {
    return { ok: false, error: roleError.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

