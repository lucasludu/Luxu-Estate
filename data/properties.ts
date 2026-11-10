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
  image: string;
  imageAlt: string;
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

export const USER_PROFILE = {
  name: "Alex Morgan",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA",
};
