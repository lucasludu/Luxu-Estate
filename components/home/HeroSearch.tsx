import { PROPERTY_CATEGORIES } from "@/data/properties";
import { buildHomeHref, type HomeQuery } from "@/lib/home-query";
import type { FilterablePropertySummary } from "@/lib/properties";
import { CategoryPill } from "./CategoryPill";
import { FiltersModal } from "./FiltersModal";

interface HeroSearchProps {
  query: HomeQuery;
  properties: FilterablePropertySummary[];
}

export function HeroSearch({ query, properties }: HeroSearchProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-nordic-dark leading-tight">
          Find your{" "}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium">sanctuary</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/20 -rotate-1 z-0"></span>
          </span>
          .
        </h1>

        <form
          action="/"
          method="get"
          className="relative group max-w-2xl mx-auto"
        >
          {query.category !== "All" && (
            <input type="hidden" name="category" value={query.category} />
          )}
          {query.market !== "all" && (
            <input type="hidden" name="type" value={query.market} />
          )}
          {typeof query.minPrice === "number" && query.minPrice > 0 && (
            <input type="hidden" name="minPrice" value={query.minPrice} />
          )}
          {typeof query.maxPrice === "number" && query.maxPrice > 0 && (
            <input type="hidden" name="maxPrice" value={query.maxPrice} />
          )}
          {typeof query.beds === "number" && query.beds > 0 && (
            <input type="hidden" name="beds" value={query.beds} />
          )}
          {typeof query.baths === "number" && query.baths > 0 && (
            <input type="hidden" name="baths" value={query.baths} />
          )}
          {query.amenities.length > 0 && (
            <input
              type="hidden"
              name="amenities"
              value={query.amenities.join(",")}
            />
          )}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-icons text-nordic-muted text-2xl group-focus-within:text-mosque transition-colors">
              search
            </span>
          </div>
          <input
            key={query.q}
            type="text"
            name="q"
            defaultValue={query.q}
            placeholder="Search by city, neighborhood, or address..."
            className="block w-full pl-12 pr-28 py-4 rounded-xl border-none outline-none bg-white text-nordic-dark shadow-soft placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-lg"
          />
          <button
            type="submit"
            className="absolute inset-y-2 right-2 px-6 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20 cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          {PROPERTY_CATEGORIES.map((category) => (
            <CategoryPill
              key={category}
              category={category}
              active={query.category === category}
              href={buildHomeHref({ ...query, category, page: 1 })}
            />
          ))}
          <div className="w-px h-6 bg-nordic-dark/10 mx-2"></div>
          <FiltersModal query={query} properties={properties} />
        </div>
      </div>
    </section>
  );
}
