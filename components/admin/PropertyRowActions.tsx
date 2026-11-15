"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { togglePropertyActiveAction } from "@/app/actions/admin";
import type { Property } from "@/data/properties";

export interface PropertyRowActionsLabels {
  viewProperty: string;
  editProperty: string;
  deleteProperty: string;
  activateProperty?: string;
  confirmDeleteTitle: string;
  confirmDeleteDescription: string;
  confirmActivateTitle?: string;
  confirmActivateDescription?: string;
  cancel: string;
  confirmDelete: string;
  confirmActivate?: string;
  saveChanges: string;
  saving: string;
  deleting: string;
  activating?: string;
  propertyUpdatedSuccess: string;
  propertyDeletedSuccess: string;
  propertyActivatedSuccess?: string;
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
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isActive = property.isActive !== false;

  const handleToggleStatusSubmit = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await togglePropertyActiveAction(property.id, !isActive);
      if (res.ok) {
        setIsConfirmOpen(false);
        router.refresh();
      } else {
        setErrorMessage(
          res.error || "Error al actualizar el estado de la propiedad"
        );
      }
    });
  };

  return (
    <>
      <div className="inline-flex items-center gap-1.5 bg-gray-50/90 p-1 rounded-xl border border-gray-200/80 shadow-2xs">
        {/* View property (only active properties are publicly visible on /properties/[slug]) */}
        {isActive && (
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
        )}

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

        {/* Deactivate / Reactivate button */}
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setIsConfirmOpen(true);
          }}
          title={
            isActive
              ? labels.deleteProperty
              : labels.activateProperty || "Reactivar"
          }
          className={
            isActive
              ? "group/btn relative h-8 w-8 rounded-lg bg-white border border-gray-200/80 text-nordic-dark/60 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all flex items-center justify-center shadow-2xs cursor-pointer"
              : "group/btn relative h-8 px-2.5 rounded-lg bg-white border border-mosque/30 text-mosque hover:bg-hint-of-green/50 transition-all flex items-center justify-center gap-1 text-xs font-semibold shadow-2xs cursor-pointer"
          }
        >
          <span
            className={
              isActive
                ? "material-icons text-[17px] group-hover/btn:text-amber-600 transition-colors"
                : "material-icons text-[17px] text-mosque transition-colors"
            }
          >
            {isActive ? "visibility_off" : "check_circle"}
          </span>
          {!isActive && (
            <span className="hidden xl:inline">
              {labels.activateProperty || "Reactivar"}
            </span>
          )}
        </button>
      </div>

      {/* Deactivate / Reactivate Confirmation Modal */}
      {isConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-nordic-dark/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-nordic-dark/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div
                className={
                  isActive
                    ? "h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0"
                    : "h-10 w-10 rounded-full bg-hint-of-green flex items-center justify-center text-mosque shrink-0"
                }
              >
                <span className="material-icons text-xl">
                  {isActive ? "visibility_off" : "check_circle"}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-nordic-dark">
                  {isActive
                    ? labels.confirmDeleteTitle
                    : labels.confirmActivateTitle || "¿Reactivar propiedad?"}
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
              {(isActive
                ? labels.confirmDeleteDescription
                : labels.confirmActivateDescription ||
                  '"{title}" volverá a estar activa.'
              ).replace("{title}", property.title)}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-nordic-dark border border-nordic-dark/15 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                onClick={handleToggleStatusSubmit}
                disabled={isPending}
                className={
                  isActive
                    ? "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer disabled:opacity-60"
                    : "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-mosque hover:bg-primary-dark text-white transition-colors cursor-pointer disabled:opacity-60"
                }
              >
                {isPending && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>
                  {isPending
                    ? isActive
                      ? labels.deleting
                      : labels.activating || labels.saving
                    : isActive
                    ? labels.confirmDelete
                    : labels.confirmActivate ||
                      labels.activateProperty ||
                      "Reactivar"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
