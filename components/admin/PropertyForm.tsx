"use client";

import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createPropertyAction,
  updatePropertyAction,
  uploadPropertyImageAction,
  deletePropertyImageFromBucketAction,
  type CreatePropertyInput,
  type UpdatePropertyInput,
} from "@/app/actions/admin";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  Property,
  PropertyCategory,
  PropertyImage,
} from "@/data/properties";

const PROPERTY_IMAGES_BUCKET = "property-images";

const DEFAULT_GALLERY_PREVIEW_IMAGES: PropertyImage[] = [
  {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZW0qbk7lfvNbdW7E2-JlNvoGiYxd_IFtXs-LfvSnOmMtH8ioaZBs2p82ENkCdRf_ix_zKpdGhOcuHfniuiBJrRDyErAFReMdAHvRnerfSzOyzSUbKvgYTybWysd6hjrQ4ZHMu3lMROjFcEx5IowvtKFZJy7Wv_AnfQ-q-B48VHLKzKhOvavGIGfN-psB9c2CO70k5peXj1HbAL-Lg-aGaK3jNgUS3Dh3V_zz6GKj4inq3dsGTc_tJsANMwh0G0YovWbq0luzYzNo",
    alt: "Modern living room interior",
  },
  {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGnTeJvEimHK72pGc1MuGPaIvONj8Rdm3QLjRyBJgP3oiCgMMyc8qfV8wMi19p5gKNkEq-62kf2aYJoYi_G7F4TGlrq49yUgN9czogSRoLrh6JmJLc7Bms2IH1Fbz2miESgV2YQYYq3h99qitC6R9aznMO8RkZOBiooVJlolpHYeDoTvmSKiWvD_JOjJIY5llWA9pDPV_ofQeOff7P_7PSTxwZ7qYKxWhsBnZpaxloAO2cpv3GVrZR65iTrzpDLSgzORU6dyCDScc",
    alt: "Kitchen with marble island",
  },
];

const MAP_PREVIEW_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAS55FY7gfArnlTpNsdabJk9nBO5uQJgOwIsl8beO34JRZ9dMmjLoIkTuTUO72Y9L5tUmQqTReQWebUWadAWwLusGmRQiIict5sqY--yRaOxuYpTzfR4vv4RKh1ex6oxY64e0kbSeMudNO6pv-gG0WzVWs-pDfvQm5IoTQ1mT-tAV49LDkXAHZl317M1-D7eZw3N8o2ExKWTgg6oMAXOFVnkApIqnb7TZHekwSw8pWQxpJV2EKI8EQKQbQXJaSbjN8gB1n8b-ueWj8";

const AMENITY_OPTIONS = [
  "Swimming Pool",
  "Garden",
  "Air Conditioning",
  "Smart Home System",
  "Gym",
  "Parking",
  "High-speed Wifi",
  "Patio / Terrace",
  "Wine Cellar",
];

