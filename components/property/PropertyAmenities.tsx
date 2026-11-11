import { translateAmenity, type Dictionary } from "@/i18n";

interface PropertyAmenitiesProps {
  amenities: string[];
  dict: Dictionary;
}

export function PropertyAmenities({ amenities, dict }: PropertyAmenitiesProps) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
      <h2 className="text-lg font-semibold mb-6 text-nordic">
        {dict.property.amenities.title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
        {amenities.map((amenity) => (
          <div key={amenity} className="flex items-center gap-3 text-nordic/70">
            <span className="material-icons text-mosque/60 text-sm">
              check_circle
            </span>
            <span>{translateAmenity(dict, amenity)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
