import Link from "next/link";

export interface AddPropertyButtonLabels {
  buttonLabel: string;
  [key: string]: string;
}

export function AddPropertyButton({
  labels,
}: {
  labels: AddPropertyButtonLabels;
  categoryLabels?: Record<string, string>;
  amenityLabels?: Record<string, string>;
}) {
  return (
    <Link
      href="/admin/properties/new"
      className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg bg-mosque hover:bg-primary-dark text-white text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
    >
      <span className="material-icons text-lg">add</span>
      <span>{labels.buttonLabel}</span>
    </Link>
  );
}
