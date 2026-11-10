"use client";

import dynamic from "next/dynamic";

const PropertyMapClient = dynamic(() => import("./PropertyMapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
      <div className="w-8 h-8 bg-mosque/40 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
        <span className="material-icons text-white text-sm">home</span>
      </div>
    </div>
  ),
});

interface PropertyMapProps {
  lat: number;
  lng: number;
  title: string;
  location: string;
}

export function PropertyMap({ lat, lng, title, location }: PropertyMapProps) {
  const externalMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className="bg-white p-2 rounded-xl shadow-sm border border-mosque/5">
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 isolate">
        <PropertyMapClient
          lat={lat}
          lng={lng}
          title={title}
          location={location}
        />
        <a
          className="absolute bottom-2 right-2 z-20 bg-white/90 text-xs font-medium px-2 py-1 rounded shadow-sm text-nordic hover:text-mosque transition-colors"
          href={externalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Map
        </a>
      </div>
    </div>
  );
}

