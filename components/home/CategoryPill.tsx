import Link from "next/link";
import type { PropertyCategory } from "@/data/properties";

interface CategoryPillProps {
  category: PropertyCategory;
  label?: string;
  href: string;
  active?: boolean;
}

export function CategoryPill({
  category,
  label,
  href,
  active = false,
}: CategoryPillProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={
        active
          ? "whitespace-nowrap px-5 py-2 rounded-full bg-nordic-dark text-white text-sm font-medium shadow-lg shadow-nordic-dark/10 transition-transform hover:-translate-y-0.5 cursor-pointer"
          : "whitespace-nowrap px-5 py-2 rounded-full bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 text-sm font-medium transition-all hover:bg-mosque/5 cursor-pointer"
      }
    >
      {label ?? category}
    </Link>
  );
}
