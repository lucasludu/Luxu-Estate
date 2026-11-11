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
import { getServerI18n } from "@/i18n/server";

interface HomeScreenProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function HomeScreen({ searchParams }: HomeScreenProps) {
  const [rawParams, { dict }] = await Promise.all([
    searchParams,
    getServerI18n(),
  ]);
  const query = parseHomeQuery(rawParams);
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
      <HeroSearch query={query} properties={summaries} dict={dict} />
      {!isFiltered && (
        <FeaturedCollections properties={featured} dict={dict} />
      )}
      <NewInMarket
        properties={market.items}
        query={query}
        totalPages={market.totalPages}
        dict={dict}
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
