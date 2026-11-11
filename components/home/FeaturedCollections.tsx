import type { Property } from "@/data/properties";
import type { Dictionary } from "@/i18n";
import { FeaturedPropertyCard } from "./FeaturedPropertyCard";

interface FeaturedCollectionsProps {
  properties: Property[];
  dict: Dictionary;
}

export function FeaturedCollections({
  properties,
  dict,
}: FeaturedCollectionsProps) {
  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">
            {dict.featured.title}
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            {dict.featured.subtitle}
          </p>
        </div>
        <a
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
          href="#"
        >
          {dict.featured.viewAll}{" "}
          <span className="material-icons text-sm">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {properties.map((property) => (
          <FeaturedPropertyCard
            key={property.id}
            property={property}
            dict={dict}
          />
        ))}
      </div>
    </section>
  );
}
