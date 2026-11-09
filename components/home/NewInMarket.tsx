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

export function NewInMarket({
  properties,
  query,
  totalPages,
}: NewInMarketProps) {
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
        <p className="text-center text-nordic-muted py-16">
          No properties match your search.
        </p>
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
