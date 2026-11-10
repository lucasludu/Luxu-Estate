import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyFeatures } from "@/components/property/PropertyFeatures";
import { PropertyAbout } from "@/components/property/PropertyAbout";
import { PropertyAmenities } from "@/components/property/PropertyAmenities";
import { MortgageBanner } from "@/components/property/MortgageBanner";
import { PropertyAgentCard } from "@/components/property/PropertyAgentCard";
import { PropertyMap } from "@/components/property/PropertyMap";
import { getAllPropertySlugs, getPropertyBySlug } from "@/lib/properties";

export async function generateStaticParams() {
  return getAllPropertySlugs();
}

export async function generateMetadata({
  params,
}: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Property Not Found | LuxeEstate",
      description: "The requested luxury property could not be found.",
    };
  }

  const description =
    property.description[0] ??
    `${property.title} in ${property.location} — ${property.beds} beds, ${property.baths} baths, ${property.area}.`;

  return {
    title: `${property.title} — ${property.priceFormatted} | LuxeEstate`,
    description,
    openGraph: {
      title: `${property.title} — ${property.priceFormatted}`,
      description,
      images: property.images.map((img) => ({
        url: img.url,
        alt: img.alt,
      })),
    },
  };
}

async function PropertyDetailsContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description.join(" "),
    image: property.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.coordinates.lat,
      longitude: property.coordinates.lng,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 space-y-4">
            <PropertyGallery
              images={property.images}
              title={property.title}
              badge={property.badge}
              statusLabel={property.statusLabel}
            />
          </div>

          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              <PropertyAgentCard
                priceFormatted={property.priceFormatted}
                isMonthly={property.isMonthly}
                location={property.location}
                title={property.title}
                agent={property.agent}
              />
              <PropertyMap
                lat={property.coordinates.lat}
                lng={property.coordinates.lng}
                title={property.title}
                location={property.location}
              />
            </div>
          </div>

          <div className="lg:col-span-8 lg:row-start-2 lg:-mt-8 space-y-8">
            <PropertyFeatures
              areaValue={property.areaValue}
              beds={property.beds}
              baths={property.baths}
              garage={property.garage}
            />
            <PropertyAbout
              description={property.description}
              title={property.title}
              location={property.location}
            />
            <PropertyAmenities amenities={property.amenities} />
            <MortgageBanner
              price={property.price}
              isMonthly={property.isMonthly}
              estimatedMonthlyPayment={property.estimatedMonthlyPayment}
            />
          </div>
        </div>
      </main>
    </>
  );
}

export function PropertyDetailsSkeleton() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="aspect-[16/10] rounded-xl bg-white/80" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="flex-none w-48 aspect-[4/3] rounded-lg bg-white/80"
              />
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-80 rounded-xl bg-white/80" />
          <div className="aspect-[4/3] rounded-xl bg-white/80" />
        </div>
      </div>
    </main>
  );
}

export default function PropertyDetailsPage({
  params,
}: PageProps<"/properties/[slug]">) {
  return (
    <div className="min-h-screen flex flex-col bg-clear-day text-nordic selection:bg-mosque/20">
      <Navbar />
      <div className="flex-grow">
        <Suspense fallback={<PropertyDetailsSkeleton />}>
          <PropertyDetailsContent params={params} />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

