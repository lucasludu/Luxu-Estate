import { Suspense } from "react";
import {
  AdminPropertiesScreen,
  AdminPropertiesSkeleton,
} from "@/components/admin/AdminPropertiesScreen";

export default function AdminPropertiesPage({
  searchParams,
}: PageProps<"/admin/properties">) {
  return (
    <Suspense fallback={<AdminPropertiesSkeleton />}>
      <AdminPropertiesScreen searchParams={searchParams} />
    </Suspense>
  );
}

