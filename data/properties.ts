export type PropertyCategory =
  | "All"
  | "House"
  | "Apartment"
  | "Villa"
  | "Penthouse";

export type ListingType = "sale" | "rent";

export interface PropertyImage {
  url: string;
  alt: string;
}

export interface PropertyAgent {
  name: string;
  role: string;
  avatar: string;
}

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
  areaValue: number;
  garage: number;
  yearBuilt?: number;
  images: PropertyImage[];
  category: Exclude<PropertyCategory, "All">;
  listingType: ListingType;
  statusLabel?: "FOR SALE" | "FOR RENT";
  badge?: string;
  featured?: boolean;
  hasBottomGradient?: boolean;
  visibilityClass?: string;
  description: string[];
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  agent: PropertyAgent;
  estimatedMonthlyPayment: string;
}

export const PROPERTY_CATEGORIES: PropertyCategory[] = [
  "All",
  "House",
  "Apartment",
  "Villa",
  "Penthouse",
];

export interface FilterAmenityOption {
  label: string;
  icon: string;
}

export const FILTER_AMENITIES: FilterAmenityOption[] = [
  { label: "Swimming Pool", icon: "pool" },
  { label: "Gym", icon: "fitness_center" },
  { label: "Parking", icon: "local_parking" },
  { label: "Air Conditioning", icon: "ac_unit" },
  { label: "High-speed Wifi", icon: "wifi" },
  { label: "Patio / Terrace", icon: "deck" },
];

export const USER_PROFILE = {
  name: "Alex Morgan",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA",
};
