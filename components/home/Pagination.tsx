import Link from "next/link";
import { buildHomeHref, type HomeQuery } from "@/lib/home-query";
import { formatMessage, type Dictionary } from "@/i18n";

interface PaginationProps {
  query: HomeQuery;
  totalPages: number;
  dict: Dictionary;
}

function getPageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const items: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("…");
    items.push(p);
  });
  return items;
}

const baseButton =
  "min-w-10 h-10 px-3 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all";
const idle =
  "bg-white border border-nordic-dark/10 text-nordic-dark hover:border-mosque hover:text-mosque";
const disabled =
  "bg-white border border-nordic-dark/5 text-nordic-muted/50 pointer-events-none";

export function Pagination({ query, totalPages, dict }: PaginationProps) {
  if (totalPages <= 1) return null;
  const { page } = query;
  const hrefFor = (p: number) => buildHomeHref({ ...query, page: p });

  return (
    <nav
      aria-label={dict.pagination.ariaLabel}
      className="mt-12 flex items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          className={`${baseButton} ${idle} gap-1`}
        >
          <span className="material-icons text-base">chevron_left</span>
          {dict.pagination.previous}
        </Link>
      ) : (
        <span aria-disabled="true" className={`${baseButton} ${disabled} gap-1`}>
          <span className="material-icons text-base">chevron_left</span>
          {dict.pagination.previous}
        </span>
      )}

      {getPageItems(page, totalPages).map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-nordic-muted">
            …
          </span>
        ) : item === page ? (
          <span
            key={item}
            aria-current="page"
            className={`${baseButton} bg-nordic-dark text-white shadow-sm`}
          >
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-label={formatMessage(dict.pagination.pageAriaLabel, {
              page: item,
            })}
            className={`${baseButton} ${idle}`}
          >
            {item}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          className={`${baseButton} ${idle} gap-1`}
        >
          {dict.pagination.next}
          <span className="material-icons text-base">chevron_right</span>
        </Link>
      ) : (
        <span aria-disabled="true" className={`${baseButton} ${disabled} gap-1`}>
          {dict.pagination.next}
          <span className="material-icons text-base">chevron_right</span>
        </span>
      )}
    </nav>
  );
}
