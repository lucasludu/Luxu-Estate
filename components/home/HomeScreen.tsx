import { redirect } from "next/navigation";
import { HeroSearch } from "./HeroSearch";
import { FeaturedCollections } from "./FeaturedCollections";
import { NewInMarket } from "./NewInMarket";
import {
  buildHomeHref,
  hasActiveSearchFilters,
  parseHomeQuery,
} from "@/lib/home-query";
import {
  getFeaturedProperties,
  getFilterablePropertySummaries,
  getMarketProperties,
} from "@/lib/properties";

interface HomeScreenProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function HomeScreen({ searchParams }: HomeScreenProps) {
  const query = parseHomeQuery(await searchParams);
  const isFiltered = hasActiveSearchFilters(query);

  const [featured, market, summaries] = await Promise.all([
    isFiltered ? Promise.resolve([]) : getFeaturedProperties(),
    getMarketProperties(query, query.page),
    getFilterablePropertySummaries(),
  ]);

  if (query.page > market.totalPages) {
    redirect(buildHomeHref({ ...query, page: market.totalPages }));
  }

  return (
    <>
      <HeroSearch query={query} properties={summaries} />
      {!isFiltered && <FeaturedCollections properties={featured} />}
      <NewInMarket
        properties={market.items}
        query={query}
        totalPages={market.totalPages}
      />
    </>
  );
}

export function HomeSkeleton() {
  return (
    <div className="animate-pulse pt-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="bg-white rounded-xl h-80" />
        ))}
      </div>
    </div>
  );
}
