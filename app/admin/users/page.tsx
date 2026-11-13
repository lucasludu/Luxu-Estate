import { Suspense } from "react";
import {
  AdminUsersScreen,
  AdminUsersSkeleton,
} from "@/components/admin/AdminUsersScreen";

export default function AdminUsersPage({
  searchParams,
}: PageProps<"/admin/users">) {
  return (
    <Suspense fallback={<AdminUsersSkeleton />}>
      <AdminUsersScreen searchParams={searchParams} />
    </Suspense>
  );
}

