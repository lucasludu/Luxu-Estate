import {
  FILTER_AMENITIES,
  PROPERTY_CATEGORIES,
  type PropertyCategory,
} from "@/data/properties";
import type { MarketFilter, PropertyFilters } from "@/lib/properties";

type RawSearchParams = Record<string, string | string[] | undefined>;

export interface HomeQuery extends PropertyFilters {
  amenities: string[];
  page: number;
}

const VALID_AMENITIES = new Set(FILTER_AMENITIES.map((a) => a.label));

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

function parseAmenitiesParam(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const rawList = Array.isArray(value) ? value : [value];
  const split = rawList.flatMap((item) => item.split(","));
  const unique = new Set<string>();
  for (const item of split) {
    const trimmed = item.trim();
    if (VALID_AMENITIES.has(trimmed)) {
      unique.add(trimmed);
    }
  }
  return Array.from(unique);
}

export function parseHomeQuery(params: RawSearchParams): HomeQuery {
  const categoryParam = first(params.category);
  const category =
    PROPERTY_CATEGORIES.find((c) => c === categoryParam) ?? "All";

  const typeParam = first(params.type);
  const market: MarketFilter =
    typeParam === "buy" || typeParam === "rent" ? typeParam : "all";

  const q = (first(params.q) ?? "").slice(0, 100).trim();

  const minPrice = parsePositiveNumber(first(params.minPrice));
  const maxPrice = parsePositiveNumber(first(params.maxPrice));
  const beds = parsePositiveNumber(first(params.beds));
  const baths = parsePositiveNumber(first(params.baths));
  const amenities = parseAmenitiesParam(params.amenities);

  const rawPage = Number.parseInt(first(params.page) ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  return {
    category: category as PropertyCategory,
    market,
    q,
    minPrice,
    maxPrice,
    beds,
    baths,
    amenities,
    page,
  };
}

/** Builds a "/" URL, omitting default values so URLs stay clean. */
export function buildHomeHref(query: Partial<HomeQuery>) {
  const search = new URLSearchParams();
  if (query.category && query.category !== "All") {
    search.set("category", query.category);
  }
  if (query.market && query.market !== "all") {
    search.set("type", query.market);
  }
  if (query.q && query.q.trim()) {
    search.set("q", query.q.trim());
  }
  if (typeof query.minPrice === "number" && query.minPrice > 0) {
    search.set("minPrice", String(Math.round(query.minPrice)));
  }
  if (typeof query.maxPrice === "number" && query.maxPrice > 0) {
    search.set("maxPrice", String(Math.round(query.maxPrice)));
  }
  if (typeof query.beds === "number" && query.beds > 0) {
    search.set("beds", String(query.beds));
  }
  if (typeof query.baths === "number" && query.baths > 0) {
    search.set("baths", String(query.baths));
  }
  if (query.amenities && query.amenities.length > 0) {
    search.set("amenities", query.amenities.join(","));
  }
  if (query.page && query.page > 1) {
    search.set("page", String(query.page));
  }
  const qs = search.toString();
  return qs ? `/?${qs}` : "/";
}

export function countActiveModalFilters(query: HomeQuery): number {
  let count = 0;
  if (query.q) count++;
  if (query.category !== "All") count++;
  if (typeof query.minPrice === "number" && query.minPrice > 0) count++;
  if (typeof query.maxPrice === "number" && query.maxPrice > 0) count++;
  if (typeof query.beds === "number" && query.beds > 0) count++;
  if (typeof query.baths === "number" && query.baths > 0) count++;
  if (query.amenities.length > 0) count += query.amenities.length;
  return count;
}

