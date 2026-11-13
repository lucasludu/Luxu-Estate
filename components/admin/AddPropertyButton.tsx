"use client";

import { useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import {
  createPropertyAction,
  type CreatePropertyInput,
} from "@/app/actions/admin";
import type { PropertyCategory, PropertyImage } from "@/data/properties";

const PRESET_SAMPLE_IMAGES: PropertyImage[] = [
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    alt: "Fachada principal",
  },
  {
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    alt: "Sala de estar de lujo",
  },
  {
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    alt: "Piscina infinity",
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    alt: "Vista panorámica terraza",
  },
];

const AVAILABLE_AMENITIES = [
  "Swimming Pool",
  "Gym",
  "Parking",
  "Air Conditioning",
  "High-speed Wifi",
  "Patio / Terrace",
  "Smart Home System",
];

export interface AddPropertyButtonLabels {
  buttonLabel: string;
  modalTitle: string;
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
  cancel: string;
  saveChanges: string;
  creating: string;
  success: string;
  stepBasic: string;
  stepFeatures: string;
  stepImages: string;
  stepIndicator: string;
  nextStep: string;
  prevStep: string;
  addImage: string;
  imageUrlLabel: string;
  imageAltLabel: string;
  coverPhoto: string;
  setAsCover: string;
  removeImage: string;
  usePresetImages: string;
  noImagesAdded: string;
  imagesCount: string;
  fieldAmenities: string;
}

