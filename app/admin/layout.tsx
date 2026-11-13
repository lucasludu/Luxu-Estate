import type { Metadata } from "next";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

export const metadata: Metadata = {
  title: "Admin Dashboard | LuxeEstate",
  description:
    "Administrative portal for managing luxury properties and user roles.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background-light text-nordic-dark">
      <AdminNavbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>
      <footer className="mt-auto border-t border-nordic-dark/10 bg-white">
        <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-nordic-muted">
            © 2026 LuxeEstate Administrative Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

