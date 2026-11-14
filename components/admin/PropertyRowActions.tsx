"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deletePropertyAction } from "@/app/actions/admin";
import type { Property } from "@/data/properties";

export interface PropertyRowActionsLabels {
  viewProperty: string;
  editProperty: string;
  deleteProperty: string;
  confirmDeleteTitle: string;
  confirmDeleteDescription: string;
  cancel: string;
  confirmDelete: string;
  saveChanges: string;
  saving: string;
  deleting: string;
  propertyUpdatedSuccess: string;
  propertyDeletedSuccess: string;
  editModalTitle: string;
  fieldTitle: string;
  fieldLocation: string;
  fieldPrice: string;
  fieldCategory: string;
  fieldListingType: string;
  fieldBeds: string;
  fieldBaths: string;
  fieldArea: string;
  fieldGarage: string;
  fieldBadge: string;
  fieldFeatured: string;
  statusActiveSale: string;
  statusActiveRent: string;
}

export function PropertyRowActions({
  property,
  labels,
}: {
  property: Property;
  labels: PropertyRowActionsLabels;
  categoryLabels?: Record<string, string>;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDeleteSubmit = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await deletePropertyAction(property.id);
      if (res.ok) {
        setIsDeleteOpen(false);
      } else {
        setErrorMessage(res.error || "Error al eliminar propiedad");
      }
    });
  };

  return (
    <>
      <div className="inline-flex items-center gap-1.5 bg-gray-50/90 p-1 rounded-xl border border-gray-200/80 shadow-2xs">
        {/* View property */}
        <Link
          href={`/properties/${property.slug}`}
          title={labels.viewProperty}
          className="group/btn relative h-8 px-2.5 rounded-lg bg-white border border-gray-200/80 text-nordic-dark/70 hover:text-mosque hover:border-mosque/40 hover:bg-hint-of-green/40 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-2xs cursor-pointer"
        >
          <span className="material-icons text-[17px] text-nordic-dark/60 group-hover/btn:text-mosque transition-colors">
            visibility
          </span>
          <span className="hidden xl:inline">{labels.viewProperty}</span>
        </Link>

        {/* Edit property -> navigates to /admin/properties/[id]/edit */}
        <Link
          href={`/admin/properties/${property.id}/edit`}
          title={labels.editProperty}
          className="group/btn relative h-8 px-2.5 rounded-lg bg-white border border-gray-200/80 text-nordic-dark/70 hover:text-mosque hover:border-mosque/40 hover:bg-hint-of-green/40 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-2xs cursor-pointer"
        >
          <span className="material-icons text-[17px] text-nordic-dark/60 group-hover/btn:text-mosque transition-colors">
            edit
          </span>
          <span className="hidden xl:inline">{labels.editProperty}</span>
        </Link>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setIsDeleteOpen(true);
          }}
          title={labels.deleteProperty}
          className="group/btn relative h-8 w-8 rounded-lg bg-white border border-gray-200/80 text-nordic-dark/60 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all flex items-center justify-center shadow-2xs cursor-pointer"
        >
          <span className="material-icons text-[17px] group-hover/btn:text-red-600 transition-colors">
            delete_outline
          </span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-nordic-dark/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-nordic-dark/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <span className="material-icons text-xl">delete_outline</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-nordic-dark">
                  {labels.confirmDeleteTitle}
                </h3>
                <p className="text-xs text-nordic-muted">
                  ID: #{property.id.slice(0, 8)}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <span className="material-icons text-sm">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <p className="text-sm text-nordic-dark/80">
              {labels.confirmDeleteDescription.replace("{title}", property.title)}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-nordic-dark border border-nordic-dark/15 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-60"
              >
                {isPending && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isPending ? labels.deleting : labels.confirmDelete}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
