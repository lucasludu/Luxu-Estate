import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HomeScreen, HomeSkeleton } from "@/components/home/HomeScreen";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Suspense fallback={<HomeSkeleton />}>
          <HomeScreen searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
