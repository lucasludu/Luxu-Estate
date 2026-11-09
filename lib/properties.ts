import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ListingType,
  Property,
  PropertyCategory,
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
  image_url: string;
  image_alt: string;
  category: Exclude<PropertyCategory, "All">;
  listing_type: ListingType;
  badge: string | null;
  featured: boolean;
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const areaFormatter = new Intl.NumberFormat("en-US");

function toProperty(row: PropertyRow): Property {
  const price = Number(row.price);
  const isRent = row.listing_type === "rent";
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
    image: row.image_url,
    imageAlt: row.image_alt,
    category: row.category,
    listingType: row.listing_type,
    statusLabel: isRent ? "FOR RENT" : "FOR SALE",
    badge: row.badge ?? undefined,
    featured: row.featured,
    hasBottomGradient: row.featured && row.badge === "Exclusive",
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
