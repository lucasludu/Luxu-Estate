"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocaleCookieAction } from "@/app/actions/locale";
import {
  LANGUAGE_LIST,
  LANGUAGES,
  type Locale,
} from "@/i18n/config";

interface LanguageSelectorProps {
  currentLocale: Locale;
  ariaLabel?: string;
}

export function LanguageSelector({
  currentLocale,
  ariaLabel = "Select language",
}: LanguageSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticLocale, setOptimisticLocale] = useOptimistic(currentLocale);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("lang", optimisticLocale);
  }, [optimisticLocale]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const activeConfig = LANGUAGES[optimisticLocale] ?? LANGUAGES.es;

  const handleSelectLanguage = (nextLocale: Locale) => {
    setIsOpen(false);
    if (nextLocale === optimisticLocale) return;

    startTransition(async () => {
      setOptimisticLocale(nextLocale);
      await setLocaleCookieAction(nextLocale);
      router.refresh();
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={isPending}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-nordic-dark/10 bg-white/80 hover:bg-white hover:border-mosque/40 text-nordic-dark text-xs font-medium transition-all cursor-pointer disabled:opacity-60"
      >
        <span className="material-icons text-base text-mosque">language</span>
        <span className="font-semibold tracking-wide">
          {activeConfig.shortLabel}
        </span>
        <span className="hidden sm:inline text-nordic-dark/70">
          {activeConfig.name}
        </span>
        <span
          className={`material-icons text-sm text-nordic-dark/50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-soft border border-nordic-dark/10 py-1.5 z-50 overflow-hidden"
        >
          {LANGUAGE_LIST.map((lang) => {
            const isSelected = lang.code === optimisticLocale;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectLanguage(lang.code)}
                className={
                  isSelected
                    ? "w-full px-3.5 py-2 text-left text-sm flex items-center justify-between bg-mosque/10 text-mosque font-semibold cursor-pointer"
                    : "w-full px-3.5 py-2 text-left text-sm flex items-center justify-between text-nordic-dark hover:bg-black/5 transition-colors cursor-pointer"
                }
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-[11px] uppercase tracking-wider opacity-60">
                    {lang.shortLabel}
                  </span>
                  {isSelected && (
                    <span className="material-icons text-sm text-mosque">
                      check
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
