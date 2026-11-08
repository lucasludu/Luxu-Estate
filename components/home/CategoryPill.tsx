import type { PropertyCategory } from "@/data/properties";

interface CategoryPillProps {
  category: PropertyCategory;
  active?: boolean;
  onClick?: (category: PropertyCategory) => void;
}

export function CategoryPill({
  category,
  active = false,
  onClick,
}: CategoryPillProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(category)}
      className={
        active
          ? "whitespace-nowrap px-5 py-2 rounded-full bg-nordic-dark text-white text-sm font-medium shadow-lg shadow-nordic-dark/10 transition-transform hover:-translate-y-0.5 cursor-pointer"
          : "whitespace-nowrap px-5 py-2 rounded-full bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 text-sm font-medium transition-all hover:bg-mosque/5 cursor-pointer"
      }
    >
      {category}
    </button>
  );
}

