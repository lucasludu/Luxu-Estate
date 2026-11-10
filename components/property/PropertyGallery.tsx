"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { PropertyImage } from "@/data/properties";

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
  badge?: string;
  statusLabel?: string;
}

export function PropertyGallery({
  images,
  title,
  badge,
  statusLabel,
}: PropertyGalleryProps) {
  const gallery =
    images.length > 0
      ? images
      : [{ url: "/placeholder.jpg", alt: title }];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeIndex = selectedIndex < gallery.length ? selectedIndex : 0;
  const activeImage = gallery[activeIndex];

  useEffect(() => {
    if (!isLightboxOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (event.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev + 1) % gallery.length);
      } else if (event.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, gallery.length]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group bg-slate-100">
        <Image
          key={activeImage.url}
          alt={activeImage.alt || title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          data-alt={activeImage.alt || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          src={activeImage.url}
        />
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            {badge || "Premium"}
          </span>
          <span className="bg-white/90 backdrop-blur text-nordic text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            {statusLabel === "FOR RENT" ? "For Rent" : "New"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 z-10 bg-white/90 hover:bg-white text-nordic px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="material-icons text-sm">grid_view</span>
          View All Photos
          {gallery.length > 1 && (
            <span className="text-xs text-nordic/60">({gallery.length})</span>
          )}
        </button>
      </div>

      {gallery.length > 0 && (
        <div className="flex gap-4 overflow-x-auto hide-scroll pb-2 pt-1 px-1 snap-x">
          {gallery.map((image, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={`${image.url}-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View photo ${idx + 1}: ${image.alt || title}`}
                aria-current={isSelected ? "true" : undefined}
                className={
                  isSelected
                    ? "relative flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer ring-2 ring-mosque ring-offset-2 ring-offset-clear-day snap-start transition-all"
                    : "relative flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer opacity-70 hover:opacity-100 transition-opacity snap-start"
                }
              >
                <Image
                  alt={image.alt || `${title} photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  fill
                  sizes="192px"
                  src={image.url}
                />
              </button>
            );
          })}
        </div>
      )}

      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo gallery`}
          className="fixed inset-0 z-50 bg-nordic/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
        >
          <div className="w-full max-w-5xl flex items-center justify-between text-white mb-4">
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-xs text-white/70">
                Photo {activeIndex + 1} of {gallery.length} — {activeImage.alt}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close gallery"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center justify-center"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          <div className="relative w-full max-w-5xl aspect-[16/10] rounded-xl overflow-hidden bg-black/40 shadow-2xl">
            <Image
              alt={activeImage.alt || title}
              className="object-contain"
              fill
              sizes="100vw"
              src={activeImage.url}
            />
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex(
                      (prev) => (prev - 1 + gallery.length) % gallery.length
                    )
                  }
                  aria-label="Previous photo"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white text-nordic shadow-lg transition-all cursor-pointer flex items-center justify-center"
                >
                  <span className="material-icons">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex((prev) => (prev + 1) % gallery.length)
                  }
                  aria-label="Next photo"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white text-nordic shadow-lg transition-all cursor-pointer flex items-center justify-center"
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scroll mt-6 max-w-5xl w-full py-2 px-1">
            {gallery.map((image, idx) => (
              <button
                key={`lightbox-${image.url}-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={
                  idx === activeIndex
                    ? "relative flex-none w-28 aspect-[4/3] rounded-lg overflow-hidden ring-2 ring-white cursor-pointer"
                    : "relative flex-none w-28 aspect-[4/3] rounded-lg overflow-hidden opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                }
              >
                <Image
                  alt={image.alt || `${title} thumbnail ${idx + 1}`}
                  className="object-cover"
                  fill
                  sizes="112px"
                  src={image.url}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

