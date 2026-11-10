"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapClientProps {
  lat: number;
  lng: number;
  title: string;
  location: string;
}

export default function PropertyMapClient({
  lat,
  lng,
  title,
  location,
}: PropertyMapClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(container, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    mapRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
      }
    ).addTo(map);

    const customPin = L.divIcon({
      className: "bg-transparent border-0",
      html: `
        <div class="w-8 h-8 bg-mosque rounded-full border-4 border-white shadow-lg animate-bounce flex items-center justify-center">
          <span class="material-icons text-white text-sm">home</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([lat, lng], { icon: customPin }).addTo(map);
    marker.bindPopup(
      `<div style="font-family: sans-serif; color: #19322F;"><strong>${title}</strong><br/><span style="font-size: 12px; opacity: 0.75;">${location}</span></div>`
    );

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, title, location]);

  return (
    <div
      ref={containerRef}
      aria-label={`Map showing location of ${title} at ${location}`}
      className="w-full h-full z-0"
    />
  );
}