export function AddPropertyButton({
  labels,
  categoryLabels,
  amenityLabels,
}: {
  labels: AddPropertyButtonLabels;
  categoryLabels: Record<string, string>;
  amenityLabels?: Record<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1: Basic Info
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("1200000");
  const [category, setCategory] = useState<Exclude<PropertyCategory, "All">>(
    "Villa"
  );
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [badge, setBadge] = useState("");
  const [featured, setFeatured] = useState(false);

  // Step 2: Features & Specs
  const [beds, setBeds] = useState("4");
  const [baths, setBaths] = useState("3");
  const [areaM2, setAreaM2] = useState("320");
  const [garage, setGarage] = useState("2");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Swimming Pool",
    "High-speed Wifi",
    "Air Conditioning",
    "Parking",
  ]);

  // Step 3: Images
  const [images, setImages] = useState<PropertyImage[]>([
    PRESET_SAMPLE_IMAGES[0],
    PRESET_SAMPLE_IMAGES[1],
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setLocation("");
    setPrice("1200000");
    setCategory("Villa");
    setListingType("sale");
    setBadge("");
    setFeatured(false);
    setBeds("4");
    setBaths("3");
    setAreaM2("320");
    setGarage("2");
    setSelectedAmenities([
      "Swimming Pool",
      "High-speed Wifi",
      "Air Conditioning",
      "Parking",
    ]);
    setImages([PRESET_SAMPLE_IMAGES[0], PRESET_SAMPLE_IMAGES[1]]);
    setNewImageUrl("");
    setNewImageAlt("");
    setErrorMessage(null);
  };

  const handleNextStep = () => {
    setErrorMessage(null);
    if (step === 1) {
      if (!title.trim()) {
        setErrorMessage("Por favor ingresa un título para la propiedad.");
        return;
      }
      if (!location.trim()) {
        setErrorMessage("Por favor ingresa la ubicación de la propiedad.");
        return;
      }
      if (!price || Number(price) <= 0) {
        setErrorMessage("Por favor ingresa un precio válido mayor a 0.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    if (step > 1) {
      setStep((step - 1) as 1 | 2);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    try {
      new URL(newImageUrl.trim());
    } catch {
      setErrorMessage("Por favor ingresa una URL válida de imagen (ej. https://...).");
      return;
    }
    setImages((prev) => [
      ...prev,
      {
        url: newImageUrl.trim(),
        alt: newImageAlt.trim() || title.trim() || "Property photo",
      },
    ]);
    setNewImageUrl("");
    setNewImageAlt("");
    setErrorMessage(null);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  const handleLoadSampleImages = () => {
    setImages(PRESET_SAMPLE_IMAGES);
    setErrorMessage(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !location.trim()) {
      setErrorMessage("Título y ubicación son obligatorios.");
      setStep(1);
      return;
    }

    const payload: CreatePropertyInput = {
      title: title.trim(),
      location: location.trim(),
      price: Math.max(0, Number(price) || 0),
      category,
      listingType,
      isMonthly: listingType === "rent",
      beds: Math.max(0, Math.floor(Number(beds) || 0)),
      baths: Math.max(0, Number(baths) || 0),
      areaM2: Math.max(0, Math.floor(Number(areaM2) || 0)),
      garage: Math.max(0, Math.floor(Number(garage) || 0)),
      badge: badge.trim() || null,
      featured,
      images: images.length > 0 ? images : undefined,
      amenities: selectedAmenities,
    };

    startTransition(async () => {
      const res = await createPropertyAction(payload);
      if (res.ok) {
        setSuccessMessage(labels.success);
        setTimeout(() => {
          setSuccessMessage(null);
          setIsOpen(false);
          resetForm();
        }, 900);
      } else {
        setErrorMessage(res.error || "Error al agregar propiedad");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetForm();
          setIsOpen(true);
        }}
        className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg bg-mosque hover:bg-primary-dark text-white text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
      >
        <span className="material-icons text-lg">add</span>
        <span>{labels.buttonLabel}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-nordic-dark/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-nordic-dark/10 my-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-nordic-dark/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-hint-of-green text-mosque flex items-center justify-center">
                  <span className="material-icons text-xl">add_business</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-nordic-dark">
                    {labels.modalTitle}
                  </h3>
                  <p className="text-xs text-nordic-muted">
                    {labels.stepIndicator
                      .replace("{current}", String(step))
                      .replace("{total}", "3")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-nordic-dark/40 hover:text-nordic-dark p-1.5 rounded-lg hover:bg-nordic-dark/5 transition-colors cursor-pointer"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { id: 1, label: labels.stepBasic, icon: "info" },
                  { id: 2, label: labels.stepFeatures, icon: "straighten" },
                  { id: 3, label: labels.stepImages, icon: "collections" },
                ].map((s) => {
                  const isCurrent = step === s.id;
                  const isCompleted = step > s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (s.id < step) {
                          setStep(s.id as 1 | 2 | 3);
                        } else if (s.id === 2 && step === 1) {
                          handleNextStep();
                        }
                      }}
                      className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? "bg-hint-of-green/40 border-mosque text-mosque font-semibold shadow-xs"
                          : isCompleted
                          ? "bg-gray-50 border-gray-200 text-nordic-dark cursor-pointer hover:bg-gray-100"
                          : "bg-transparent border-gray-100 text-nordic-muted/70 opacity-60"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCurrent
                            ? "bg-mosque text-white"
                            : isCompleted
                            ? "bg-mosque/20 text-mosque"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {isCompleted ? (
                          <span className="material-icons text-xs font-bold">
                            check
                          </span>
                        ) : (
                          s.id
                        )}
                      </div>
                      <span className="text-xs truncate">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <span className="material-icons text-base">error_outline</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <span className="material-icons text-base">check_circle</span>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                        {labels.fieldTitle} *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Villa Bella Vista"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                        {labels.fieldLocation} *
                      </label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Beverly Hills, CA"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                        {labels.fieldPrice} *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        step={1000}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                        {labels.fieldCategory}
                      </label>
                      <select
                        value={category}
                        onChange={(e) =>
                          setCategory(
                            e.target.value as Exclude<PropertyCategory, "All">
                          )
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark bg-white focus:outline-none focus:ring-2 focus:ring-mosque"
                      >
                        <option value="Villa">
                          {categoryLabels.Villa ?? "Villa"}
                        </option>
                        <option value="House">
                          {categoryLabels.House ?? "House"}
                        </option>
                        <option value="Apartment">
                          {categoryLabels.Apartment ?? "Apartment"}
                        </option>
                        <option value="Penthouse">
                          {categoryLabels.Penthouse ?? "Penthouse"}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                        {labels.fieldListingType}
                      </label>
                      <select
                        value={listingType}
                        onChange={(e) =>
                          setListingType(e.target.value as "sale" | "rent")
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark bg-white focus:outline-none focus:ring-2 focus:ring-mosque"
                      >
                        <option value="sale">{labels.statusActiveSale}</option>
                        <option value="rent">{labels.statusActiveRent}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                        {labels.fieldBadge}
                      </label>
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="New / Exclusive"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="h-4 w-4 rounded border-nordic-dark/20 text-mosque focus:ring-mosque"
                        />
                        <span className="text-sm font-medium text-nordic-dark">
                          {labels.fieldFeatured}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Features & Specs */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                        {labels.fieldBeds}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={beds}
                        onChange={(e) => setBeds(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                        {labels.fieldBaths}
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={baths}
                        onChange={(e) => setBaths(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                        {labels.fieldArea}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={areaM2}
                        onChange={(e) => setAreaM2(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                        {labels.fieldGarage}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={garage}
                        onChange={(e) => setGarage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-2">
                      {labels.fieldAmenities}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AVAILABLE_AMENITIES.map((amenity) => {
                        const selected = selectedAmenities.includes(amenity);
                        const labelText =
                          amenityLabels?.[amenity] ?? amenity;
                        return (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition-colors cursor-pointer ${
                              selected
                                ? "bg-mosque text-white border-mosque shadow-2xs"
                                : "bg-white border-nordic-dark/15 text-nordic-dark hover:bg-gray-50"
                            }`}
                          >
                            <span className="truncate">{labelText}</span>
                            {selected && (
                              <span className="material-icons text-sm ml-1">
                                check
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Images */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-nordic-dark/70">
                      {labels.imagesCount.replace("{count}", String(images.length))}
                    </span>
                    <button
                      type="button"
                      onClick={handleLoadSampleImages}
                      className="text-xs font-medium text-mosque hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-icons text-sm">auto_awesome</span>
                      <span>{labels.usePresetImages}</span>
                    </button>
                  </div>

                  {/* Add image input form */}
                  <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-nordic-dark mb-1">
                          {labels.imageUrlLabel}
                        </label>
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full px-3 py-2 rounded-lg border border-nordic-dark/15 text-xs text-nordic-dark bg-white focus:outline-none focus:ring-2 focus:ring-mosque"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-nordic-dark mb-1">
                          {labels.imageAltLabel}
                        </label>
                        <input
                          type="text"
                          value={newImageAlt}
                          onChange={(e) => setNewImageAlt(e.target.value)}
                          placeholder="Vista sala"
                          className="w-full px-3 py-2 rounded-lg border border-nordic-dark/15 text-xs text-nordic-dark bg-white focus:outline-none focus:ring-2 focus:ring-mosque"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-nordic-dark text-white hover:bg-mosque text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span className="material-icons text-sm">add_photo_alternate</span>
                        <span>{labels.addImage}</span>
                      </button>
                    </div>
                  </div>

                  {/* Images preview gallery */}
                  {images.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl px-4">
                      <span className="material-icons text-3xl text-gray-400 mb-1">
                        photo_library
                      </span>
                      <p className="text-xs text-nordic-muted">
                        {labels.noImagesAdded}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="group relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-video flex flex-col"
                        >
                          <Image
                            src={img.url}
                            alt={img.alt || "Property image"}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-90" />
                          <div className="absolute top-1.5 left-1.5">
                            {index === 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-mosque text-white shadow-xs">
                                {labels.coverPhoto}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetCover(index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/90 text-nordic-dark hover:bg-white cursor-pointer"
                              >
                                {labels.setAsCover}
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title={labels.removeImage}
                          >
                            <span className="material-icons text-xs">delete</span>
                          </button>
                          <p className="absolute bottom-1 left-2 right-2 text-[10px] text-white/90 truncate">
                            {img.alt || `Foto ${index + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-5 border-t border-nordic-dark/10 mt-6">
                <div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-nordic-dark/70 hover:text-nordic-dark hover:bg-nordic-dark/5 transition-colors cursor-pointer"
                  >
                    {labels.cancel}
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-nordic-dark/15 text-sm font-medium text-nordic-dark hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span className="material-icons text-base">arrow_back</span>
                      <span>{labels.prevStep}</span>
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-mosque hover:bg-primary-dark text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <span>{labels.nextStep}</span>
                      <span className="material-icons text-base">arrow_forward</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-mosque hover:bg-primary-dark text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isPending ? (
                        <>
                          <span className="material-icons text-base animate-spin">
                            progress_activity
                          </span>
                          <span>{labels.creating}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-base">check</span>
                          <span>{labels.saveChanges}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
