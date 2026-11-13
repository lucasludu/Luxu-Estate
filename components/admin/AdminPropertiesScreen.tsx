import Image from "next/image";
import Link from "next/link";
import { PROPERTY_CATEGORIES, type PropertyCategory } from "@/data/properties";
import {
  formatMessage,
  translateBadge,
  translateCategory,
} from "@/i18n";
import { getServerI18n } from "@/i18n/server";
import { getAdminPropertiesDashboard } from "@/lib/admin";
import { requireAdminUser } from "@/lib/auth";
import { parseHomeQuery } from "@/lib/home-query";
import { PAGE_SIZE, type MarketFilter } from "@/lib/properties";
import { PropertyRowActions } from "./PropertyRowActions";
import { AddPropertyButton } from "./AddPropertyButton";

type RawSearchParams = Record<string, string | string[] | undefined>;

function buildAdminPropertiesHref(params: {
  category?: PropertyCategory;
  market?: MarketFilter;
  q?: string;
  page?: number;
}) {
  const search = new URLSearchParams();
  if (params.category && params.category !== "All") {
    search.set("category", params.category);
  }
  if (params.market && params.market !== "all") {
    search.set("type", params.market);
  }
  if (params.q && params.q.trim()) {
    search.set("q", params.q.trim());
  }
  if (params.page && params.page > 1) {
    search.set("page", String(params.page));
  }
  const qs = search.toString();
  return qs ? `/admin/properties?${qs}` : "/admin/properties";
}

