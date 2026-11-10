import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyDetailsSkeleton } from "./page";

export default function LoadingPropertyDetails() {
  return (
    <div className="min-h-screen flex flex-col bg-clear-day text-nordic">
      <Navbar />
      <div className="flex-grow">
        <PropertyDetailsSkeleton />
      </div>
      <Footer />
    </div>
  );
}

