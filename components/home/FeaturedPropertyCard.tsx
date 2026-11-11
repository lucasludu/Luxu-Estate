import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/data/properties";
import { formatMessage, translateBadge, type Dictionary } from "@/i18n";

interface FeaturedPropertyCardProps {
  property: Property;
  dict: Dictionary;
}

export function FeaturedPropertyCard({
  property,
  dict,
}: FeaturedPropertyCardProps) {
  const href = `/properties/${property.slug}`;
  const coverImage = property.images[0];
  const badgeText = translateBadge(dict, property.badge);

  return (
    <div className="group relative rounded-xl overflow-hidden shadow-soft bg-white cursor-pointer">
      <div className="aspect-[4/3] w-full overflow-hidden relative">
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
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            data-alt={coverImage.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            src={coverImage.url}
          />
          {property.hasBottomGradient && (
            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
          )}
        </Link>
        {badgeText && (
          <div className="pointer-events-none absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-nordic-dark">
            {badgeText}
          </div>
        )}
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
              ? "absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-mosque text-white shadow-sm flex items-center justify-center hover:bg-mosque/90 transition-all cursor-pointer"
              : "absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-nordic-dark hover:bg-mosque hover:text-white transition-all cursor-pointer"
          }
        >
          <span className="material-icons text-xl">
            {property.featured ? "favorite" : "favorite_border"}
          </span>
        </button>
      </div>

      <Link href={href} prefetch={true} className="block p-6 relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-medium text-nordic-dark group-hover:text-mosque transition-colors">
              {property.title}
            </h3>
            <p className="text-nordic-muted text-sm flex items-center gap-1 mt-1">
              <span className="material-icons text-sm">place</span>{" "}
              {property.location}
            </p>
          </div>
          <span className="text-xl font-semibold text-mosque">
            {property.priceFormatted}
            {property.isMonthly && (
              <span className="text-sm font-normal text-nordic-muted">
                {dict.card.perMonth}
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-nordic-dark/5">
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">king_bed</span>{" "}
            {property.beds} {dict.card.beds}
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">bathtub</span>{" "}
            {property.baths} {dict.card.baths}
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">square_foot</span>{" "}
            {property.area}
          </div>
        </div>
      </Link>
    </div>
  );
}
