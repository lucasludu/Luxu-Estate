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
  id?: string;
  slug?: string;
}

const PROPERTY_IMAGES_BUCKET = "property-images";

const FALLBACK_GALLERY_IMAGES: PropertyImage[] = [
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    alt: "Main exterior view",
  },
  {
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    alt: "Luxury living room",
  },
  {
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    alt: "Infinity pool & terrace",
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    alt: "Panoramic architectural view",
  },
];

function ensureMinimumGalleryImages(
  images: PropertyImage[] | undefined,
  title: string
): PropertyImage[] {
  const valid = (images ?? [])
    .filter((img) => img && typeof img.url === "string" && img.url.trim().length > 0)
    .map((img) => ({
      url: img.url.trim(),
      alt: img.alt?.trim() || title,
    }));

  if (valid.length >= 4) {
    return valid;
  }

  const result = [...valid];
  let fallbackIndex = 0;
  while (result.length < 4) {
    const candidate = FALLBACK_GALLERY_IMAGES[fallbackIndex % FALLBACK_GALLERY_IMAGES.length];
    result.push({
      url: candidate.url,
      alt: `${title} - ${candidate.alt}`,
    });
    fallbackIndex += 1;
  }
  return result;
}

export interface UploadPropertyImageResult {
  ok: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export async function uploadPropertyImageAction(
  formData: FormData
): Promise<UploadPropertyImageResult> {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    currentUser.role !== "admin" ||
    currentUser.status === "suspended"
  ) {
    return { ok: false, error: "unauthorized" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "invalid_file" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "file_too_large" };
  }

  const existingPath = formData.get("replacePath");
  const ext = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const safeExt = ["jpg", "jpeg", "png", "webp", "avif"].includes(ext)
    ? ext
    : "jpg";

