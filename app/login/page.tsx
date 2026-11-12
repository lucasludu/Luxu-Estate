import type { Metadata } from "next";
import Link from "next/link";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

export const metadata: Metadata = {
  title: "LuxeEstate - Login",
  description: "Welcome to LuxeEstate. Unlock exclusive properties worldwide.",
};

export default function LoginPage() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4 antialiased text-nordic dark:text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/30 rounded-full blur-3xl dark:bg-primary/10"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <main className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Link
            href="/"
            aria-label="Go to LuxeEstate Home"
            className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-6 shadow-soft text-white"
          >
            <span className="material-symbols-rounded text-3xl">
              real_estate_agent
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-nordic dark:text-white mb-2">
            Welcome to LuxeEstate
          </h1>
          <p className="text-nordic/60 dark:text-gray-400">
            Unlock exclusive properties worldwide.
          </p>
        </div>

        <SocialAuthButtons />

        <div className="mt-8 text-center">
          <nav className="flex justify-center gap-6 text-xs text-nordic/50 dark:text-gray-500">
            <Link
              className="hover:text-nordic dark:hover:text-gray-300 transition-colors"
              href="#"
            >
              Privacy Policy
            </Link>
            <Link
              className="hover:text-nordic dark:hover:text-gray-300 transition-colors"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="hover:text-nordic dark:hover:text-gray-300 transition-colors"
              href="#"
            >
              Help Center
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}

