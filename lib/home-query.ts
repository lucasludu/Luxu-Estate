import {
  PROPERTY_CATEGORIES,
  type PropertyCategory,
} from "@/data/properties";
import type { MarketFilter, PropertyFilters } from "@/lib/properties";

type RawSearchParams = Record<string, string | string[] | undefined>;

export interface HomeQuery extends PropertyFilters {
  page: number;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseHomeQuery(params: RawSearchParams): HomeQuery {
  const categoryParam = first(params.category);
  const category =
    PROPERTY_CATEGORIES.find((c) => c === categoryParam) ?? "All";

  const typeParam = first(params.type);
  const market: MarketFilter =
    typeParam === "buy" || typeParam === "rent" ? typeParam : "all";

  const q = (first(params.q) ?? "").slice(0, 100).trim();

  const rawPage = Number.parseInt(first(params.page) ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  return { category: category as PropertyCategory, market, q, page };
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
  if (query.q) search.set("q", query.q);
  if (query.page && query.page > 1) search.set("page", String(query.page));
  const qs = search.toString();
  return qs ? `/?${qs}` : "/";
}

