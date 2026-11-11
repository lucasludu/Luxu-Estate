import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/data/properties";
import { formatMessage, translateBadge, type Dictionary } from "@/i18n";

interface PropertyCardProps {
  property: Property;
  dict: Dictionary;
}

export function PropertyCard({ property, dict }: PropertyCardProps) {
  const isRent = property.listingType === "rent";
  const displayClasses = property.visibilityClass
    ? `${property.visibilityClass} flex-col`
    : "flex flex-col";
  const href = `/properties/${property.slug}`;
  const coverImage = property.images[0];
  const statusText = translateBadge(dict, property.statusLabel);

  return (
    <article
      className={`relative bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full ${displayClasses}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link
          href={href}
          prefetch={true}
          aria-label={formatMessage(dict.card.viewDetailsAriaLabel, {
            title: property.title,
          })}
          className="block w-full h-full relative"
        >
          <Image
            alt={coverImage.alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            data-alt={coverImage.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            src={coverImage.url}
          />
        </Link>
        <button
          type="button"
          aria-label={
            property.featured
              ? formatMessage(dict.card.featuredAriaLabel, {
                  title: property.title,
                })
              : formatMessage(dict.card.saveAriaLabel, {
                  title: property.title,
                })
          }
          aria-pressed={Boolean(property.featured)}
          className={
            property.featured
              ? "absolute top-3 right-3 z-10 p-2 bg-mosque text-white rounded-full shadow-sm hover:bg-mosque/90 transition-colors flex items-center justify-center cursor-pointer"
              : "absolute top-3 right-3 z-10 p-2 bg-white/90 rounded-full hover:bg-mosque hover:text-white transition-colors text-nordic-dark flex items-center justify-center cursor-pointer"
          }
        >
          <span className="material-icons text-lg">
            {property.featured ? "favorite" : "favorite_border"}
          </span>
        </button>
        {statusText && (
          <div
            className={`pointer-events-none absolute bottom-3 left-3 ${
              isRent ? "bg-mosque/90" : "bg-nordic-dark/90"
            } text-white text-xs font-bold px-2 py-1 rounded`}
          >
            {statusText}
          </div>
        )}
      </div>

      <Link
        href={href}
        prefetch={true}
        className="p-4 flex flex-col flex-grow"
      >
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-bold text-lg text-nordic-dark">
            {property.priceFormatted}
            {property.isMonthly && (
              <span className="text-sm font-normal text-nordic-muted">
                {dict.card.perMonth}
              </span>
            )}
          </h3>
        </div>
        <h4 className="text-nordic-dark font-medium truncate mb-1 group-hover:text-mosque transition-colors">
          {property.title}
        </h4>
        <p className="text-nordic-muted text-xs mb-4">{property.location}</p>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">
              king_bed
            </span>{" "}
            {property.beds}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">
              bathtub
            </span>{" "}
            {property.baths}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">
              square_foot
            </span>{" "}
            {property.area}
          </div>
        </div>
      </Link>
    </article>
  );
}