function extractBucketPath(url: string): string | null {
  const marker = `/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const raw = url.slice(idx + marker.length).split("?")[0];
  return raw ? decodeURIComponent(raw) : null;
}

export interface PropertyFormLabels {
  breadcrumbProperties: string;
  breadcrumbAdd: string;
  breadcrumbEdit: string;
  pageTitleAdd: string;
  pageTitleEdit: string;
  pageSubtitleAdd: string;
  pageSubtitleEdit: string;
  saveDraft: string;
  saveProperty: string;
  saveChanges: string;
  saving: string;
  cancel: string;
  basicInfoTitle: string;
  fieldTitle: string;
  fieldPrice: string;
  fieldListingType: string;
  fieldCategory: string;
  fieldBadge: string;
  fieldFeatured: string;
  statusActiveSale: string;
  statusActiveRent: string;
  descriptionTitle: string;
  descriptionPlaceholder: string;
  galleryTitle: string;
  uploadClickOrDrag: string;
  uploadMaxSize: string;
  uploadingImages: string;
  addMoreImages: string;
  mainImageBadge: string;
  replaceImageFile: string;
  editImageTitle: string;
  setAsCover: string;
  removeImage: string;
  imageAltLabel: string;
  locationTitle: string;
  fieldLocation: string;
  locationPlaceholder: string;
  mapPreviewLabel: string;
  detailsTitle: string;
  fieldArea: string;
  fieldYearBuilt: string;
  fieldBeds: string;
  fieldBaths: string;
  fieldGarage: string;
  fieldAmenities: string;
  createSuccess: string;
  updateSuccess: string;
}

export function PropertyForm({
  mode,
  initialProperty,
  labels,
  categoryLabels,
  amenityLabels,
  defaultAgent,
}: {
  mode: "create" | "edit";
  initialProperty?: Property;
  labels: PropertyFormLabels;
  categoryLabels: Record<string, string>;
  amenityLabels: Record<string, string>;
  defaultAgent?: {
    name: string;
    role: string;
    avatar: string;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  // Basic Information
  const [title, setTitle] = useState(initialProperty?.title ?? "");
  const [price, setPrice] = useState(
    initialProperty ? String(initialProperty.price) : ""
  );
  const [listingType, setListingType] = useState<"sale" | "rent">(
    initialProperty?.listingType ?? "sale"
  );
  const [category, setCategory] = useState<Exclude<PropertyCategory, "All">>(
    initialProperty?.category ?? "Apartment"
  );
  const [badge, setBadge] = useState(initialProperty?.badge ?? "");
  const [featured, setFeatured] = useState(Boolean(initialProperty?.featured));

  // Description
  const [descriptionText, setDescriptionText] = useState(
    initialProperty?.description && initialProperty.description.length > 0
      ? initialProperty.description.join("\n\n")
      : ""
  );

  // Location
  const [location, setLocation] = useState(initialProperty?.location ?? "");
  const [latitude, setLatitude] = useState(
    String(initialProperty?.coordinates?.lat ?? 37.4419)
  );
  const [longitude, setLongitude] = useState(
    String(initialProperty?.coordinates?.lng ?? -122.143)
  );

  // Details
  const [areaM2, setAreaM2] = useState(
    initialProperty ? String(initialProperty.areaValue) : ""
  );
  const [yearBuilt, setYearBuilt] = useState(
    initialProperty?.yearBuilt ? String(initialProperty.yearBuilt) : ""
  );
  const [beds, setBeds] = useState<number>(initialProperty?.beds ?? 3);
  const [baths, setBaths] = useState<number>(initialProperty?.baths ?? 2);
  const [garage, setGarage] = useState<number>(initialProperty?.garage ?? 1);

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialProperty?.amenities && initialProperty.amenities.length > 0
      ? initialProperty.amenities
      : ["Garden"]
  );

  // Gallery
  const [images, setImages] = useState<PropertyImage[]>(
    initialProperty?.images && initialProperty.images.length > 0
      ? initialProperty.images
      : DEFAULT_GALLERY_PREVIEW_IMAGES
  );
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(
    null
  );
  const [editingAltText, setEditingAltText] = useState("");

  // Upload a single file to Supabase bucket `property-images`
  const uploadSingleFileToSupabase = async (
    file: File,
    replacePath?: string | null
  ): Promise<{ url: string; path?: string }> => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Max file size is 5MB per image.");
    }

    const ext = (file.name.split(".").pop() || "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const safeExt = ["jpg", "jpeg", "png", "webp", "avif"].includes(ext)
      ? ext
      : "jpg";

    const targetPath =
      replacePath && replacePath.trim().length > 0
        ? replacePath.trim()
        : `listings/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: uploadErr } = await supabase.storage
        .from(PROPERTY_IMAGES_BUCKET)
        .upload(targetPath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType:
            file.type || `image/${safeExt === "jpg" ? "jpeg" : safeExt}`,
        });

      if (!uploadErr) {
        const {
          data: { publicUrl },
        } = supabase.storage
          .from(PROPERTY_IMAGES_BUCKET)
          .getPublicUrl(targetPath);

        return {
          url: replacePath ? `${publicUrl}?v=${Date.now()}` : publicUrl,
          path: targetPath,
        };
      }
    } catch {
      // Fallback to Server Action below
    }

    const formData = new FormData();
    formData.set("file", file);
    if (replacePath) {
      formData.set("replacePath", replacePath);
    }
    const res = await uploadPropertyImageAction(formData);
    if (!res.ok || !res.url) {
      throw new Error(res.error || "Failed to upload image to Supabase bucket.");
    }
    return { url: res.url, path: res.path };
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);
    setIsUploading(true);

    try {
      const uploadedItems: PropertyImage[] = [];
      for (const file of Array.from(fileList)) {
        const { url } = await uploadSingleFileToSupabase(file);
        const defaultAlt =
          file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ") ||
          title.trim() ||
          "Property image";
        uploadedItems.push({ url, alt: defaultAlt });
      }
      setImages((prev) => [...prev, ...uploadedItems]);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error uploading images."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleReplaceImageFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || editingImageIndex === null) return;

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const currentImg = images[editingImageIndex];
      const existingBucketPath = currentImg
        ? extractBucketPath(currentImg.url)
        : null;

      const { url } = await uploadSingleFileToSupabase(file, existingBucketPath);
      const updatedAlt =
        editingAltText.trim() ||
        currentImg?.alt ||
        title.trim() ||
        "Property image";

      setImages((prev) =>
        prev.map((img, idx) =>
          idx === editingImageIndex ? { url, alt: updatedAlt } : img
        )
      );
      setEditingImageIndex(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error updating image."
      );
    } finally {
      setIsUploading(false);
      if (replaceFileInputRef.current) {
        replaceFileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const target = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (editingImageIndex === index) {
      setEditingImageIndex(null);
    }
    if (target) {
      const bucketPath = extractBucketPath(target.url);
      if (bucketPath) {
        try {
          const supabase = createSupabaseBrowserClient();
          const { error } = await supabase.storage
            .from(PROPERTY_IMAGES_BUCKET)
            .remove([bucketPath]);
          if (error) {
            await deletePropertyImageFromBucketAction(target.url);
          }
        } catch {
          await deletePropertyImageFromBucketAction(target.url);
        }
      }
    }
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const chosen = prev[index];
      if (!chosen) return prev;
      const others = prev.filter((_, i) => i !== index);
      return [chosen, ...others];
    });
    if (editingImageIndex === index) {
      setEditingImageIndex(0);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFilesSelected(e.dataTransfer.files);
  };

  const applyDescriptionFormat = (format: "bold" | "italic" | "list") => {
    const el = descriptionRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = descriptionText.slice(start, end);

    let replacement = "";
    if (format === "bold") {
      replacement = `**${selected || "bold text"}**`;
    } else if (format === "italic") {
      replacement = `*${selected || "italic text"}*`;
    } else {
      replacement = `\n• ${selected || "List item"}`;
    }

    const nextValue =
      descriptionText.slice(0, start) +
      replacement +
      descriptionText.slice(end);
    setDescriptionText(nextValue.slice(0, 2000));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const submitProperty = () => {
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage(`${labels.fieldTitle} is required.`);
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage(`${labels.fieldPrice} must be greater than 0.`);
      return;
    }
    if (!location.trim()) {
      setErrorMessage(`${labels.fieldLocation} is required.`);
      return;
    }

    const paragraphs = descriptionText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const payload: CreatePropertyInput & UpdatePropertyInput = {
      title: title.trim(),
      location: location.trim(),
      price: Math.max(0, Number(price) || 0),
      isMonthly: listingType === "rent",
      beds: Math.max(0, Math.floor(Number(beds) || 0)),
      baths: Math.max(0, Number(baths) || 0),
      areaM2: Math.max(1, Math.floor(Number(areaM2) || 180)),
      garage: Math.max(0, Math.floor(Number(garage) || 0)),
      yearBuilt: Math.max(1800, Math.floor(Number(yearBuilt) || 2024)),
      category,
      listingType,
      badge: badge.trim() || null,
      featured,
      description: paragraphs.length > 0 ? paragraphs : undefined,
      images: images.length > 0 ? images : DEFAULT_GALLERY_PREVIEW_IMAGES,
      amenities: selectedAmenities,
      latitude: Number(latitude) || 37.4419,
      longitude: Number(longitude) || -122.143,
      agentName: defaultAgent?.name || "Elena Fisher",
      agentRole: defaultAgent?.role || "Senior Agent",
      agentAvatar: defaultAgent?.avatar,
    };

    startTransition(async () => {
      const res =
        mode === "edit" && initialProperty
          ? await updatePropertyAction(initialProperty.id, payload)
          : await createPropertyAction(payload);

      if (res.ok) {
        setSuccessMessage(
          mode === "edit" ? labels.updateSuccess : labels.createSuccess
        );
        setTimeout(() => {
          router.push("/admin/properties");
          router.refresh();
        }, 600);
      } else {
        setErrorMessage(res.error || "Error saving property.");
      }
    });
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitProperty();
  };

  return (
    <>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
              <li>
                <Link
                  className="hover:text-mosque transition-colors"
                  href="/admin/properties"
                >
                  {labels.breadcrumbProperties}
                </Link>
              </li>
              <li>
                <span className="material-icons text-xs text-gray-400">
                  chevron_right
                </span>
              </li>
              <li aria-current="page" className="text-nordic">
                {mode === "edit" ? labels.breadcrumbEdit : labels.breadcrumbAdd}
              </li>
            </ol>
          </nav>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-nordic tracking-tight mb-2">
              {mode === "edit" ? labels.pageTitleEdit : labels.pageTitleAdd}
            </h1>
            <p className="text-base text-gray-500 max-w-2xl font-normal">
              {mode === "edit"
                ? labels.pageSubtitleEdit
                : labels.pageSubtitleAdd}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/properties"
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-nordic hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            {labels.saveDraft}
          </Link>
          <button
            type="button"
            onClick={submitProperty}
            disabled={isPending || isUploading}
            className="px-5 py-2.5 rounded-lg bg-mosque hover:bg-nordic text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer disabled:opacity-50"
          >
            <span className="material-icons text-sm">save</span>
            {isPending
              ? labels.saving
              : mode === "edit"
              ? labels.saveChanges
              : labels.saveProperty}
          </button>
        </div>
      </header>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-icons text-red-600 text-lg">
              error_outline
            </span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 cursor-pointer"
          >
            <span className="material-icons text-base">close</span>
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <span className="material-icons text-emerald-600 text-lg">
            check_circle
          </span>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleFormSubmit}
        className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
      >
        {/* Left Column (xl:col-span-8) */}
        <div className="xl:col-span-8 space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                <span className="material-icons text-lg">info</span>
              </div>
              <h2 className="text-xl font-bold text-nordic">
                {labels.basicInfoTitle}
              </h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="group">
                <label
                  className="block text-sm font-medium text-nordic mb-1.5"
                  htmlFor="title"
                >
                  {labels.fieldTitle} <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full text-base px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque focus:outline-none transition-all"
                  id="title"
                  placeholder="e.g. Modern Penthouse with Ocean View"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    className="block text-sm font-medium text-nordic mb-1.5"
                    htmlFor="price"
                  >
                    {labels.fieldPrice} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      className="w-full pl-7 pr-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque focus:outline-none transition-all text-base font-medium"
                      id="price"
                      placeholder="0.00"
                      type="number"
                      min={0}
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-nordic mb-1.5"
                    htmlFor="status"
                  >
                    {labels.fieldListingType}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:ring-1 focus:ring-mosque focus:border-mosque focus:outline-none transition-all text-base cursor-pointer"
                    id="status"
                    value={listingType}
                    onChange={(e) =>
                      setListingType(e.target.value as "sale" | "rent")
                    }
                  >
                    <option value="sale">{labels.statusActiveSale}</option>
                    <option value="rent">{labels.statusActiveRent}</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-nordic mb-1.5"
                    htmlFor="type"
                  >
                    {labels.fieldCategory}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:ring-1 focus:ring-mosque focus:border-mosque focus:outline-none transition-all text-base cursor-pointer"
                    id="type"
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value as Exclude<PropertyCategory, "All">
                      )
                    }
                  >
                    <option value="Apartment">
                      {categoryLabels.Apartment ?? "Apartment"}
                    </option>
                    <option value="House">
                      {categoryLabels.House ?? "House"}
                    </option>
                    <option value="Villa">
                      {categoryLabels.Villa ?? "Villa"}
                    </option>
                    <option value="Penthouse">
                      {categoryLabels.Penthouse ?? "Penthouse"}
                    </option>
                  </select>
                </div>
              </div>

              {/* Additional database fields: Badge & Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label
                    className="block text-sm font-medium text-nordic mb-1.5"
                    htmlFor="badge"
                  >
                    {labels.fieldBadge}
                  </label>
                  <input
                    className="w-full text-sm px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque focus:outline-none transition-all"
                    id="badge"
                    placeholder="e.g. Exclusive, New, Waterfront"
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      className="w-4 h-4 text-mosque border-gray-300 rounded focus:ring-mosque"
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-nordic group-hover:text-mosque transition-colors">
                      {labels.fieldFeatured}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                <span className="material-icons text-lg">description</span>
              </div>
              <h2 className="text-xl font-bold text-nordic">
                {labels.descriptionTitle}
              </h2>
            </div>
            <div className="p-8">
              <div className="mb-3 flex gap-2 border-b border-gray-100 pb-2">
                <button
                  className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors cursor-pointer"
                  type="button"
                  onClick={() => applyDescriptionFormat("bold")}
                >
                  <span className="material-icons text-lg">format_bold</span>
                </button>
                <button
                  className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors cursor-pointer"
                  type="button"
                  onClick={() => applyDescriptionFormat("italic")}
                >
                  <span className="material-icons text-lg">format_italic</span>
                </button>
                <button
                  className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors cursor-pointer"
                  type="button"
                  onClick={() => applyDescriptionFormat("list")}
                >
                  <span className="material-icons text-lg">
                    format_list_bulleted
                  </span>
                </button>
              </div>
              <textarea
                ref={descriptionRef}
                className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque focus:outline-none transition-all text-base leading-relaxed resize-y min-h-[200px]"
                id="description"
                maxLength={2000}
                placeholder={labels.descriptionPlaceholder}
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
              />
              <div className="mt-2 text-right text-xs text-gray-400">
                {descriptionText.length} / 2000 characters
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-hint-green/30 flex justify-between items-center bg-gradient-to-r from-hint-green/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                  <span className="material-icons text-lg">image</span>
                </div>
                <h2 className="text-xl font-bold text-nordic">
                  {labels.galleryTitle}
                </h2>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                JPG, PNG, WEBP
              </span>
            </div>
            <div className="p-8">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer group ${
                  isDragging
                    ? "border-mosque bg-hint-green/20"
                    : "border-gray-300 bg-gray-50/50 hover:bg-hint-green/10 hover:border-mosque/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={isUploading}
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  type="file"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-mosque group-hover:scale-110 transition-transform duration-300">
                    {isUploading ? (
                      <span className="material-icons text-2xl animate-spin">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-icons text-2xl">
                        cloud_upload
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-nordic">
                      {isUploading
                        ? labels.uploadingImages
                        : labels.uploadClickOrDrag}
                    </p>
                    <p className="text-xs text-gray-400">
                      {labels.uploadMaxSize}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hidden file input for replacing a single image */}
              <input
                ref={replaceFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleReplaceImageFile}
                className="hidden"
              />

              {/* Inline Image Edit / Replace Popover */}
              {editingImageIndex !== null && images[editingImageIndex] && (
                <div className="mt-6 p-4 rounded-xl bg-hint-green/20 border border-mosque/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-nordic">
                      {labels.editImageTitle} #{editingImageIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingImageIndex(null)}
                      className="text-gray-400 hover:text-nordic cursor-pointer"
                    >
                      <span className="material-icons text-base">close</span>
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={editingAltText}
                      onChange={(e) => setEditingAltText(e.target.value)}
                      placeholder={labels.imageAltLabel}
                      className="flex-1 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-nordic focus:outline-none focus:ring-1 focus:ring-mosque"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImages((prev) =>
                          prev.map((img, i) =>
                            i === editingImageIndex
                              ? {
                                  ...img,
                                  alt:
                                    editingAltText.trim() ||
                                    title.trim() ||
                                    "Property image",
                                }
                              : img
                          )
                        );
                        setEditingImageIndex(null);
                      }}
                      className="px-4 py-2 rounded-md bg-nordic text-white hover:bg-mosque text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Save Alt
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => replaceFileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-mosque hover:bg-nordic text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-icons text-sm">
                        cloud_upload
                      </span>
                      <span>{labels.replaceImageFile}</span>
                    </button>
                    {editingImageIndex !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(editingImageIndex)}
                        className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-nordic text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {labels.setAsCover}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {images.map((img, index) => (
                  <div
                    key={`${img.url}-${index}`}
                    className="aspect-square rounded-lg overflow-hidden relative group shadow-sm"
                  >
                    <Image
                      alt={img.alt || "Property interior"}
                      className="w-full h-full object-cover"
                      src={img.url}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-nordic/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button
                        className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        title={labels.removeImage}
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-white text-nordic hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
                        type="button"
                        onClick={() => {
                          setEditingImageIndex(index);
                          setEditingAltText(img.alt || "");
                        }}
                        title={labels.editImageTitle}
                      >
                        <span className="material-icons text-sm">edit</span>
                      </button>
                    </div>
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-mosque text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                        {labels.mainImageBadge}
                      </span>
                    )}
                  </div>
                ))}

                <button
                  className="aspect-square rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-mosque hover:border-mosque hover:bg-hint-green/20 transition-all group cursor-pointer"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="material-icons group-hover:scale-110 transition-transform">
                    add
                  </span>
                  <span className="text-xs mt-1 font-medium">
                    {labels.addMoreImages}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (xl:col-span-4) */}
        <div className="xl:col-span-4 space-y-8">
          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                <span className="material-icons text-lg">place</span>
              </div>
              <h2 className="text-lg font-bold text-nordic">
                {labels.locationTitle}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-nordic mb-1.5"
                  htmlFor="location"
                >
                  {labels.fieldLocation}
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque focus:outline-none transition-all text-sm"
                  id="location"
                  placeholder={labels.locationPlaceholder}
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-xs text-gray-500 font-medium mb-1 block"
                    htmlFor="latitude"
                  >
                    Latitude
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque focus:outline-none transition-all text-xs"
                  />
                </div>
                <div>
                  <label
                    className="text-xs text-gray-500 font-medium mb-1 block"
                    htmlFor="longitude"
                  >
                    Longitude
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque focus:outline-none transition-all text-xs"
                  />
                </div>
              </div>

              <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                <Image
                  alt="Map view of city streets"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
                  src={MAP_PREVIEW_IMAGE}
                  fill
                  sizes="400px"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-white/90 text-nordic px-3 py-1.5 rounded shadow-sm backdrop-blur-sm text-xs font-bold flex items-center gap-1">
                    <span className="material-icons text-sm text-mosque">
                      map
                    </span>{" "}
                    {labels.mapPreviewLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                <span className="material-icons text-lg">straighten</span>
              </div>
              <h2 className="text-lg font-bold text-nordic">
                {labels.detailsTitle}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label
                    className="text-xs text-gray-500 font-medium mb-1 block"
                    htmlFor="area"
                  >
                    {labels.fieldArea}
                  </label>
                  <input
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque focus:outline-none transition-all text-sm"
                    id="area"
                    placeholder="0"
                    type="number"
                    min={1}
                    value={areaM2}
                    onChange={(e) => setAreaM2(e.target.value)}
                  />
                </div>
                <div className="group">
                  <label
                    className="text-xs text-gray-500 font-medium mb-1 block"
                    htmlFor="year"
                  >
                    {labels.fieldYearBuilt}
                  </label>
                  <input
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque focus:outline-none transition-all text-sm"
                    id="year"
                    placeholder="YYYY"
                    type="number"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-nordic flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">
                      bed
                    </span>{" "}
                    {labels.fieldBeds}
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                    <button
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 cursor-pointer"
                      type="button"
                      onClick={() => setBeds((prev) => Math.max(0, prev - 1))}
                    >
                      -
                    </button>
                    <input
                      className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium"
                      readOnly
                      type="text"
                      value={beds}
                    />
                    <button
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 cursor-pointer"
                      type="button"
                      onClick={() => setBeds((prev) => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-nordic flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">
                      shower
                    </span>{" "}
                    {labels.fieldBaths}
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                    <button
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 cursor-pointer"
                      type="button"
                      onClick={() => setBaths((prev) => Math.max(0, prev - 1))}
                    >
                      -
                    </button>
                    <input
                      className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium"
                      readOnly
                      type="text"
                      value={baths}
                    />
                    <button
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 cursor-pointer"
                      type="button"
                      onClick={() => setBaths((prev) => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-nordic flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">
                      directions_car
                    </span>{" "}
                    {labels.fieldGarage}
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                    <button
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 cursor-pointer"
                      type="button"
                      onClick={() => setGarage((prev) => Math.max(0, prev - 1))}
                    >
                      -
                    </button>
                    <input
                      className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium"
                      readOnly
                      type="text"
                      value={garage}
                    />
                    <button
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 cursor-pointer"
                      type="button"
                      onClick={() => setGarage((prev) => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h3 className="font-bold mb-3 uppercase tracking-wider text-xs text-gray-500">
                  {labels.fieldAmenities}
                </h3>
                <div className="space-y-2">
                  {AMENITY_OPTIONS.map((amenity) => {
                    const checked = selectedAmenities.includes(amenity);
                    const displayLabel =
                      amenity === "Smart Home System"
                        ? amenityLabels[amenity] ?? "Smart Home"
                        : amenityLabels[amenity] ?? amenity;
                    return (
                      <label
                        key={amenity}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          className="w-4 h-4 text-mosque border-gray-300 rounded focus:ring-mosque"
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAmenity(amenity)}
                        />
                        <span className="text-sm text-gray-700 group-hover:text-nordic transition-colors">
                          {displayLabel}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl md:hidden z-40 flex gap-3">
          <Link
            href="/admin/properties"
            className="flex-1 py-3 rounded-lg border border-gray-300 bg-white text-nordic font-medium text-center"
          >
            {labels.cancel}
          </Link>
          <button
            className="flex-1 py-3 rounded-lg bg-mosque text-white font-medium flex justify-center items-center gap-2 disabled:opacity-50"
            type="submit"
            disabled={isPending || isUploading}
          >
            {isPending ? labels.saving : labels.saveProperty}
          </button>
        </div>
      </form>
    </>
  );
}
