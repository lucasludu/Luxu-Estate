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
    visibilityClass: "hidden xl:flex",
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
    visibilityClass: "hidden lg:flex",
  },
];

export function getFeaturedProperties(): Property[] {
  return MOCK_PROPERTIES.filter((property) => property.featured);
}

export function getMarketProperties(): Property[] {
  return MOCK_PROPERTIES.filter((property) => !property.featured);
}

