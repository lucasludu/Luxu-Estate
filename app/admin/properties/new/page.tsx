import { Suspense } from "react";
import type { Metadata } from "next";
import {
  PropertyFormScreen,
  PropertyFormSkeleton,
} from "@/components/admin/PropertyFormScreen";

export const metadata: Metadata = {
  title: "Add New Property | LuxeEstate Admin",
  description: "Create a new luxury property listing.",
};

export default function AdminNewPropertyPage() {
  return (
    <Suspense fallback={<PropertyFormSkeleton />}>
      <PropertyFormScreen mode="create" />
    </Suspense>
  );
}