export function AdminPropertiesSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-nordic-dark/10" />
          <div className="h-4 w-80 rounded bg-nordic-dark/10" />
        </div>
        <div className="h-10 w-64 rounded-lg bg-nordic-dark/10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-nordic-dark/10 h-24"
          />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-nordic-dark/10 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 border-b border-gray-100 px-6 py-5 flex items-center gap-4"
          >
            <div className="h-20 w-28 rounded-lg bg-nordic-dark/10 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 rounded bg-nordic-dark/10" />
              <div className="h-4 w-36 rounded bg-nordic-dark/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function AdminPropertiesScreen({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const [resolvedParams, { dict }] = await Promise.all([
    searchParams,
    getServerI18n(),
    requireAdminUser("/admin/properties"),
  ]);

  const query = parseHomeQuery(resolvedParams);
  const dashboard = await getAdminPropertiesDashboard(
    {
      category: query.category,
      market: query.market,
      q: query.q,
    },
    query.page
  );

  const fromIndex =
    dashboard.total === 0 ? 0 : (dashboard.page - 1) * PAGE_SIZE + 1;
  const toIndex = Math.min(dashboard.page * PAGE_SIZE, dashboard.total);

  const marketOptions: { value: MarketFilter; label: string }[] = [
    { value: "all", label: dict.market.filterAll },
    { value: "buy", label: dict.market.filterBuy },
    { value: "rent", label: dict.market.filterRent },
  ];

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-nordic-dark tracking-tight">
            {dict.admin.properties.title}
          </h1>
          <p className="text-nordic-muted mt-1 text-sm sm:text-base">
            {dict.admin.properties.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form
            action="/admin/properties"
            method="GET"
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            {query.category !== "All" && (
              <input type="hidden" name="category" value={query.category} />
            )}
            {query.market !== "all" && (
              <input type="hidden" name="type" value={query.market} />
            )}
            <div className="relative w-full sm:w-72">
              <span className="material-icons text-nordic-dark/40 absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                search
              </span>
              <input
                type="search"
                name="q"
                defaultValue={query.q}
                placeholder={dict.admin.properties.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white border border-nordic-dark/15 text-sm text-nordic-dark placeholder:text-nordic-dark/40 focus:outline-none focus:ring-2 focus:ring-mosque shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2.5 border border-nordic-dark/15 hover:border-mosque text-sm font-medium rounded-lg text-nordic-dark hover:text-mosque bg-white hover:bg-hint-of-green/20 shadow-xs transition-colors whitespace-nowrap cursor-pointer gap-1.5"
            >
              <span className="material-icons text-base">search</span>
              <span>{dict.hero.searchButton}</span>
            </button>
          </form>

          <AddPropertyButton
            labels={{
              buttonLabel: dict.admin.properties.addProperty,
              modalTitle: dict.admin.properties.createPropertyModalTitle,
              fieldTitle: dict.admin.properties.fieldTitle,
              fieldLocation: dict.admin.properties.fieldLocation,
              fieldPrice: dict.admin.properties.fieldPrice,
              fieldCategory: dict.admin.properties.fieldCategory,
              fieldListingType: dict.admin.properties.fieldListingType,
              fieldBeds: dict.admin.properties.fieldBeds,
              fieldBaths: dict.admin.properties.fieldBaths,
              fieldArea: dict.admin.properties.fieldArea,
              fieldGarage: dict.admin.properties.fieldGarage,
              fieldBadge: dict.admin.properties.fieldBadge,
              fieldFeatured: dict.admin.properties.fieldFeatured,
              statusActiveSale: dict.admin.properties.statusActiveSale,
              statusActiveRent: dict.admin.properties.statusActiveRent,
              cancel: dict.admin.properties.cancel,
              saveChanges: dict.admin.properties.saveChanges,
              creating: dict.admin.properties.creating,
              success: dict.admin.properties.createPropertySuccess,
              stepBasic: dict.admin.properties.stepBasic,
              stepFeatures: dict.admin.properties.stepFeatures,
              stepImages: dict.admin.properties.stepImages,
              stepIndicator: dict.admin.properties.stepIndicator,
              nextStep: dict.admin.properties.nextStep,
              prevStep: dict.admin.properties.prevStep,
              addImage: dict.admin.properties.addImage,
              imageUrlLabel: dict.admin.properties.imageUrlLabel,
              imageAltLabel: dict.admin.properties.imageAltLabel,
              coverPhoto: dict.admin.properties.coverPhoto,
              setAsCover: dict.admin.properties.setAsCover,
              removeImage: dict.admin.properties.removeImage,
              usePresetImages: dict.admin.properties.usePresetImages,
              noImagesAdded: dict.admin.properties.noImagesAdded,
              imagesCount: dict.admin.properties.imagesCount,
              fieldAmenities: dict.admin.properties.fieldAmenities,
            }}
            categoryLabels={{
              House: dict.categories.House,
              Apartment: dict.categories.Apartment,
              Villa: dict.categories.Villa,
              Penthouse: dict.categories.Penthouse,
            }}
            amenityLabels={dict.amenities}
          />
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-nordic-muted">
              {dict.admin.properties.totalListings}
            </p>
            <p className="text-2xl font-bold text-nordic-dark mt-1">
              {dashboard.stats.totalListings}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-mosque/10 flex items-center justify-center text-mosque">
            <span className="material-icons">apartment</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-nordic-muted">
              {dict.admin.properties.activeForSale}
            </p>
            <p className="text-2xl font-bold text-nordic-dark mt-1">
              {dashboard.stats.activeSaleCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-hint-of-green flex items-center justify-center text-mosque">
            <span className="material-icons">check_circle</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-nordic-muted">
              {dict.admin.properties.activeForRent}
            </p>
            <p className="text-2xl font-bold text-nordic-dark mt-1">
              {dashboard.stats.activeRentCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-mosque/10 flex items-center justify-center text-mosque">
            <span className="material-icons">vpn_key</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-nordic-muted">
              {dict.admin.properties.featuredListings}
            </p>
            <p className="text-2xl font-bold text-nordic-dark mt-1">
              {dashboard.stats.featuredCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-hint-of-green flex items-center justify-center text-mosque">
            <span className="material-icons">workspace_premium</span>
          </div>
        </div>
      </div>

      {/* Filter Bar (Categories & Market Type) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-1">
          {PROPERTY_CATEGORIES.map((cat) => {
            const active = query.category === cat;
            return (
              <Link
                key={cat}
                href={buildAdminPropertiesHref({
                  category: cat,
                  market: query.market,
                  q: query.q,
                  page: 1,
                })}
                className={
                  active
                    ? "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-mosque text-white shadow-sm whitespace-nowrap transition-colors"
                    : "px-3.5 py-1.5 rounded-full text-xs font-medium bg-white text-nordic-dark/70 hover:text-nordic-dark border border-nordic-dark/10 whitespace-nowrap transition-colors"
                }
              >
                {translateCategory(dict, cat)}
              </Link>
            );
          })}
        </div>

        <div className="inline-flex items-center bg-white p-1 rounded-lg border border-nordic-dark/10 self-start sm:self-auto">
          {marketOptions.map((option) => {
            const active = query.market === option.value;
            return (
              <Link
                key={option.value}
                href={buildAdminPropertiesHref({
                  category: query.category,
                  market: option.value,
                  q: query.q,
                  page: 1,
                })}
                className={
                  active
                    ? "px-3 py-1 rounded-md text-xs font-semibold bg-hint-of-green text-mosque transition-colors"
                    : "px-3 py-1 rounded-md text-xs font-medium text-nordic-muted hover:text-nordic-dark transition-colors"
                }
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Property List Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/60 border-b border-gray-100 text-xs font-semibold text-nordic-muted uppercase tracking-wider">
          <div className="col-span-6">
            {dict.admin.properties.tablePropertyDetails}
          </div>
          <div className="col-span-2">{dict.admin.properties.tablePrice}</div>
          <div className="col-span-2">{dict.admin.properties.tableStatus}</div>
          <div className="col-span-2 text-right">
            {dict.admin.properties.tableActions}
          </div>
        </div>

        {dashboard.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="material-icons text-4xl text-nordic-dark/25 mb-2">
              domain_disabled
            </span>
            <p className="text-base font-medium text-nordic-dark">
              {dict.admin.properties.noPropertiesFound}
            </p>
            {(query.q || query.category !== "All" || query.market !== "all") && (
              <Link
                href="/admin/properties"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-mosque text-white hover:bg-primary-dark transition-colors"
              >
                <span className="material-icons text-sm">restart_alt</span>
                <span>{dict.market.clearAllFilters}</span>
              </Link>
            )}
          </div>
        ) : (
          dashboard.items.map((property) => {
            const coverImage = property.images[0] ?? {
              url: "/placeholder.jpg",
              alt: property.title,
            };
            const isRent = property.listingType === "rent";
            const badgeText = translateBadge(dict, property.badge);

            return (
              <div
                key={property.id}
                className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0 hover:bg-background-light/60 transition-colors items-center"
              >
                {/* Property Details */}
                <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                  <Link
                    href={`/properties/${property.slug}`}
                    className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 block"
                  >
                    <Image
                      src={coverImage.url}
                      alt={coverImage.alt}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/properties/${property.slug}`}
                        className="text-base sm:text-lg font-bold text-nordic-dark group-hover:text-mosque transition-colors truncate"
                      >
                        {property.title}
                      </Link>
                      {badgeText && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-nordic-dark/5 text-nordic-dark">
                          {badgeText}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-nordic-muted truncate">
                      {property.location}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-nordic-muted/80 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-[14px]">bed</span>
                        {property.beds} {dict.card.beds}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-[14px]">
                          bathtub
                        </span>
                        {property.baths} {dict.card.baths}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{property.area}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="font-medium text-nordic-dark/70">
                        {translateCategory(dict, property.category)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-6 md:col-span-2">
                  <div className="text-base font-semibold text-nordic-dark">
                    {property.priceFormatted}
                    {property.isMonthly && (
                      <span className="text-xs font-normal text-nordic-muted">
                        {dict.card.perMonth}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-nordic-muted mt-0.5">
                    {formatMessage(
                      isRent
                        ? dict.admin.properties.monthlyRent
                        : dict.admin.properties.monthlyEst,
                      { amount: property.estimatedMonthlyPayment }
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-6 md:col-span-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className={
                      isRent
                        ? "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-mosque/10 text-mosque border border-mosque/15"
                        : "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-hint-of-green text-mosque border border-mosque/15"
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-mosque mr-1.5" />
                    {isRent
                      ? dict.admin.properties.statusActiveRent
                      : dict.admin.properties.statusActiveSale}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-12 md:col-span-2 flex items-center justify-end">
                  <PropertyRowActions
                    property={property}
                    labels={{
                      viewProperty: dict.admin.properties.viewProperty,
                      editProperty: dict.admin.properties.editProperty,
                      deleteProperty: dict.admin.properties.deleteProperty,
                      confirmDeleteTitle: dict.admin.properties.confirmDeleteTitle,
                      confirmDeleteDescription:
                        dict.admin.properties.confirmDeleteDescription,
                      cancel: dict.admin.properties.cancel,
                      confirmDelete: dict.admin.properties.confirmDelete,
                      saveChanges: dict.admin.properties.saveChanges,
                      saving: dict.admin.properties.saving,
                      deleting: dict.admin.properties.deleting,
                      propertyUpdatedSuccess:
                        dict.admin.properties.propertyUpdatedSuccess,
                      propertyDeletedSuccess:
                        dict.admin.properties.propertyDeletedSuccess,
                      editModalTitle: dict.admin.properties.editModalTitle,
                      fieldTitle: dict.admin.properties.fieldTitle,
                      fieldLocation: dict.admin.properties.fieldLocation,
                      fieldPrice: dict.admin.properties.fieldPrice,
                      fieldCategory: dict.admin.properties.fieldCategory,
                      fieldListingType: dict.admin.properties.fieldListingType,
                      fieldBeds: dict.admin.properties.fieldBeds,
                      fieldBaths: dict.admin.properties.fieldBaths,
                      fieldArea: dict.admin.properties.fieldArea,
                      fieldGarage: dict.admin.properties.fieldGarage,
                      fieldBadge: dict.admin.properties.fieldBadge,
                      fieldFeatured: dict.admin.properties.fieldFeatured,
                      statusActiveSale: dict.admin.properties.statusActiveSale,
                      statusActiveRent: dict.admin.properties.statusActiveRent,
                    }}
                    categoryLabels={{
                      House: dict.categories.House,
                      Apartment: dict.categories.Apartment,
                      Villa: dict.categories.Villa,
                      Penthouse: dict.categories.Penthouse,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="text-sm text-nordic-muted">
            {formatMessage(dict.admin.properties.showingResults, {
              from: fromIndex,
              to: toIndex,
              total: dashboard.total,
            })}
          </div>
          <div className="flex items-center gap-2">
            {dashboard.page > 1 ? (
              <Link
                href={buildAdminPropertiesHref({
                  category: query.category,
                  market: query.market,
                  q: query.q,
                  page: dashboard.page - 1,
                })}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md text-nordic-dark bg-white hover:border-mosque hover:text-mosque transition-colors"
              >
                {dict.pagination.previous}
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-400 bg-gray-50 cursor-not-allowed">
                {dict.pagination.previous}
              </span>
            )}

            <span className="text-xs font-medium text-nordic-muted px-2">
              {dashboard.page} / {dashboard.totalPages}
            </span>

            {dashboard.page < dashboard.totalPages ? (
              <Link
                href={buildAdminPropertiesHref({
                  category: query.category,
                  market: query.market,
                  q: query.q,
                  page: dashboard.page + 1,
                })}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md text-nordic-dark bg-white hover:border-mosque hover:text-mosque transition-colors"
              >
                {dict.pagination.next}
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-400 bg-gray-50 cursor-not-allowed">
                {dict.pagination.next}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

