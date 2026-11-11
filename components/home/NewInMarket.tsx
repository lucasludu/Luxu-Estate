import Link from "next/link";
import type { Property } from "@/data/properties";
import { buildHomeHref, type HomeQuery } from "@/lib/home-query";
import type { MarketFilter } from "@/lib/properties";
import { PropertyCard } from "./PropertyCard";
import { Pagination } from "./Pagination";

interface NewInMarketProps {
  properties: Property[];
  query: HomeQuery;
  totalPages: number;
}

const MARKET_FILTERS: { label: string; value: MarketFilter }[] = [
  { label: "All", value: "all" },
  { label: "Buy", value: "buy" },
  { label: "Rent", value: "rent" },
];

const POPULAR_LOCATIONS = [
  "San Francisco",
  "Miami",
  "New York",
  "Beverly Hills",
  "Aspen",
];

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}k`;
  }
  return `$${value}`;
}

function buildFilterChips(query: HomeQuery): { label: string; href: string }[] {
  const chips: { label: string; href: string }[] = [];

  if (query.q) {
    chips.push({
      label: `“${query.q}”`,
      href: buildHomeHref({ ...query, q: "", page: 1 }),
    });
  }
  if (query.category !== "All") {
    chips.push({
      label: query.category,
      href: buildHomeHref({ ...query, category: "All", page: 1 }),
    });
  }
  if (query.market !== "all") {
    chips.push({
      label: query.market === "buy" ? "For Sale" : "For Rent",
      href: buildHomeHref({ ...query, market: "all", page: 1 }),
    });
  }
  if (query.minPrice || query.maxPrice) {
    const minLabel = query.minPrice
      ? formatCompactCurrency(query.minPrice)
      : "$0";
    const maxLabel = query.maxPrice
      ? formatCompactCurrency(query.maxPrice)
      : "Any";
    chips.push({
      label: `${minLabel} – ${maxLabel}`,
      href: buildHomeHref({
        ...query,
        minPrice: undefined,
        maxPrice: undefined,
        page: 1,
      }),
    });
  }
  if (query.beds && query.beds > 0) {
    chips.push({
      label: `${query.beds}+ Beds`,
      href: buildHomeHref({ ...query, beds: undefined, page: 1 }),
    });
  }
  if (query.baths && query.baths > 0) {
    chips.push({
      label: `${query.baths}+ Baths`,
      href: buildHomeHref({ ...query, baths: undefined, page: 1 }),
    });
  }
  for (const amenity of query.amenities) {
    chips.push({
      label: amenity,
      href: buildHomeHref({
        ...query,
        amenities: query.amenities.filter((a) => a !== amenity),
        page: 1,
      }),
    });
  }

  return chips;
}

export function NewInMarket({
  properties,
  query,
  totalPages,
}: NewInMarketProps) {
  const activeChips = properties.length === 0 ? buildFilterChips(query) : [];

  return (
    <section>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">
            New in Market
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            Fresh opportunities added this week.
          </p>
        </div>

        <div className="hidden md:flex bg-white p-1 rounded-lg">
          {MARKET_FILTERS.map((filter) => {
            const isActive = query.market === filter.value;
            return (
              <Link
                key={filter.value}
                href={buildHomeHref({ ...query, market: filter.value, page: 1 })}
                aria-current={isActive ? "true" : undefined}
                className={
                  isActive
                    ? "px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm cursor-pointer"
                    : "px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark cursor-pointer"
                }
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-nordic-dark/5 shadow-soft px-6 py-14 sm:px-12 max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-hint-of-green/60 ring-8 ring-clear-day flex items-center justify-center text-mosque">
            <span className="material-icons text-3xl">travel_explore</span>
          </div>

          <h3 className="text-2xl font-light text-nordic-dark mb-2">
            {query.q
              ? `No properties found for “${query.q}”`
              : "No matching sanctuaries found"}
          </h3>
          <p className="text-sm text-nordic-muted max-w-md mx-auto leading-relaxed">
            We couldn&apos;t find any properties matching your current filters.
            Try removing a filter below or exploring another destination.
          </p>

          {activeChips.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {activeChips.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  title={`Remove ${chip.label} filter`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-clear-day text-nordic-dark text-xs font-medium border border-nordic-dark/10 hover:border-mosque hover:text-mosque transition-colors"
                >
                  <span>{chip.label}</span>
                  <span className="material-icons text-sm leading-none">
                    close
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-mosque hover:bg-mosque/90 text-white text-sm font-medium shadow-lg shadow-mosque/20 transition-all hover:-translate-y-0.5"
            >
              <span className="material-icons text-base">restart_alt</span>
              Clear all filters
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-nordic-dark/5">
            <p className="text-xs uppercase tracking-wider text-nordic-muted font-medium mb-3">
              Popular Destinations
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {POPULAR_LOCATIONS.map((city) => (
                <Link
                  key={city}
                  href={buildHomeHref({ q: city })}
                  className="px-3.5 py-1.5 rounded-full bg-clear-day/70 hover:bg-hint-of-green/50 text-nordic-dark text-xs font-medium transition-colors"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      <Pagination query={query} totalPages={totalPages} />
    </section>
  );
}
