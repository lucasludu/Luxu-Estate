import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ListingType,
  Property,
  PropertyCategory,
  PropertyImage,
} from "@/data/properties";

export const PAGE_SIZE = 8;

export type MarketFilter = "all" | "buy" | "rent";

export interface PropertyFilters {
  category: PropertyCategory;
  market: MarketFilter;
  q: string;
}

interface PropertyRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: number | string;
  is_monthly: boolean;
  beds: number;
  baths: number | string;
  area_m2: number;
  garage?: number | null;
  image_url: string;
  image_alt: string;
  images?: PropertyImage[] | null;
  category: Exclude<PropertyCategory, "All">;
  listing_type: ListingType;
  badge: string | null;
  featured: boolean;
  description?: string[] | null;
  amenities?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  agent_name?: string | null;
  agent_role?: string | null;
  agent_avatar?: string | null;
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const areaFormatter = new Intl.NumberFormat("en-US");

const DEFAULT_AGENT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w";

const DEFAULT_DESCRIPTION = [
  "Experience modern luxury in this architecturally stunning home designed with an emphasis on indoor-outdoor living. The residence features floor-to-ceiling glass walls that flood the interiors with natural light.",
  "The open-concept kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for culinary enthusiasts. Retreat to the primary suite, a sanctuary of relaxation with a spa-inspired bath and private balcony.",
];

const DEFAULT_AMENITIES = [
  "Smart Home System",
  "Swimming Pool",
  "Central Heating & Cooling",
  "Electric Vehicle Charging",
  "Private Gym",
  "Wine Cellar",
];

function calculateMonthlyPayment(
  price: number,
  isMonthly: boolean,
  downPaymentRatio = 0.2,
  annualRate = 0.051,
  years = 30
): string {
  if (isMonthly) {
    return `${priceFormatter.format(price)}/mo`;
  }
  const principal = price * (1 - downPaymentRatio);
  const monthlyRate = annualRate / 12;
  const totalPayments = years * 12;
  const monthly =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);
  return `${priceFormatter.format(Math.round(monthly))}/mo`;
}

function normalizeImages(row: PropertyRow): PropertyImage[] {
  const primary: PropertyImage = {
    url: row.image_url,
    alt: row.image_alt || row.title,
  };
  if (!Array.isArray(row.images) || row.images.length === 0) {
    return [primary];
  }
  const valid = row.images.filter(
    (img): img is PropertyImage =>
      Boolean(img && typeof img.url === "string" && img.url.trim().length > 0)
  );
  return valid.length > 0 ? valid : [primary];
}

function toProperty(row: PropertyRow): Property {
  const price = Number(row.price);
  const isRent = row.listing_type === "rent";
  const images = normalizeImages(row);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    price,
    priceFormatted: priceFormatter.format(price),
    isMonthly: row.is_monthly,
    beds: row.beds,
    baths: Number(row.baths),
    area: `${areaFormatter.format(row.area_m2)} m²`,
    areaValue: row.area_m2,
    garage: row.garage ?? 2,
    image: images[0].url,
    imageAlt: images[0].alt,
    images,
    category: row.category,
    listingType: row.listing_type,
    statusLabel: isRent ? "FOR RENT" : "FOR SALE",
    badge: row.badge ?? undefined,
    featured: row.featured,
    hasBottomGradient: row.featured && row.badge === "Exclusive",
    description:
      Array.isArray(row.description) && row.description.length > 0
        ? row.description
        : DEFAULT_DESCRIPTION,
    amenities:
      Array.isArray(row.amenities) && row.amenities.length > 0
        ? row.amenities
        : DEFAULT_AMENITIES,
    coordinates: {
      lat: typeof row.latitude === "number" ? row.latitude : 37.4419,
      lng: typeof row.longitude === "number" ? row.longitude : -122.143,
    },
    agent: {
      name: row.agent_name || "Sarah Jenkins",
      role: row.agent_role || "Top Rated Agent",
      avatar: row.agent_avatar || DEFAULT_AGENT_AVATAR,
    },
    estimatedMonthlyPayment: calculateMonthlyPayment(price, row.is_monthly),
  };
}

/** Escapes characters that have special meaning in PostgREST filters / LIKE. */
function sanitizeSearch(term: string) {
  return term.replace(/[%_\\,()*]/g, " ").replace(/\s+/g, " ").trim();
}

function applyFilters<
  T extends {
    eq: (column: string, value: string) => T;
    or: (filters: string) => T;
  },
>(query: T, filters: PropertyFilters, includeMarket: boolean): T {
  let result = query;
  if (filters.category !== "All") {
    result = result.eq("category", filters.category);
  }
  if (includeMarket && filters.market !== "all") {
    result = result.eq(
      "listing_type",
      filters.market === "buy" ? "sale" : "rent"
    );
  }
  const term = sanitizeSearch(filters.q);
  if (term) {
    result = result.or(`title.ilike.%${term}%,location.ilike.%${term}%`);
  }
  return result;
}

export async function getFeaturedProperties(
  filters: PropertyFilters
): Promise<Property[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("properties");

  const supabase = createSupabaseServerClient();
  const query = applyFilters(
    supabase.from("properties").select("*").eq("featured", true),
    filters,
    false
  )
    .order("created_at", { ascending: false })
    .order("id");

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load featured properties: ${error.message}`);
  return (data as PropertyRow[]).map(toProperty);
}

export interface MarketPage {
  items: Property[];
  total: number;
  totalPages: number;
  page: number;
}

export async function getMarketProperties(
  filters: PropertyFilters,
  page: number
): Promise<MarketPage> {
  "use cache";
  cacheLife("hours");
  cacheTag("properties");

  const from = (page - 1) * PAGE_SIZE;
  const supabase = createSupabaseServerClient();
  const query = applyFilters(
    supabase
      .from("properties")
      .select("*", { count: "exact" })
      .eq("featured", false),
    filters,
    true
  )
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await query;

  // PostgREST answers 416 (PGRST103) when the requested range starts past the
  // last row. Fetch only the total so the caller can redirect to a valid page.
  if (error?.code === "PGRST103") {
    const { count: total, error: countError } = await applyFilters(
      supabase
        .from("properties")
        .select("*", { count: "exact" })
        .eq("featured", false),
      filters,
      true
    ).range(0, 0);
    if (countError) {
      throw new Error(`Failed to load properties: ${countError.message}`);
    }
    return {
      items: [],
      total: total ?? 0,
      totalPages: Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE)),
      page,
    };
  }
  if (error) throw new Error(`Failed to load properties: ${error.message}`);

  const total = count ?? 0;
  return {
    items: (data as PropertyRow[]).map(toProperty),
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    page,
  };
}

async function fetchPropertyBySlugCached(slug: string): Promise<Property | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("properties", `property-${slug}`);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load property "${slug}": ${error.message}`);
  }
  if (!data) return null;
  return toProperty(data as PropertyRow);
}

export const getPropertyBySlug = cache(async (slug: string): Promise<Property | null> => {
  return fetchPropertyBySlugCached(slug);
});

export async function getAllPropertySlugs(): Promise<{ slug: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("properties");

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("slug")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load property slugs: ${error.message}`);
  }
  return (data ?? []).map((row) => ({ slug: String(row.slug) }));
}
