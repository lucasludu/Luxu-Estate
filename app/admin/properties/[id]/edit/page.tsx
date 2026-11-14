import { Suspense } from "react";
import type { Metadata } from "next";
import {
  PropertyFormScreen,
  PropertyFormSkeleton,
} from "@/components/admin/PropertyFormScreen";

export const metadata: Metadata = {
  title: "Edit Property | LuxeEstate Admin",
  description: "Edit luxury property listing details and gallery.",
};

async function EditPropertyContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PropertyFormScreen mode="edit" propertyId={id} />;
}

export default function AdminEditPropertyPage({
  params,
}: PageProps<"/admin/properties/[id]/edit">) {
  return (
    <Suspense fallback={<PropertyFormSkeleton />}>
      <EditPropertyContent params={params} />
    </Suspense>
  );
}

