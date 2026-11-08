export type PropertyCategory =
  | "All"
  | "House"
  | "Apartment"
  | "Villa"
  | "Penthouse";

export type ListingType = "sale" | "rent";

export interface Property {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: number;
  priceFormatted: string;
  isMonthly?: boolean;
  beds: number;
  baths: number;
  area: string;
  image: string;
  imageAlt: string;
  category: Exclude<PropertyCategory, "All">;
  listingType: ListingType;
  statusLabel?: "FOR SALE" | "FOR RENT";
  badge?: string;
  featured?: boolean;
  hasBottomGradient?: boolean;
  visibilityClass?: string;
}

export const PROPERTY_CATEGORIES: PropertyCategory[] = [
  "All",
  "House",
  "Apartment",
  "Villa",
  "Penthouse",
];

export const USER_PROFILE = {
  name: "Alex Morgan",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA",
};

export const MOCK_PROPERTIES: Property[] = [
  // Featured Collections
  {
    id: "prop-featured-1",
    slug: "the-glass-pavilion",
    title: "The Glass Pavilion",
    location: "Beverly Hills, California",
    price: 5250000,
    priceFormatted: "$5,250,000",
    beds: 5,
    baths: 4.5,
    area: "4,200 m²",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCra-FKp81t0_OM8bWD55m2o9OOSnR_v7D0UilyExMImxyIcr9tIMZ2Py3HcC0ra_MtSsBkduMcwxUNKI9_iSXFFr_YRON1SF9hNM3fcYy-uG7N7uusL0Z367WINi1V7_GwfNQx-gsbUqLtzVi4ivFyqFQGb4qBs79bALeSFb6i3_ZnJnI1VVrN-VeZYHjfYyQI5C6zy90N3uxWZpwzIBhNoUDKKQjQ8EOEYPoyPTzhnh6b6AS3dkkFJ8t4xSDC6qjhMrQUoUPnAeM",
    imageAlt: "Luxury modern villa exterior with pool",
    category: "Villa",
    listingType: "sale",
    statusLabel: "FOR SALE",
    badge: "Exclusive",
    featured: true,
    hasBottomGradient: true,
  },
  {
    id: "prop-featured-2",
    slug: "azure-heights-penthouse",
    title: "Azure Heights Penthouse",
    location: "Downtown, Vancouver",
    price: 3800000,
    priceFormatted: "$3,800,000",
    beds: 3,
    baths: 3,
    area: "2,100 m²",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDurAGHzg_fpQxFal-obkFVy1Q3WLPdueAQpz0itcQiRV-WfvulnBEDJbNeV8J06q4mX7PTtXYVJjX4-mHVr_khZLZxQ_s8f6fruGqzeqALyMu8wEHRK1EsOs9f4_jPmS7FxcdzrDkR88Wz0GjaPLXkTZRoJQfur59rxYRLi-WYcW-VU_gKS39CPLOMlftvqGvW0IOk5tXgst5mJ4WQM-ICN4vkdel9ido9YFUQga0OI10i6NSe5W4owt33-2YRi_b_ltdZW2QZC5s",
    imageAlt: "Modern interior living room with view",
    category: "Penthouse",
    listingType: "sale",
    statusLabel: "FOR SALE",
    badge: "New Arrival",
    featured: true,
    hasBottomGradient: false,
  },

  // New in Market
  {
    id: "prop-market-1",
    slug: "modern-family-home",
    title: "Modern Family Home",
    location: "123 Pine St, Seattle",
    price: 850000,
    priceFormatted: "$850,000",
    beds: 3,
    baths: 2,
    area: "120m²",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuQ9M7U6euA6_cXmYuXnej-N5IuawAW8ds-4G1mzfqmiBc13qXsPhf9_j_zTB8gfEunrBHo8xMsxYwCw_pl8fsxbxRkmyvLR1N9Tiye5ZJG7fwlLn9MwyBanXYhE0emGwp59es1FEyQTRQbmXLUKO74Yj34ZHqrqIkOtMKhP8CmRFvfoHT5LAe10105vUhKNkxIBvtt530nfLigSUTemOOcJMVNmsgactntRJUwOBU_TZzND7BYtDklr8uZcNYlQOK5U74-ufIf-E",
    imageAlt: "Modern white house facade",
    category: "House",
    listingType: "sale",
    statusLabel: "FOR SALE",
    featured: false,
  },
  {
    id: "prop-market-2",
    slug: "urban-loft",
    title: "Urban Loft",
    location: "456 Elm Ave, Portland",
    price: 3200,
    priceFormatted: "$3,200",
    isMonthly: true,
    beds: 1,
    baths: 1,
    area: "85m²",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4zNatD3vePhIZAi6OHHJKmamYSgeBNSKjEt32tvkkf4s6aBXCF8R4LNfDfPa9leA0t6N1OKOcP358WwZrnosbCBxSM7EaY2_P7qkx3MinRgmHQn7RvleNTwy8cLigMoR3iv0u83chBVbZYI6BcNMcqv80W-l1pIUgIWZcDIXEqtUatrsojSGfM0lTNDZpkBntBUkRY6NB4ZUymYNYvTHXKbO8NZ6N6uoyuuHqcaRWKzHCNXkOR3p-_EVFAHR8QwijIY_m1mefPZ4",
    imageAlt: "Stylish apartment living room",
    category: "Apartment",
    listingType: "rent",
    statusLabel: "FOR RENT",
    featured: false,
  },
  {
    id: "prop-market-3",
    slug: "highland-retreat",
    title: "Highland Retreat",
    location: "789 Mountain Rd, Bend",
    price: 620000,
    priceFormatted: "$620,000",
    beds: 2,
    baths: 2,
    area: "98m²",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARQWC19e7mleUpjb8CWLztEv_svJeRFOaC2i-9r9GctFuX5Barzhfai9wNM1WW8bcGlqdFM32d3KPf7SItom5ijdHOz5rGGQPeT7PlWs8-y9LkfcsHLQqsLxalhxP94XJo76_mAMp7T2dVj3hPKHNzTDLLiS6ujSdSsyo3onxQthp4ZkVE8op92gyTLUUucaGaxO8vJvyhH3HuWB07EPqT1WsW0lr9Of5lUPonjG9eiqE1XiJXTqzXUZQt5JorfPwCO1MioZA_Zro",
    imageAlt: "Cabin in the woods",
    category: "House",
    listingType: "sale",
    statusLabel: "FOR SALE",
    featured: false,
  },
  {
    id: "prop-market-4",
    slug: "sea-view-penthouse",
    title: "Sea View Penthouse",
    location: "321 Ocean Dr, Miami",
    price: 4500,
    priceFormatted: "$4,500",
    isMonthly: true,
    beds: 3,
    baths: 3,
    area: "180m²",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGq4Phm0uDzCnjHAsnWpYTBVpOds_M6iOsJuRQQA5eUZHkztGgtc7eh_OE6wBeyW1-iZh7yyhROnvvmqkAZ9tyAWFGXk0FG52zU4kZ_EDLA0U0cRszy7byNXTeWe0_hS53SYmtCTEV8Y1AM-WxiIC38UMa15QwFDjXtCGQOxoh35K0Ol_70vfsxm0VqDbaWkr8tcEbLTLy0NXH_GcpGK4lAXizgxYOIlFWGyau-4OIfPZRpjCBDbz_qu3VlN201UUJGiuM9ajVd-U",
    imageAlt: "Bright bedroom with large window",
    category: "Penthouse",
    listingType: "rent",
    statusLabel: "FOR RENT",
    featured: false,
  },
  {
    id: "prop-market-5",
    slug: "central-studio",
    title: "Central Studio",
    location: "555 Main St, Chicago",
    price: 550000,
    priceFormatted: "$550,000",
    beds: 1,
    baths: 1,
    area: "50m²",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1w-Hb1289NqZKon3VK8bpmMiCDYYiAMT5egzTINo9m9wSZRHv-k-1IGTVoL1NT8YeZXJHa87JPNDIPrtrbP7jChHq0ypXF90uByhC6VA9O788_B4FY8JVg4chbWN9bcrn9-9FvVvfZX8Aj60Iqg_C8CsCA9DEnJqi2rJvzmK5UP5z-9XRTRjBneAPCa8iGgGWBD9yYKsziN6vn0ePBDGo3inieQtmbr46W31p6UfQ649XRxTm7ygOY2J-jxW1r0qWs8i97KGpkTE",
    imageAlt: "Cozy apartment interior",
    category: "Apartment",
    listingType: "sale",
    statusLabel: "FOR SALE",
    featured: false,
  },
  {
    id: "prop-market-6",
    slug: "garden-villa",
    title: "Garden Villa",
    location: "999 Oak Ln, Austin",
    price: 2800,
    priceFormatted: "$2,800",
    isMonthly: true,
    beds: 2,
    baths: 2,
    area: "110m²",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfGXdY0g51ojSg0GMeTW9ndLY3mpKK3oMtWxo2nwd_dwi1pgn1Boi_ovaDGIFhUA7nwu3WdBch8ZuHxoHu3QfgM5ceAsp8pglRVyCROWNcy9zeDNP2wqLoevyKGcaEyFYHYpIx2KK46nLWthnHiHugmkKw48kJsL8IjMO1bL3T1Zwt8bvQDTTUHTgB3GqZ2RU2asRzF1jVg0rLw3LWXXTq0YF1CsbhlWpYOuCEpH5bB8zkBlbKXR4At_M46AL8rJqn5c6BrPD5PP8",
    imageAlt: "Modern minimalist home exterior",
    category: "Villa",
    listingType: "rent",
    statusLabel: "FOR RENT",
    featured: false,
  },
  {
    id: "prop-market-7",
    slug: "nordic-pine-villa",
    title: "Nordic Pine Villa",
    location: "412 Aspen Way, Aspen",
    price: 2450000,
    priceFormatted: "$2,450,000",
    beds: 4,
    baths: 3.5,
    area: "310m²",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Luxury modern villa with warm exterior lighting",
    category: "Villa",
    listingType: "sale",
    statusLabel: "FOR SALE",
    featured: false,
  },
  {
    id: "prop-market-8",
    slug: "minimalist-courtyard-house",
    title: "Minimalist Courtyard House",
    location: "88 Willow Creek, Scottsdale",
    price: 1350000,
    priceFormatted: "$1,350,000",
    beds: 4,
    baths: 3,
    area: "240m²",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Contemporary house exterior with manicured lawn",
    category: "House",
    listingType: "sale",
    statusLabel: "FOR SALE",
    featured: false,
  },
  {
    id: "prop-market-9",
    slug: "skyline-glass-penthouse",
    title: "Skyline Glass Penthouse",
    location: "740 Park Ave, New York",
    price: 8900,
    priceFormatted: "$8,900",
    isMonthly: true,
    beds: 3,
    baths: 3.5,
    area: "220m²",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Sunlit luxury penthouse interior with floor-to-ceiling windows",
    category: "Penthouse",
    listingType: "rent",
    statusLabel: "FOR RENT",
    featured: false,
  },
  {
    id: "prop-market-10",
    slug: "sunset-cliff-villa",
    title: "Sunset Cliff Villa",
    location: "210 Pacific Coast Hwy, Malibu",
    price: 4100000,
    priceFormatted: "$4,100,000",
    beds: 5,
    baths: 5,
    area: "390m²",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "White coastal villa with infinity pool",
    category: "Villa",
    listingType: "sale",
    statusLabel: "FOR SALE",
    featured: false,
  },
  {
    id: "prop-market-11",
    slug: "botanical-terrace-apartment",
    title: "Botanical Terrace Apartment",
    location: "19 Beacon St, Boston",
    price: 3600,
    priceFormatted: "$3,600",
    isMonthly: true,
    beds: 2,
    baths: 2,
    area: "105m²",
    image:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Bright open-plan apartment living and dining area",
    category: "Apartment",
    listingType: "rent",
    statusLabel: "FOR RENT",
    featured: false,
  },
  {
    id: "prop-market-12",
    slug: "cedar-ridge-residence",
    title: "Cedar Ridge Residence",
    location: "604 Lakeview Dr, Lake Tahoe",
    price: 1780000,
    priceFormatted: "$1,780,000",
    beds: 4,
    baths: 3,
    area: "265m²",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Modern timber and stone family residence",
    category: "House",
    listingType: "sale",
    statusLabel: "FOR SALE",
    featured: false,
  },
  {
    id: "prop-market-13",
    slug: "palm-oasis-villa",
    title: "Palm Oasis Villa",
    location: "1450 Desert Palm Rd, Palm Springs",
    price: 6200,
    priceFormatted: "$6,200",
    isMonthly: true,
    beds: 4,
    baths: 4,
    area: "280m²",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Mid-century modern desert villa with swimming pool",
    category: "Villa",
    listingType: "rent",
    statusLabel: "FOR RENT",
    featured: false,
  },
  {
    id: "prop-market-14",
    slug: "soho-atelier-loft",
    title: "SoHo Atelier Loft",
    location: "112 Mercer St, New York",
    price: 1490000,
    priceFormatted: "$1,490,000",
    beds: 2,
    baths: 2,
    area: "135m²",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Minimalist loft apartment with natural wood floors",
    category: "Apartment",
    listingType: "sale",
    statusLabel: "FOR SALE",
    featured: false,
  },
  {
    id: "prop-market-15",
    slug: "harbor-view-penthouse",
    title: "Harbor View Penthouse",
    location: "800 Embarcadero, San Francisco",
    price: 2950000,
    priceFormatted: "$2,950,000",
    beds: 3,
    baths: 2.5,
    area: "195m²",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Contemporary penthouse living room with panoramic windows",
    category: "Penthouse",
    listingType: "sale",
    statusLabel: "FOR SALE",
    featured: false,
  },
  {
    id: "prop-market-16",
    slug: "emerald-gables-house",
    title: "Emerald Gables House",
    location: "274 Peachtree Battle Ave, Atlanta",
    price: 4100,
    priceFormatted: "$4,100",
    isMonthly: true,
    beds: 3,
    baths: 2.5,
    area: "175m²",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Architectural two-story house with landscaped garden",
    category: "House",
    listingType: "rent",
    statusLabel: "FOR RENT",
    featured: false,
  },
];

export function getFeaturedProperties(): Property[] {
  return MOCK_PROPERTIES.filter((property) => property.featured);
}

export function getMarketProperties(): Property[] {
  return MOCK_PROPERTIES.filter((property) => !property.featured);
}