  const storagePath =
    typeof existingPath === "string" && existingPath.trim().length > 0
      ? existingPath.trim()
      : `listings/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;

  const supabase = await createSupabaseAuthServerClient();
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || `image/${safeExt === "jpg" ? "jpeg" : safeExt}`,
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(storagePath);

  const cacheBustedUrl =
    typeof existingPath === "string" && existingPath.trim().length > 0
      ? `${publicUrl}?v=${Date.now()}`
      : publicUrl;

  return {
    ok: true,
    url: cacheBustedUrl,
    path: storagePath,
  };
}

export async function deletePropertyImageFromBucketAction(
  imageUrl: string
): Promise<AdminMutationResult> {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    currentUser.role !== "admin" ||
    currentUser.status === "suspended"
  ) {
    return { ok: false, error: "unauthorized" };
  }

  const marker = `/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) {
    return { ok: true };
  }

  const rawPath = imageUrl.slice(idx + marker.length).split("?")[0];
  if (!rawPath) {
    return { ok: true };
  }

  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .remove([decodeURIComponent(rawPath)]);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
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
  yearBuilt?: number;
  category: "House" | "Apartment" | "Villa" | "Penthouse";
  listingType: "sale" | "rent";
  badge?: string | null;
  featured?: boolean;
  description?: string[];
  images?: PropertyImage[];
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  agentName?: string;
  agentRole?: string;
  agentAvatar?: string;
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

  const cleanTitle = input.title.trim();
  const imagesToInsert = ensureMinimumGalleryImages(input.images, cleanTitle);

  const amenitiesToInsert =
    input.amenities && input.amenities.length > 0
      ? input.amenities
      : [
          "Swimming Pool",
          "High-speed Wifi",
          "Air Conditioning",
          "Parking",
        ];

  const descriptionParagraphs = (input.description ?? [])
    .map((p) => p.trim())
    .filter(Boolean);

  const descriptionToInsert =
    descriptionParagraphs.length > 0
      ? descriptionParagraphs
      : [
          "Experience modern luxury in this architecturally stunning home designed with an emphasis on indoor-outdoor living. The residence features floor-to-ceiling glass walls that flood the interiors with natural light.",
          "The open-concept kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for culinary enthusiasts. Retreat to the primary suite, a sanctuary of relaxation with a spa-inspired bath and private balcony.",
        ];

  const insertPayload: Record<string, unknown> = {
    id,
    slug,
    title: cleanTitle,
    location: input.location.trim(),
    price: Math.max(0, Number(input.price) || 0),
    is_monthly: Boolean(input.isMonthly ?? input.listingType === "rent"),
    beds: Math.max(0, Math.floor(Number(input.beds) || 0)),
    baths: Math.max(0, Number(input.baths) || 0),
    area_m2: Math.max(1, Math.floor(Number(input.areaM2) || 100)),
    garage: Math.max(0, Math.floor(Number(input.garage ?? 2))),
    year_built: Math.max(1800, Math.floor(Number(input.yearBuilt) || 2024)),
    category: input.category,
    listing_type: input.listingType,
    badge: input.badge && input.badge.trim() ? input.badge.trim() : null,
    featured: Boolean(input.featured),
    images: imagesToInsert,
    image_alt: imagesToInsert[0]?.alt || cleanTitle,
    description: descriptionToInsert,
    amenities: amenitiesToInsert,
  };

  if (typeof input.latitude === "number" && !Number.isNaN(input.latitude)) {
    insertPayload.latitude = input.latitude;
  }
  if (typeof input.longitude === "number" && !Number.isNaN(input.longitude)) {
    insertPayload.longitude = input.longitude;
  }
  if (input.agentName?.trim()) {
    insertPayload.agent_name = input.agentName.trim();
  }
  if (input.agentRole?.trim()) {
    insertPayload.agent_role = input.agentRole.trim();
  }
  if (input.agentAvatar?.trim()) {
    insertPayload.agent_avatar = input.agentAvatar.trim();
  }

  const { error } = await supabase.from("properties").insert(insertPayload);

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

  return { ok: true, id, slug };
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
  yearBuilt?: number;
  category: "House" | "Apartment" | "Villa" | "Penthouse";
  listingType: "sale" | "rent";
  badge?: string | null;
  featured?: boolean;
  description?: string[];
  images?: PropertyImage[];
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  agentName?: string;
  agentRole?: string;
  agentAvatar?: string;
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
  const cleanTitle = input.title.trim();

  const updateData: Record<string, unknown> = {
    title: cleanTitle,
    location: input.location.trim(),
    price: Math.max(0, Number(input.price) || 0),
    is_monthly: Boolean(input.isMonthly ?? input.listingType === "rent"),
    beds: Math.max(0, Math.floor(Number(input.beds) || 0)),
    baths: Math.max(0, Number(input.baths) || 0),
    area_m2: Math.max(1, Math.floor(Number(input.areaM2) || 100)),
    garage: Math.max(0, Math.floor(Number(input.garage ?? 2))),
    category: input.category,
    listing_type: input.listingType,
    badge: input.badge && input.badge.trim() ? input.badge.trim() : null,
    featured: Boolean(input.featured),
  };

  if (typeof input.yearBuilt === "number" && !Number.isNaN(input.yearBuilt)) {
    updateData.year_built = Math.max(1800, Math.floor(input.yearBuilt));
  }

  if (input.images && input.images.length > 0) {
    const normalized = ensureMinimumGalleryImages(input.images, cleanTitle);
    updateData.images = normalized;
    updateData.image_alt = normalized[0]?.alt || cleanTitle;
  }

  if (input.amenities && input.amenities.length > 0) {
    updateData.amenities = input.amenities;
  }

  if (input.description) {
    const paragraphs = input.description.map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length > 0) {
      updateData.description = paragraphs;
    }
  }

  if (typeof input.latitude === "number" && !Number.isNaN(input.latitude)) {
    updateData.latitude = input.latitude;
  }
  if (typeof input.longitude === "number" && !Number.isNaN(input.longitude)) {
    updateData.longitude = input.longitude;
  }
  if (input.agentName?.trim()) {
    updateData.agent_name = input.agentName.trim();
  }
  if (input.agentRole?.trim()) {
    updateData.agent_role = input.agentRole.trim();
  }
  if (input.agentAvatar?.trim()) {
    updateData.agent_avatar = input.agentAvatar.trim();
  }

  const { data: updatedRow, error } = await supabase
    .from("properties")
    .update(updateData)
    .eq("id", propertyId)
    .select("slug")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  const slug = updatedRow?.slug ? String(updatedRow.slug) : undefined;

  try {
    updateTag("properties");
    if (slug) {
      updateTag(`property-${slug}`);
    }
  } catch {
    // ignore if called outside tag cache context
  }
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  if (slug) {
    revalidatePath(`/properties/${slug}`);
  }
  revalidatePath("/admin");
  revalidatePath("/");

  return { ok: true, id: propertyId, slug };
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

