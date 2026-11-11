"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  FILTER_AMENITIES,
  type PropertyCategory,
} from "@/data/properties";
import {
  buildHomeHref,
  countActiveModalFilters,
  type HomeQuery,
} from "@/lib/home-query";
import type { FilterablePropertySummary } from "@/lib/properties";
import {
  formatMessage,
  translateAmenity,
  translateCategory,
  type Dictionary,
} from "@/i18n";

interface FiltersModalProps {
  query: HomeQuery;
  properties: FilterablePropertySummary[];
  dict: Dictionary;
}

const SLIDER_MIN = 0;
const SLIDER_MAX = 7_000_000;
const SLIDER_STEP = 50_000;

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function formatCompactPrice(value: number, isMaxBound = false): string {
  if (isMaxBound && value >= SLIDER_MAX) {
    return `$${(SLIDER_MAX / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`;
  }
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$${millions.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}k`;
  }
  return `$${value}`;
}

function parseCurrencyInput(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

export function FiltersModal({ query, properties, dict }: FiltersModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [location, setLocation] = useState(query.q);
  const [minPrice, setMinPrice] = useState<number>(
    query.minPrice ?? SLIDER_MIN
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    query.maxPrice ?? SLIDER_MAX
  );
  const [minPriceText, setMinPriceText] = useState<string>(
    numberFormatter.format(query.minPrice ?? SLIDER_MIN)
  );
  const [maxPriceText, setMaxPriceText] = useState<string>(
    numberFormatter.format(query.maxPrice ?? SLIDER_MAX)
  );
  const [category, setCategory] = useState<PropertyCategory>(query.category);
  const [beds, setBeds] = useState<number>(query.beds ?? 0);
  const [baths, setBaths] = useState<number>(query.baths ?? 0);
  const [amenities, setAmenities] = useState<string[]>(query.amenities);

  const trackRef = useRef<HTMLDivElement>(null);
  const draggingHandle = useRef<"min" | "max" | null>(null);

  const openModal = () => {
    const initialMin = query.minPrice ?? SLIDER_MIN;
    const initialMax = query.maxPrice ?? SLIDER_MAX;
    setLocation(query.q);
    setMinPrice(initialMin);
    setMaxPrice(initialMax);
    setMinPriceText(numberFormatter.format(initialMin));
    setMaxPriceText(numberFormatter.format(initialMax));
    setCategory(query.category);
    setBeds(query.beds ?? 0);
    setBaths(query.baths ?? 0);
    setAmenities(query.amenities);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingHandle.current || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width)
      );
      const rawValue =
        Math.round((ratio * (SLIDER_MAX - SLIDER_MIN)) / SLIDER_STEP) *
        SLIDER_STEP;

      if (draggingHandle.current === "min") {
        const clamped = Math.min(rawValue, maxPrice - SLIDER_STEP);
        const safeMin = Math.max(SLIDER_MIN, clamped);
        setMinPrice(safeMin);
        setMinPriceText(numberFormatter.format(safeMin));
      } else {
        const clamped = Math.max(rawValue, minPrice + SLIDER_STEP);
        const safeMax = Math.min(SLIDER_MAX, clamped);
        setMaxPrice(safeMax);
        setMaxPriceText(numberFormatter.format(safeMax));
      }
    };

    const handlePointerUp = () => {
      draggingHandle.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isOpen, minPrice, maxPrice]);

  const matchingCount = useMemo(() => {
    const term = location
      .replace(/[%_\\,()*]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    return properties.filter((prop) => {
      if (category !== "All" && prop.category !== category) {
        return false;
      }
      if (query.market !== "all") {
        const expectedType = query.market === "buy" ? "sale" : "rent";
        if (prop.listingType !== expectedType) return false;
      }
      if (term) {
        const matchesTitle = prop.title.toLowerCase().includes(term);
        const matchesLocation = prop.location.toLowerCase().includes(term);
        if (!matchesTitle && !matchesLocation) return false;
      }
      if (minPrice > SLIDER_MIN && prop.price < minPrice) {
        return false;
      }
      if (maxPrice < SLIDER_MAX && prop.price > maxPrice) {
        return false;
      }
      if (beds > 0 && prop.beds < beds) {
        return false;
      }
      if (baths > 0 && prop.baths < baths) {
        return false;
      }
      if (amenities.length > 0) {
        const hasAll = amenities.every((amenity) =>
          prop.amenities.includes(amenity)
        );
        if (!hasAll) return false;
      }
      return true;
    }).length;
  }, [
    properties,
    category,
    query.market,
    location,
    minPrice,
    maxPrice,
    beds,
    baths,
    amenities,
  ]);

  const toggleAmenity = (label: string) => {
    setAmenities((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleClearAll = () => {
    setLocation("");
    setMinPrice(SLIDER_MIN);
    setMaxPrice(SLIDER_MAX);
    setMinPriceText(numberFormatter.format(SLIDER_MIN));
    setMaxPriceText(numberFormatter.format(SLIDER_MAX));
    setCategory("All");
    setBeds(0);
    setBaths(0);
    setAmenities([]);
  };

  const handleApply = () => {
    const href = buildHomeHref({
      market: query.market,
      q: location.trim(),
      category,
      minPrice: minPrice > SLIDER_MIN ? minPrice : undefined,
      maxPrice: maxPrice < SLIDER_MAX ? maxPrice : undefined,
      beds: beds > 0 ? beds : undefined,
      baths: baths > 0 ? baths : undefined,
      amenities,
      page: 1,
    });
    setIsOpen(false);
    router.push(href);
  };

  const minPercent = Math.min(
    100,
    Math.max(0, ((minPrice - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100)
  );
  const maxPercent = Math.min(
    100,
    Math.max(
      minPercent,
      ((maxPrice - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100
    )
  );

  const activeFilterCount = countActiveModalFilters(query);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full text-nordic-dark font-medium text-sm hover:bg-black/5 transition-colors cursor-pointer"
      >
        <span className="material-icons text-base">tune</span>
        <span>{dict.filters.buttonLabel}</span>
        {activeFilterCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-semibold rounded-full bg-mosque text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-display text-gray-800 text-left">
            {/* Modal Overlay */}
            <div
              aria-hidden="true"
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-10 transition-opacity"
            />

            {/* Main Modal Container */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="filters-modal-title"
              className="relative z-20 w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-30">
                <h2
                  id="filters-modal-title"
                  className="text-2xl font-semibold tracking-tight text-gray-900"
                >
                  {dict.filters.modalTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={dict.filters.closeAriaLabel}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <span className="material-icons">close</span>
                </button>
              </header>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto hide-scroll p-8 space-y-10">
                {/* Section 1: Location */}
                <section>
                  <label
                    htmlFor="filters-location-input"
                    className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
                  >
                    {dict.filters.locationLabel}
                  </label>
                  <div className="relative group">
                    <span className="material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-mosque transition-colors">
                      location_on
                    </span>
                    <input
                      id="filters-location-input"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={dict.filters.locationPlaceholder}
                      className="w-full pl-12 pr-4 py-3 bg-[#f5f8f6] border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-mosque focus:bg-white transition-all shadow-sm outline-none"
                    />
                  </div>
                </section>

                {/* Section 2: Price Range */}
                <section>
                  <div className="flex justify-between items-end mb-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {dict.filters.priceRangeLabel}
                    </label>
                    <span className="text-sm font-medium text-mosque">
                      {formatCompactPrice(minPrice)} –{" "}
                      {formatCompactPrice(maxPrice, true)}
                    </span>
                  </div>

                  <div className="relative h-12 flex items-center mb-6 px-2 select-none">
                    <div
                      ref={trackRef}
                      onClick={(e) => {
                        if (!trackRef.current) return;
                        const rect = trackRef.current.getBoundingClientRect();
                        const ratio = Math.min(
                          1,
                          Math.max(0, (e.clientX - rect.left) / rect.width)
                        );
                        const clickedValue =
                          Math.round(
                            (ratio * (SLIDER_MAX - SLIDER_MIN)) / SLIDER_STEP
                          ) * SLIDER_STEP;
                        const distToMin = Math.abs(clickedValue - minPrice);
                        const distToMax = Math.abs(clickedValue - maxPrice);
                        if (distToMin <= distToMax) {
                          const nextMin = Math.min(
                            clickedValue,
                            maxPrice - SLIDER_STEP
                          );
                          setMinPrice(nextMin);
                          setMinPriceText(numberFormatter.format(nextMin));
                        } else {
                          const nextMax = Math.max(
                            clickedValue,
                            minPrice + SLIDER_STEP
                          );
                          setMaxPrice(nextMax);
                          setMaxPriceText(numberFormatter.format(nextMax));
                        }
                      }}
                      className="relative w-full h-1 bg-gray-200 rounded-full cursor-pointer"
                    >
                      <div
                        className="absolute h-full bg-mosque rounded-full"
                        style={{
                          left: `${minPercent}%`,
                          width: `${Math.max(0, maxPercent - minPercent)}%`,
                        }}
                      />

                      {/* Min Handle */}
                      <button
                        type="button"
                        role="slider"
                        aria-label={dict.filters.minPriceSliderAriaLabel}
                        aria-valuemin={SLIDER_MIN}
                        aria-valuemax={maxPrice}
                        aria-valuenow={minPrice}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          draggingHandle.current = "min";
                        }}
                        style={{ left: `${minPercent}%` }}
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-mosque rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform -ml-3 z-10"
                      />

                      {/* Max Handle */}
                      <button
                        type="button"
                        role="slider"
                        aria-label={dict.filters.maxPriceSliderAriaLabel}
                        aria-valuemin={minPrice}
                        aria-valuemax={SLIDER_MAX}
                        aria-valuenow={maxPrice}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          draggingHandle.current = "max";
                        }}
                        style={{ left: `${maxPercent}%` }}
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-mosque rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform -ml-3 z-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f5f8f6] p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                      <label
                        htmlFor="filters-min-price"
                        className="block text-[10px] text-gray-500 uppercase font-medium mb-1"
                      >
                        {dict.filters.minPriceLabel}
                      </label>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">$</span>
                        <input
                          id="filters-min-price"
                          type="text"
                          inputMode="numeric"
                          value={minPriceText}
                          onChange={(e) => {
                            setMinPriceText(e.target.value);
                            const parsed = parseCurrencyInput(e.target.value);
                            setMinPrice(Math.min(parsed, maxPrice));
                          }}
                          onBlur={() => {
                            const clamped = Math.max(
                              SLIDER_MIN,
                              Math.min(minPrice, maxPrice)
                            );
                            setMinPrice(clamped);
                            setMinPriceText(numberFormatter.format(clamped));
                          }}
                          className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="bg-[#f5f8f6] p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                      <label
                        htmlFor="filters-max-price"
                        className="block text-[10px] text-gray-500 uppercase font-medium mb-1"
                      >
                        {dict.filters.maxPriceLabel}
                      </label>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">$</span>
                        <input
                          id="filters-max-price"
                          type="text"
                          inputMode="numeric"
                          value={maxPriceText}
                          onChange={(e) => {
                            setMaxPriceText(e.target.value);
                            const parsed = parseCurrencyInput(e.target.value);
                            setMaxPrice(parsed);
                          }}
                          onBlur={() => {
                            const clamped = Math.max(minPrice, maxPrice);
                            setMaxPrice(clamped);
                            setMaxPriceText(numberFormatter.format(clamped));
                          }}
                          className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3: Property Details */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Property Type */}
                  <div className="space-y-3">
                    <label
                      htmlFor="filters-property-type"
                      className="block text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {dict.filters.propertyTypeLabel}
                    </label>
                    <div className="relative">
                      <select
                        id="filters-property-type"
                        value={category}
                        onChange={(e) =>
                          setCategory(e.target.value as PropertyCategory)
                        }
                        className="w-full bg-[#f5f8f6] border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-mosque cursor-pointer outline-none"
                      >
                        <option value="All">{dict.filters.anyType}</option>
                        <option value="House">
                          {translateCategory(dict, "House")}
                        </option>
                        <option value="Apartment">
                          {translateCategory(dict, "Apartment")}
                        </option>
                        <option value="Villa">
                          {translateCategory(dict, "Villa")}
                        </option>
                        <option value="Penthouse">
                          {translateCategory(dict, "Penthouse")}
                        </option>
                      </select>
                      <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="space-y-4">
                    {/* Beds */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {dict.filters.bedroomsLabel}
                      </span>
                      <div className="flex items-center space-x-3 bg-[#f5f8f6] rounded-full p-1">
                        <button
                          type="button"
                          disabled={beds <= 0}
                          onClick={() => setBeds((prev) => Math.max(0, prev - 1))}
                          aria-label={dict.filters.decreaseBedsAriaLabel}
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <span className="material-icons text-base">
                            remove
                          </span>
                        </button>
                        <span className="text-sm font-semibold min-w-6 text-center px-1">
                          {beds > 0 ? `${beds}+` : dict.filters.any}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBeds((prev) => Math.min(6, prev + 1))}
                          aria-label={dict.filters.increaseBedsAriaLabel}
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors cursor-pointer"
                        >
                          <span className="material-icons text-base">add</span>
                        </button>
                      </div>
                    </div>

                    {/* Baths */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {dict.filters.bathroomsLabel}
                      </span>
                      <div className="flex items-center space-x-3 bg-[#f5f8f6] rounded-full p-1">
                        <button
                          type="button"
                          disabled={baths <= 0}
                          onClick={() =>
                            setBaths((prev) => Math.max(0, prev - 1))
                          }
                          aria-label={dict.filters.decreaseBathsAriaLabel}
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <span className="material-icons text-base">
                            remove
                          </span>
                        </button>
                        <span className="text-sm font-semibold min-w-6 text-center px-1">
                          {baths > 0 ? `${baths}+` : dict.filters.any}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setBaths((prev) => Math.min(6, prev + 1))
                          }
                          aria-label={dict.filters.increaseBathsAriaLabel}
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors cursor-pointer"
                        >
                          <span className="material-icons text-base">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 4: Amenities */}
                <section>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    {dict.filters.amenitiesSectionLabel}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {FILTER_AMENITIES.map((amenity) => {
                      const isSelected = amenities.includes(amenity.label);
                      return (
                        <label
                          key={amenity.label}
                          className="cursor-pointer group relative"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAmenity(amenity.label)}
                            className="peer sr-only"
                          />
                          <div
                            className={
                              isSelected
                                ? "h-full px-4 py-3 rounded-lg border border-mosque bg-mosque/5 text-mosque font-medium text-sm flex items-center justify-center gap-2 transition-all hover:bg-mosque/10"
                                : "h-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300"
                            }
                          >
                            <span
                              className={
                                isSelected
                                  ? "material-icons text-lg text-mosque"
                                  : "material-icons text-lg text-gray-400 group-hover:text-gray-500"
                              }
                            >
                              {amenity.icon}
                            </span>
                            {translateAmenity(dict, amenity.label)}
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full opacity-100 transition-opacity" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <footer className="bg-white border-t border-gray-100 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors underline decoration-gray-300 underline-offset-4 cursor-pointer"
                >
                  {dict.filters.clearAll}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="bg-mosque hover:bg-mosque/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-mosque/30 transition-all hover:shadow-mosque/40 flex items-center gap-2 transform active:scale-95 cursor-pointer"
                >
                  {formatMessage(
                    matchingCount === 1
                      ? dict.filters.showOneHome
                      : dict.filters.showManyHomes,
                    { count: matchingCount }
                  )}
                  <span className="material-icons text-sm">arrow_forward</span>
                </button>
              </footer>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
