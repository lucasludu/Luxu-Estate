"use client";

import { useState, useMemo } from "react";
import {
  getFeaturedProperties,
  getMarketProperties,
  type PropertyCategory,
} from "@/data/properties";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSearch } from "./HeroSearch";
import { FeaturedCollections } from "./FeaturedCollections";
import { NewInMarket, type MarketFilter } from "./NewInMarket";

export function HomeScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<PropertyCategory>("All");
  const [selectedMarketFilter, setSelectedMarketFilter] =
    useState<MarketFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredProperties = useMemo(() => {
    const base = getFeaturedProperties();
    return base.filter((property) => {
      const matchesCategory =
        selectedCategory === "All" || property.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const marketProperties = useMemo(() => {
    const base = getMarketProperties();
    const isFiltering =
      selectedCategory !== "All" ||
      selectedMarketFilter !== "all" ||
      Boolean(searchQuery.trim());

    return base
      .filter((property) => {
        const matchesCategory =
          selectedCategory === "All" || property.category === selectedCategory;
        const matchesMarket =
          selectedMarketFilter === "all" ||
          (selectedMarketFilter === "buy" && property.listingType === "sale") ||
          (selectedMarketFilter === "rent" && property.listingType === "rent");
        const matchesSearch =
          !searchQuery.trim() ||
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesMarket && matchesSearch;
      })
      .map((property) =>
        isFiltering ? { ...property, visibilityClass: undefined } : property
      );
  }, [selectedCategory, selectedMarketFilter, searchQuery]);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <HeroSearch
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <FeaturedCollections properties={featuredProperties} />
        <NewInMarket
          properties={marketProperties}
          selectedFilter={selectedMarketFilter}
          onSelectFilter={setSelectedMarketFilter}
        />
      </main>
    </>
  );
}

