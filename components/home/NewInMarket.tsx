import type { Property } from "@/data/properties";
import { PropertyCard } from "./PropertyCard";

export type MarketFilter = "all" | "buy" | "rent";

interface NewInMarketProps {
  properties: Property[];
  selectedFilter: MarketFilter;
  onSelectFilter: (filter: MarketFilter) => void;
}

const MARKET_FILTERS: { label: string; value: MarketFilter }[] = [
  { label: "All", value: "all" },
  { label: "Buy", value: "buy" },
  { label: "Rent", value: "rent" },
];

export function NewInMarket({
  properties,
  selectedFilter,
  onSelectFilter,
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
            const isActive = selectedFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onSelectFilter(filter.value)}
                className={
                  isActive
                    ? "px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm cursor-pointer"
                    : "px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark cursor-pointer"
                }
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <button
          type="button"
          className="px-8 py-3 bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark font-medium rounded-lg transition-all hover:shadow-md cursor-pointer"
        >
          Load more properties
        </button>
      </div>
    </section>
  );
}

