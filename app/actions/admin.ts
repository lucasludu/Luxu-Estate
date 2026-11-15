"use server";

import { revalidatePath, updateTag } from "next/cache";
import {
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
    .filter(
      (img) => img && typeof img.url === "string" && img.url.trim().length > 0
    )
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
    const candidate =
      FALLBACK_GALLERY_IMAGES[fallbackIndex % FALLBACK_GALLERY_IMAGES.length];
    result.push({
      url: candidate.url,
      alt: `${title} - ${candidate.alt}`,
    });
    fallbackIndex += 1;
  }
  return result;
}

function invalidatePropertiesCache(slug?: string, propertyId?: string) {
  try {
    updateTag("properties");
    updateTag("properties-v4");
    if (slug) {
      updateTag(`property-${slug}`);
    }
  } catch {
    // ignore if called outside tag cache context
  }
  revalidatePath("/admin/properties");
  revalidatePath("/admin/properties/new");
  if (propertyId) {
    revalidatePath(`/admin/properties/${propertyId}/edit`);
  }
  if (slug) {
    revalidatePath(`/properties/${slug}`);
  }
  revalidatePath("/admin");
  revalidatePath("/");
}

async function getAuthenticatedAdminClient() {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase: null, user: null, error: "unauthorized" as const };
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

  const role: UserRole = isValidUserRole(roleRow?.role_id)
    ? roleRow.role_id
    : "viewer";
  const status: UserStatus = isValidUserStatus(profileRow?.status)
    ? profileRow.status
    : "active";

  if (role !== "admin" || status === "suspended") {
    return { supabase: null, user: null, error: "unauthorized" as const };
  }

  return {
    supabase,
    user: {
      id: user.id,
      email: user.email ?? null,
      role,
      status,
    },
    error: null,
  };
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
  const { supabase, error: authErr } = await getAuthenticatedAdminClient();
  if (!supabase || authErr) {
    return { ok: false, error: "unauthorized" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "invalid_file" };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "file_too_large" };
  }

  const existingPath = formData.get("replacePath");
  const ext = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const safeExt = ["jpg", "jpeg", "png", "webp", "avif", "gif"].includes(ext)
    ? ext
    : "jpg";

  const storagePath =
    typeof existingPath === "string" && existingPath.trim().length > 0
      ? existingPath.trim()
      : `listings/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;

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
  const { supabase, error: authErr } = await getAuthenticatedAdminClient();
  if (!supabase || authErr) {
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

function normalizeCoordinate(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number
): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(max, Math.max(min, value));
  }
  return fallback;
}

export async function createPropertyAction(
  input: CreatePropertyInput
): Promise<AdminMutationResult> {
  const { supabase, error: authErr } = await getAuthenticatedAdminClient();
  if (!supabase || authErr) {
    return { ok: false, error: "unauthorized" };
  }

  if (!input.title?.trim() || !input.location?.trim()) {
    return { ok: false, error: "invalid_input" };
  }

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
      : ["Swimming Pool", "High-speed Wifi", "Air Conditioning", "Parking"];

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
    latitude: normalizeCoordinate(input.latitude, -90, 90, 37.4419),
    longitude: normalizeCoordinate(input.longitude, -180, 180, -122.143),
  };

  if (input.agentName?.trim()) {
    insertPayload.agent_name = input.agentName.trim();
  }
  if (input.agentRole?.trim()) {
    insertPayload.agent_role = input.agentRole.trim();
  }
  if (input.agentAvatar?.trim()) {
    insertPayload.agent_avatar = input.agentAvatar.trim();
  }

  const { data: insertedRow, error } = await supabase
    .from("properties")
    .insert(insertPayload)
    .select("id, slug")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!insertedRow) {
    return {
      ok: false,
      error: "No se pudo guardar la propiedad (verifica permisos RLS).",
    };
  }

  const finalSlug = String(insertedRow.slug || slug);
  invalidatePropertiesCache(finalSlug, id);

  return { ok: true, id, slug: finalSlug };
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
  const { supabase, error: authErr } = await getAuthenticatedAdminClient();
  if (!supabase || authErr) {
    return { ok: false, error: "unauthorized" };
  }

  if (!propertyId || !input.title?.trim() || !input.location?.trim()) {
    return { ok: false, error: "invalid_input" };
  }

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

  if (typeof input.yearBuilt === "number" && Number.isFinite(input.yearBuilt)) {
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

  if (typeof input.latitude === "number" && Number.isFinite(input.latitude)) {
    updateData.latitude = Math.min(90, Math.max(-90, input.latitude));
  }
  if (typeof input.longitude === "number" && Number.isFinite(input.longitude)) {
    updateData.longitude = Math.min(180, Math.max(-180, input.longitude));
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
    .select("id, slug")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!updatedRow) {
    return {
      ok: false,
      error:
        "No se pudo actualizar la propiedad (verifica tu sesión de administrador o políticas RLS).",
    };
  }

  const slug = updatedRow.slug ? String(updatedRow.slug) : undefined;
  invalidatePropertiesCache(slug, propertyId);

  return { ok: true, id: propertyId, slug };
}

export async function deletePropertyAction(
  propertyId: string
): Promise<AdminMutationResult> {
  const { supabase, error: authErr } = await getAuthenticatedAdminClient();
  if (!supabase || authErr) {
    return { ok: false, error: "unauthorized" };
  }

  if (!propertyId) {
    return { ok: false, error: "invalid_input" };
  }

  const { data: deletedRow, error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .select("id, slug")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!deletedRow) {
    return {
      ok: false,
      error: "No se pudo eliminar la propiedad (verifica permisos RLS).",
    };
  }

  const slug = deletedRow.slug ? String(deletedRow.slug) : undefined;
  invalidatePropertiesCache(slug, propertyId);

  return { ok: true };
}

export async function updateUserRoleAction(
  targetUserId: string,
  newRole: UserRole
): Promise<AdminMutationResult> {
  const { supabase, user: currentUser, error: authErr } =
    await getAuthenticatedAdminClient();
  if (!supabase || !currentUser || authErr) {
    return { ok: false, error: "unauthorized" };
  }

  if (!targetUserId || !isValidUserRole(newRole)) {
    return { ok: false, error: "invalid_input" };
  }

  if (targetUserId === currentUser.id && newRole !== "admin") {
    return { ok: false, error: "self_demote_forbidden" };
  }

  const { data: updatedRow, error } = await supabase
    .from("user_roles")
    .upsert(
      {
        user_id: targetUserId,
        role_id: newRole,
        updated_by: currentUser.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("user_id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!updatedRow) {
    return {
      ok: false,
      error: "No se pudo actualizar el rol (verifica permisos RLS).",
    };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateUserStatusAction(
  targetUserId: string,
  newStatus: UserStatus
): Promise<AdminMutationResult> {
  const { supabase, user: currentUser, error: authErr } =
    await getAuthenticatedAdminClient();
  if (!supabase || !currentUser || authErr) {
    return { ok: false, error: "unauthorized" };
  }

  if (!targetUserId || !isValidUserStatus(newStatus)) {
    return { ok: false, error: "invalid_input" };
  }

  if (targetUserId === currentUser.id && newStatus === "suspended") {
    return { ok: false, error: "self_suspend_forbidden" };
  }

  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!updatedProfile) {
    return {
      ok: false,
      error: "No se pudo actualizar el estado del usuario (verifica permisos RLS).",
    };
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

export interface GeocodeSuggestion {
  displayName: string;
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  ok: boolean;
  lat?: number;
  lng?: number;
  displayName?: string;
  suggestions?: GeocodeSuggestion[];
  error?: string;
}

export async function geocodeAddressAction(
  rawQuery: string
): Promise<GeocodeResult> {
  const query = String(rawQuery ?? "").trim();
  if (query.length < 3) {
    return { ok: false, error: "query_too_short" };
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(
      query
    )}`;
    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "LuxeEstateRealEstateApp/1.0 (admin@luxeestate.com)",
        "Accept-Language": "es,en;q=0.9",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const data = (await response.json()) as Array<{
        lat?: string;
        lon?: string;
        display_name?: string;
      }>;

      if (Array.isArray(data) && data.length > 0) {
        const suggestions: GeocodeSuggestion[] = data
          .map((item) => ({
            displayName: String(item.display_name ?? query),
            lat: Number(Number.parseFloat(String(item.lat)).toFixed(6)),
            lng: Number(Number.parseFloat(String(item.lon)).toFixed(6)),
          }))
          .filter(
            (item) => Number.isFinite(item.lat) && Number.isFinite(item.lng)
          );

        if (suggestions.length > 0) {
          const best = suggestions[0];
          return {
            ok: true,
            lat: best.lat,
            lng: best.lng,
            displayName: best.displayName,
            suggestions,
          };
        }
      }
    }
  } catch {
    // Fallback to Photon below
  }

  try {
    const photonUrl = `https://photon.komoot.io/api/?limit=5&q=${encodeURIComponent(
      query
    )}`;
    const response = await fetch(photonUrl, {
      headers: {
        "User-Agent": "LuxeEstateRealEstateApp/1.0",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const data = (await response.json()) as {
        features?: Array<{
          geometry?: { coordinates?: [number, number] };
          properties?: {
            name?: string;
            street?: string;
            housenumber?: string;
            city?: string;
            state?: string;
            country?: string;
          };
        }>;
      };

      const features = data?.features ?? [];
      const suggestions: GeocodeSuggestion[] = features
        .map((f) => {
          const coords = f.geometry?.coordinates;
          if (!Array.isArray(coords) || coords.length < 2) return null;
          const lng = Number(Number(coords[0]).toFixed(6));
          const lat = Number(Number(coords[1]).toFixed(6));
          const props = f.properties ?? {};
          const streetPart = [props.street, props.housenumber]
            .filter(Boolean)
            .join(" ");
          const parts = [
            streetPart || props.name,
            props.city,
            props.state,
            props.country,
          ].filter(Boolean);
          return {
            displayName: parts.join(", ") || query,
            lat,
            lng,
          };
        })
        .filter(
          (item): item is GeocodeSuggestion =>
            item !== null &&
            Number.isFinite(item.lat) &&
            Number.isFinite(item.lng)
        );

      if (suggestions.length > 0) {
        const best = suggestions[0];
        return {
          ok: true,
          lat: best.lat,
          lng: best.lng,
          displayName: best.displayName,
          suggestions,
        };
      }
    }
  } catch {
    // Ignore
  }

  return { ok: false, error: "not_found" };
}

export async function reverseGeocodeAction(
  lat: number,
  lng: number
): Promise<{ ok: boolean; displayName?: string }> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false };
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      String(lat)
    )}&lon=${encodeURIComponent(String(lng))}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "LuxeEstateRealEstateApp/1.0 (admin@luxeestate.com)",
        "Accept-Language": "es,en;q=0.9",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const data = (await response.json()) as {
        display_name?: string;
        address?: {
          road?: string;
          house_number?: string;
          suburb?: string;
          city?: string;
          town?: string;
          state?: string;
          country?: string;
        };
      };

      if (data?.address) {
        const a = data.address;
        const street = [a.road, a.house_number].filter(Boolean).join(" ");
        const locality = a.city || a.town || a.suburb;
        const concise = [street, locality, a.state, a.country]
          .filter(Boolean)
          .join(", ");
        if (concise) {
          return { ok: true, displayName: concise };
        }
      }

      if (data?.display_name) {
        return { ok: true, displayName: data.display_name };
      }
    }
  } catch {
    // Ignore
  }

  return { ok: false };
}

export async function createUserAction(
  input: CreateUserInput
): Promise<AdminMutationResult> {
  const { supabase, user: currentUser, error: authErr } =
    await getAuthenticatedAdminClient();
  if (!supabase || !currentUser || authErr) {
    return { ok: false, error: "unauthorized" };
  }

  if (
    !input.email?.trim() ||
    !input.fullName?.trim() ||
    !isValidUserRole(input.role)
  ) {
    return { ok: false, error: "invalid_input" };
  }

  const cleanEmail = input.email.trim().toLowerCase();
  const cleanName = input.fullName.trim();
  const cleanStatus: UserStatus =
    input.status && isValidUserStatus(input.status) ? input.status : "active";

  const { data: createdId, error: rpcError } = await supabase.rpc(
    "admin_create_user",
    {
      p_email: cleanEmail,
      p_full_name: cleanName,
      p_role: input.role,
      p_status: cleanStatus,
    }
  );

  if (rpcError) {
    return { ok: false, error: rpcError.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true, id: createdId ? String(createdId) : undefined };
}
