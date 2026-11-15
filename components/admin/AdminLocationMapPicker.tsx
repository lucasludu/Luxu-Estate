"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface AdminLocationMapPickerProps {
  lat: number;
  lng: number;
  addressLabel?: string;
  onSelectCoordinates: (lat: number, lng: number) => void;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function AdminLocationMapPicker({
  lat,
  lng,
  addressLabel,
  onSelectCoordinates,
}: AdminLocationMapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const callbackRef = useRef(onSelectCoordinates);

  useEffect(() => {
    callbackRef.current = onSelectCoordinates;
  }, [onSelectCoordinates]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }

    const safeLat = Number.isFinite(lat)
      ? Math.min(90, Math.max(-90, lat))
      : 37.4419;
    const safeLng = Number.isFinite(lng)
      ? Math.min(180, Math.max(-180, lng))
      : -122.143;

    const map = L.map(container, {
      center: [safeLat, safeLng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const customPin = L.divIcon({
      className: "bg-transparent border-0",
      html: `
        <div class="w-8 h-8 bg-mosque rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-grab">
          <span class="material-icons text-white text-sm">place</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });

    const marker = L.marker([safeLat, safeLng], {
      icon: customPin,
      draggable: true,
    }).addTo(map);

    if (addressLabel && addressLabel.trim()) {
      marker.bindPopup(
        `<div style="font-family: sans-serif; color: #19322F; font-size: 12px; max-width: 220px;"><strong>${escapeHtml(
          addressLabel.trim()
        )}</strong></div>`
      );
    }

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      callbackRef.current(
        Number(pos.lat.toFixed(6)),
        Number(pos.lng.toFixed(6))
      );
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      const clickedLat = Number(e.latlng.lat.toFixed(6));
      const clickedLng = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([clickedLat, clickedLng]);
      callbackRef.current(clickedLat, clickedLng);
    });

    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Initialize map once; subsequent lat/lng/address updates are handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      marker.setLatLng([lat, lng]);
      const targetZoom = Math.max(map.getZoom(), 16);
      map.setView([lat, lng], targetZoom, { animate: true });
    }
  }, [lat, lng]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    if (addressLabel && addressLabel.trim()) {
      const content = `<div style="font-family: sans-serif; color: #19322F; font-size: 12px; max-width: 220px;"><strong>${escapeHtml(
        addressLabel.trim()
      )}</strong></div>`;
      if (marker.getPopup()) {
        marker.setPopupContent(content);
      } else {
        marker.bindPopup(content);
      }
    }
  }, [addressLabel]);

  return <div ref={containerRef} className="w-full h-full z-0" />;
}
