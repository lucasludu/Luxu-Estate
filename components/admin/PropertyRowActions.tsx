"use client";

import { useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  updatePropertyAction,
  deletePropertyAction,
  type UpdatePropertyInput,
} from "@/app/actions/admin";
import type { Property, PropertyCategory, PropertyImage } from "@/data/properties";

export interface PropertyRowActionsLabels {
  viewProperty: string;
  editProperty: string;
  deleteProperty: string;
  confirmDeleteTitle: string;
  confirmDeleteDescription: string;
  cancel: string;
  confirmDelete: string;
  saveChanges: string;
  saving: string;
  deleting: string;
  propertyUpdatedSuccess: string;
  propertyDeletedSuccess: string;
  editModalTitle: string;
  fieldTitle: string;
  fieldLocation: string;
  fieldPrice: string;
  fieldCategory: string;
  fieldListingType: string;
  fieldBeds: string;
  fieldBaths: string;
  fieldArea: string;
  fieldGarage: string;
  fieldBadge: string;
  fieldFeatured: string;
  statusActiveSale: string;
  statusActiveRent: string;
}

export function PropertyRowActions({
  property,
  labels,
  categoryLabels,
}: {
  property: Property;
  labels: PropertyRowActionsLabels;
  categoryLabels: Record<string, string>;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for edit
  const [title, setTitle] = useState(property.title);
  const [location, setLocation] = useState(property.location);
  const [price, setPrice] = useState(String(property.price));
  const [category, setCategory] = useState<Exclude<PropertyCategory, "All">>(
    property.category
  );
  const [listingType, setListingType] = useState<"sale" | "rent">(
    property.listingType
  );
  const [beds, setBeds] = useState(String(property.beds));
  const [baths, setBaths] = useState(String(property.baths));
  const [areaM2, setAreaM2] = useState(String(property.areaValue || 100));
  const [garage, setGarage] = useState(String(property.garage ?? 2));
  const [badge, setBadge] = useState(property.badge ?? "");
  const [featured, setFeatured] = useState(Boolean(property.featured));
  const [images, setImages] = useState<PropertyImage[]>(property.images ?? []);
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: UpdatePropertyInput = {
      title,
      location,
      price: Number(price),
      category,
      listingType,
      isMonthly: listingType === "rent",
      beds: Number(beds),
      baths: Number(baths),
      areaM2: Number(areaM2),
      garage: Number(garage),
      badge: badge.trim() || null,
      featured,
      images,
    };

    startTransition(async () => {
      const res = await updatePropertyAction(property.id, payload);
      if (res.ok) {
        setIsEditOpen(false);
      } else {
        setErrorMessage(res.error || "Error al actualizar propiedad");
      }
    });
  };

  const handleDeleteSubmit = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await deletePropertyAction(property.id);
      if (res.ok) {
        setIsDeleteOpen(false);
      } else {
        setErrorMessage(res.error || "Error al eliminar propiedad");
      }
    });
  };

  return (
    <>
      <div className="inline-flex items-center gap-1.5 bg-gray-50/90 p-1 rounded-xl border border-gray-200/80 shadow-2xs">
        {/* View property */}
        <Link
          href={`/properties/${property.slug}`}
          title={labels.viewProperty}
          className="group/btn relative h-8 px-2.5 rounded-lg bg-white border border-gray-200/80 text-nordic-dark/70 hover:text-mosque hover:border-mosque/40 hover:bg-hint-of-green/40 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-2xs cursor-pointer"
        >
          <span className="material-icons text-[17px] text-nordic-dark/60 group-hover/btn:text-mosque transition-colors">
            visibility
          </span>
          <span className="hidden xl:inline">{labels.viewProperty}</span>
        </Link>

        {/* Edit button */}
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setIsEditOpen(true);
          }}
          title={labels.editProperty}
          className="group/btn relative h-8 px-2.5 rounded-lg bg-white border border-gray-200/80 text-nordic-dark/70 hover:text-mosque hover:border-mosque/40 hover:bg-hint-of-green/40 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-2xs cursor-pointer"
        >
          <span className="material-icons text-[17px] text-nordic-dark/60 group-hover/btn:text-mosque transition-colors">
            edit
          </span>
          <span className="hidden xl:inline">{labels.editProperty}</span>
        </button>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setIsDeleteOpen(true);
          }}
          title={labels.deleteProperty}
          className="group/btn relative h-8 w-8 rounded-lg bg-white border border-gray-200/80 text-nordic-dark/60 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all flex items-center justify-center shadow-2xs cursor-pointer"
        >
          <span className="material-icons text-[17px] group-hover/btn:text-red-600 transition-colors">
            delete_outline
          </span>
        </button>
      </div>

      {/* Edit Property Modal */}
      {isEditOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-nordic-dark/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-nordic-dark/10 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-mosque/10 flex items-center justify-center text-mosque">
                  <span className="material-icons text-xl">edit</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-nordic-dark">
                    {labels.editModalTitle}
                  </h3>
                  <p className="text-xs text-nordic-muted truncate max-w-sm">
                    {property.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                disabled={isPending}
                className="p-1.5 rounded-lg text-nordic-dark/40 hover:text-nordic-dark hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <span className="material-icons text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                  <span className="material-icons text-sm">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Title & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-nordic-dark mb-1">
                    {labels.fieldTitle}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-nordic-dark mb-1">
                    {labels.fieldLocation}
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                  />
                </div>
              </div>

              {/* Price, Category, Listing Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-nordic-dark mb-1">
                    {labels.fieldPrice}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-nordic-dark mb-1">
                    {labels.fieldCategory}
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value as Exclude<PropertyCategory, "All">
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque bg-white"
                  >
                    <option value="House">{categoryLabels.House ?? "House"}</option>
                    <option value="Apartment">
                      {categoryLabels.Apartment ?? "Apartment"}
                    </option>
                    <option value="Villa">{categoryLabels.Villa ?? "Villa"}</option>
                    <option value="Penthouse">
                      {categoryLabels.Penthouse ?? "Penthouse"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-nordic-dark mb-1">
                    {labels.fieldListingType}
                  </label>
                  <select
                    value={listingType}
                    onChange={(e) =>
                      setListingType(e.target.value as "sale" | "rent")
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque bg-white"
                  >
                    <option value="sale">{labels.statusActiveSale}</option>
                    <option value="rent">{labels.statusActiveRent}</option>
                  </select>
                </div>
              </div>

              {/* Beds, Baths, Area, Garage */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-nordic-dark mb-1">
                    {labels.fieldBeds}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-nordic-dark mb-1">
                    {labels.fieldBaths}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-nordic-dark mb-1">
                    {labels.fieldArea}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={areaM2}
                    onChange={(e) => setAreaM2(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-nordic-dark mb-1">
                    {labels.fieldGarage}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={garage}
                    onChange={(e) => setGarage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                  />
                </div>
              </div>

              {/* Badge & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-semibold text-nordic-dark mb-1">
                    {labels.fieldBadge}
                  </label>
                  <input
                    type="text"
                    value={badge}
                    placeholder="Exclusive, New, Hot Offer..."
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                  />
                </div>
                <div className="flex items-center gap-2 sm:pt-5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-mosque"></div>
                    <span className="ml-2.5 text-xs font-medium text-nordic-dark">
                      {labels.fieldFeatured}
                    </span>
                  </label>
                </div>
              </div>

              {/* Images Section */}
              <div className="pt-3 border-t border-nordic-dark/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-nordic-dark">
                    Galería de Fotos ({images.length})
                  </label>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-nordic-dark/15 text-xs text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newImageUrl.trim()) return;
                      setImages((prev) => [
                        ...prev,
                        { url: newImageUrl.trim(), alt: title || "Property image" },
                      ]);
                      setNewImageUrl("");
                    }}
                    className="px-3 py-1.5 bg-nordic-dark hover:bg-mosque text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span className="material-icons text-sm">add</span>
                    <span>Añadir</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-md overflow-hidden border border-gray-200 aspect-video bg-gray-100"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || "Photo"}
                        fill
                        sizes="(max-width: 768px) 33vw, 25vw"
                        className="object-cover"
                        unoptimized
                      />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-mosque text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                          Portada
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Eliminar"
                      >
                        <span className="material-icons text-[11px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-nordic-dark border border-nordic-dark/15 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {labels.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-mosque hover:bg-primary-dark text-white transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isPending && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{isPending ? labels.saving : labels.saveChanges}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-nordic-dark/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-nordic-dark/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <span className="material-icons text-xl">delete_outline</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-nordic-dark">
                  {labels.confirmDeleteTitle}
                </h3>
                <p className="text-xs text-nordic-muted">
                  ID: #{property.id.slice(0, 8)}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <span className="material-icons text-sm">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <p className="text-sm text-nordic-dark/80">
              {labels.confirmDeleteDescription.replace("{title}", property.title)}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-nordic-dark border border-nordic-dark/15 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-60"
              >
                {isPending && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isPending ? labels.deleting : labels.confirmDelete}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

