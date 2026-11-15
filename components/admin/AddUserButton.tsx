"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createUserAction, type CreateUserInput } from "@/app/actions/admin";
import type { UserRole, UserStatus } from "@/lib/auth";

export interface AddUserButtonLabels {
  buttonLabel: string;
  modalTitle: string;
  fieldFullName: string;
  fieldEmail: string;
  fieldRole: string;
  fieldStatus: string;
  cancel: string;
  saveChanges: string;
  creating: string;
  success: string;
}

export function AddUserButton({
  labels,
  roleLabels,
  statusLabels,
}: {
  labels: AddUserButtonLabels;
  roleLabels: Record<UserRole, string>;
  statusLabels: Record<UserStatus, string>;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("agent");
  const [status, setStatus] = useState<UserStatus>("active");

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setRole("agent");
    setStatus("active");
    setErrorMessage(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: CreateUserInput = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
      status,
    };

    startTransition(async () => {
      const res = await createUserAction(payload);
      if (res.ok) {
        setSuccessMessage(labels.success);
        router.refresh();
        setTimeout(() => {
          setSuccessMessage(null);
          setIsOpen(false);
          resetForm();
        }, 800);
      } else {
        setErrorMessage(res.error || "Error al agregar usuario");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetForm();
          setIsOpen(true);
        }}
        className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg bg-mosque hover:bg-primary-dark text-white text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
      >
        <span className="material-icons text-lg">add</span>
        <span>{labels.buttonLabel}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-nordic-dark/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-nordic-dark/10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-nordic-dark/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-hint-of-green text-mosque flex items-center justify-center">
                  <span className="material-icons text-xl">person_add</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-nordic-dark">
                    {labels.modalTitle}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-nordic-dark/40 hover:text-nordic-dark p-1.5 rounded-lg hover:bg-nordic-dark/5 transition-colors cursor-pointer"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <span className="material-icons text-base">error_outline</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <span className="material-icons text-base">check_circle</span>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                  {labels.fieldFullName} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                  {labels.fieldEmail} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena.rostova@luxeestate.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                    {labels.fieldRole}
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark bg-white focus:outline-none focus:ring-2 focus:ring-mosque"
                  >
                    <option value="agent">{roleLabels.agent}</option>
                    <option value="broker">{roleLabels.broker}</option>
                    <option value="admin">{roleLabels.admin}</option>
                    <option value="viewer">{roleLabels.viewer}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-dark/70 mb-1.5">
                    {labels.fieldStatus}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm text-nordic-dark bg-white focus:outline-none focus:ring-2 focus:ring-mosque"
                  >
                    <option value="active">{statusLabels.active}</option>
                    <option value="away">{statusLabels.away}</option>
                    <option value="inactive">{statusLabels.inactive}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-nordic-dark/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-nordic-dark/70 hover:text-nordic-dark hover:bg-nordic-dark/5 transition-colors cursor-pointer"
                >
                  {labels.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-mosque hover:bg-primary-dark text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <span className="material-icons text-base animate-spin">
                        progress_activity
                      </span>
                      <span>{labels.creating}</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons text-base">check</span>
                      <span>{labels.saveChanges}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

