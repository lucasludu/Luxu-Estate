import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { getDictionarySync, type Dictionary } from "@/i18n";
import { getServerI18n } from "@/i18n/server";

function NotFoundCard({ dict }: { dict: Dictionary }) {
  return (
    <div className="bg-white p-10 rounded-xl shadow-sm border border-mosque/10 max-w-md w-full text-center space-y-4">
      <div className="w-14 h-14 mx-auto rounded-full bg-mosque/10 text-mosque flex items-center justify-center">
        <span className="material-icons text-2xl">home_work</span>
      </div>
      <h1 className="text-2xl font-semibold text-nordic">
        {dict.notFound.title}
      </h1>
      <p className="text-sm text-nordic/70">{dict.notFound.description}</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 bg-mosque hover:bg-[#005544] text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        <span className="material-icons text-sm">arrow_back</span>
        {dict.notFound.backToHome}
      </Link>
    </div>
  );
}

async function NotFoundDynamic() {
  const { dict } = await getServerI18n();
  return <NotFoundCard dict={dict} />;
}

export default function PropertyNotFound() {
  const fallbackDict = getDictionarySync(DEFAULT_LOCALE);

  return (
    <div className="min-h-screen flex flex-col bg-clear-day text-nordic">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <Suspense fallback={<NotFoundCard dict={fallbackDict} />}>
          <NotFoundDynamic />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
