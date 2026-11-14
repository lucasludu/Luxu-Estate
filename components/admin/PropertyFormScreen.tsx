import { notFound } from "next/navigation";
import { getServerI18n } from "@/i18n/server";
import { requireAdminUser } from "@/lib/auth";
import { getPropertyById } from "@/lib/properties";
import { PropertyForm, type PropertyFormLabels } from "./PropertyForm";

export function PropertyFormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-3">
          <div className="h-4 w-40 rounded bg-nordic-dark/10" />
          <div className="h-9 w-72 rounded-lg bg-nordic-dark/10" />
          <div className="h-4 w-96 rounded bg-nordic-dark/10" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 rounded-lg bg-nordic-dark/10" />
          <div className="h-10 w-36 rounded-lg bg-nordic-dark/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <div className="h-64 rounded-xl bg-white border border-gray-100" />
          <div className="h-72 rounded-xl bg-white border border-gray-100" />
          <div className="h-96 rounded-xl bg-white border border-gray-100" />
        </div>
        <div className="xl:col-span-4 space-y-8">
          <div className="h-80 rounded-xl bg-white border border-gray-100" />
          <div className="h-96 rounded-xl bg-white border border-gray-100" />
        </div>
      </div>
    </div>
  );
}

export async function PropertyFormScreen({
  mode,
  propertyId,
}: {
  mode: "create" | "edit";
  propertyId?: string;
}) {
  const targetPath =
    mode === "edit" && propertyId
      ? `/admin/properties/${propertyId}/edit`
      : "/admin/properties/new";

  const [{ locale, dict }, adminUser, property] = await Promise.all([
    getServerI18n(),
    requireAdminUser(targetPath),
    mode === "edit" && propertyId
      ? getPropertyById(propertyId)
      : Promise.resolve(null),
  ]);

  if (mode === "edit" && !property) {
    notFound();
  }

  const isEs = locale === "es";
  const isDe = locale === "de";

  const labels: PropertyFormLabels = {
    breadcrumbProperties: dict.admin.nav.properties,
    breadcrumbAdd: isEs ? "Agregar Nueva" : isDe ? "Neu hinzufügen" : "Add New",
    breadcrumbEdit: isEs
      ? "Editar Propiedad"
      : isDe
      ? "Immobilie bearbeiten"
      : "Edit Property",
    pageTitleAdd: isEs
      ? "Agregar Nueva Propiedad"
      : isDe
      ? "Neue Immobilie hinzufügen"
      : "Add New Property",
    pageTitleEdit: dict.admin.properties.editModalTitle,
    pageSubtitleAdd: isEs
      ? "Completa los detalles a continuación para crear una nueva publicación. Los campos marcados con * son obligatorios."
      : isDe
      ? "Füllen Sie die folgenden Angaben aus, um ein neues Angebot zu erstellen. Pflichtfelder sind mit * markiert."
      : "Fill in the details below to create a new listing. Fields marked with * are mandatory.",
    pageSubtitleEdit: isEs
      ? "Actualiza los detalles de la propiedad a continuación. Los campos marcados con * son obligatorios."
      : isDe
      ? "Aktualisieren Sie die Angaben der Immobilie. Pflichtfelder sind mit * markiert."
      : "Update the details below for this listing. Fields marked with * are mandatory.",
    saveDraft: isEs ? "Guardar Borrador" : isDe ? "Entwurf speichern" : "Save Draft",
    saveProperty: isEs
      ? "Guardar Propiedad"
      : isDe
      ? "Immobilie speichern"
      : "Save Property",
    saveChanges: dict.admin.properties.saveChanges,
    saving: dict.admin.properties.saving,
    cancel: dict.admin.properties.cancel,
    basicInfoTitle: isEs
      ? "Información Básica"
      : isDe
      ? "Basisinformationen"
      : "Basic Information",
    fieldTitle: isEs
      ? "Título de la Propiedad"
      : isDe
      ? "Immobilientitel"
      : "Property Title",
    fieldPrice: isEs ? "Precio" : isDe ? "Preis" : "Price",
    fieldListingType: isEs ? "Estado" : isDe ? "Status" : "Status",
    fieldCategory: isEs
      ? "Tipo de Propiedad"
      : isDe
      ? "Immobilientyp"
      : "Property Type",
    fieldBadge: dict.admin.properties.fieldBadge,
    fieldFeatured: dict.admin.properties.fieldFeatured,
    statusActiveSale: dict.admin.properties.statusActiveSale,
    statusActiveRent: dict.admin.properties.statusActiveRent,
    descriptionTitle: isEs
      ? "Descripción"
      : isDe
      ? "Beschreibung"
      : "Description",
    descriptionPlaceholder: isEs
      ? "Describe las características de la propiedad, el vecindario y sus puntos únicos..."
      : isDe
      ? "Beschreiben Sie die Merkmale der Immobilie, die Nachbarschaft und besondere Highlights..."
      : "Describe the property features, neighborhood, and unique selling points...",
    galleryTitle: isEs ? "Galería" : isDe ? "Galerie" : "Gallery",
    uploadClickOrDrag: isEs
      ? "Haz clic o arrastra imágenes aquí"
      : isDe
      ? "Klicken oder Bilder hierher ziehen"
      : "Click or drag images here",
    uploadMaxSize: isEs
      ? "Tamaño máximo 5MB por imagen"
      : isDe
      ? "Maximale Dateigröße 5MB pro Bild"
      : "Max file size 5MB per image",
    uploadingImages: isEs
      ? "Subiendo imágenes al bucket..."
      : isDe
      ? "Bilder werden hochgeladen..."
      : "Uploading images to bucket...",
    addMoreImages: isEs ? "Añadir más" : isDe ? "Mehr hinzufügen" : "Add More",
    mainImageBadge: "Main",
    replaceImageFile: isEs
      ? "Reemplazar imagen"
      : isDe
      ? "Bild ersetzen"
      : "Replace Image",
    editImageTitle: isEs
      ? "Editar Imagen"
      : isDe
      ? "Bild bearbeiten"
      : "Edit Image",
    setAsCover: dict.admin.properties.setAsCover,
    removeImage: dict.admin.properties.removeImage,
    imageAltLabel: dict.admin.properties.imageAltLabel,
    locationTitle: isEs ? "Ubicación" : isDe ? "Standort" : "Location",
    fieldLocation: isEs ? "Dirección" : isDe ? "Adresse" : "Address",
    locationPlaceholder: isEs
      ? "Dirección, Ciudad, Código Postal"
      : isDe
      ? "Straße, Stadt, PLZ"
      : "Street Address, City, Zip",
    mapPreviewLabel: isEs ? "Vista Previa" : isDe ? "Vorschau" : "Preview",
    detailsTitle: isEs ? "Detalles" : isDe ? "Details" : "Details",
    fieldArea: dict.admin.properties.fieldArea,
    fieldYearBuilt: isEs ? "Año Construcción" : isDe ? "Baujahr" : "Year Built",
    fieldBeds: isEs ? "Habitaciones" : isDe ? "Schlafzimmer" : "Bedrooms",
    fieldBaths: isEs ? "Baños" : isDe ? "Badezimmer" : "Bathrooms",
    fieldGarage: isEs ? "Estacionamiento" : isDe ? "Parkplätze" : "Parking",
    fieldAmenities: dict.admin.properties.fieldAmenities,
    createSuccess: dict.admin.properties.createPropertySuccess,
    updateSuccess: dict.admin.properties.propertyUpdatedSuccess,
  };

  return (
    <PropertyForm
      mode={mode}
      initialProperty={property ?? undefined}
      labels={labels}
      categoryLabels={{
        House: dict.categories.House,
        Apartment: dict.categories.Apartment,
        Villa: dict.categories.Villa,
        Penthouse: dict.categories.Penthouse,
      }}
      amenityLabels={dict.amenities}
      defaultAgent={{
        name: adminUser.name || "Elena Fisher",
        role: "Senior Agent",
        avatar:
          adminUser.avatarUrl ||
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAmzE14jvdSQ44MQaP8gzILgyZCMmx-euPq-VqTsyA6CaXAiSOXG6q5U6y8ZB2r9FD-8KZcIWy26I3fZ7nhTYrhuOyFQ0ZWUqK11Rr-TPcz9YafIvjcmFEKASnb_RHxJUhsLRjIPf5y9DGE5jLDQf7z_fgAmKilyPC4KxIW4Umx3OKqqVfhNd3L-qEW3wTsiG_DaiWsTsLoiRwtAU_32ZuWR0hx4yZNjYP4AnMsAt0SVdFRnFhIfItaKCukJUh6_Qf4KV1-dN6oKmU",
      }}
    />
  );
}
