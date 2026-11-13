"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  updateUserRoleAction,
  updateUserStatusAction,
} from "@/app/actions/admin";
import type { UserRole, UserStatus } from "@/lib/auth";

interface RoleOption {
  id: UserRole;
  label: string;
  icon: string;
}

interface UserRoleDropdownProps {
  userId: string;
  currentRole: UserRole;
  currentStatus: UserStatus;
  isCurrentUser: boolean;
  changeRoleLabel: string;
  updatingLabel: string;
  suspendUserLabel: string;
  activateUserLabel: string;
  selfDemoteErrorLabel: string;
  selfSuspendErrorLabel: string;
  roleLabels: Record<UserRole, string>;
}

export function UserRoleDropdown({
  userId,
  currentRole,
  currentStatus,
  isCurrentUser,
  changeRoleLabel,
  updatingLabel,
  suspendUserLabel,
  activateUserLabel,
  selfDemoteErrorLabel,
  selfSuspendErrorLabel,
  roleLabels,
}: UserRoleDropdownProps) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const roleOptions: RoleOption[] = [
    { id: "admin", label: roleLabels.admin, icon: "shield" },
    { id: "broker", label: roleLabels.broker, icon: "business_center" },
    { id: "agent", label: roleLabels.agent, icon: "support_agent" },
    { id: "viewer", label: roleLabels.viewer, icon: "visibility" },
  ];

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  function handleSelectRole(newRole: UserRole) {
    setErrorMessage(null);
    if (newRole === currentRole) {
      setOpen(false);
      return;
    }
    if (isCurrentUser && newRole !== "admin") {
      setErrorMessage(selfDemoteErrorLabel);
      setOpen(false);
      return;
    }

    setOpen(false);
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, newRole);
      if (!result.ok) {
        setErrorMessage(
          result.error === "self_demote_forbidden"
            ? selfDemoteErrorLabel
            : result.error ?? "Error"
        );
      }
    });
  }

  function handleToggleSuspend() {
    setErrorMessage(null);
    const nextStatus: UserStatus =
      currentStatus === "suspended" ? "active" : "suspended";

    if (isCurrentUser && nextStatus === "suspended") {
      setErrorMessage(selfSuspendErrorLabel);
      setOpen(false);
      return;
    }

    setOpen(false);
    startTransition(async () => {
      const result = await updateUserStatusAction(userId, nextStatus);
      if (!result.ok) {
        setErrorMessage(
          result.error === "self_suspend_forbidden"
            ? selfSuspendErrorLabel
            : result.error ?? "Error"
        );
      }
    });
  }

  const isSuspended = currentStatus === "suspended";

  return (
    <div ref={containerRef} className="relative w-full md:w-auto flex flex-col items-end">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setErrorMessage(null);
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        className={
          open
            ? "inline-flex items-center px-4 py-2 bg-mosque text-white shadow-md text-xs font-medium rounded-lg hover:bg-primary-dark focus:outline-none transition-colors w-full md:w-auto justify-center cursor-pointer disabled:opacity-60"
            : "inline-flex items-center px-4 py-2 border border-nordic-dark/15 bg-white shadow-sm text-xs font-medium rounded-lg text-nordic-dark hover:bg-nordic-dark hover:text-white focus:outline-none transition-colors w-full md:w-auto justify-center cursor-pointer disabled:opacity-60"
        }
      >
        <span>{isPending ? updatingLabel : changeRoleLabel}</span>
        <span className="material-icons text-[16px] ml-2">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {errorMessage && (
        <p className="mt-1.5 text-[11px] font-medium text-red-600 text-right max-w-[220px]">
          {errorMessage}
        </p>
      )}

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute top-full right-0 mt-2 w-52 rounded-xl shadow-soft-hover bg-mosque ring-1 ring-black/5 focus:outline-none overflow-hidden z-50 origin-top-right"
        >
          <div className="py-1">
            {roleOptions.map((option) => {
              const isSelected = option.id === currentRole;
              const isDisabledSelfDemote =
                isCurrentUser && option.id !== "admin";

              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitem"
                  disabled={isDisabledSelfDemote}
                  onClick={() => handleSelectRole(option.id)}
                  className={
                    isSelected
                      ? "w-full flex items-center justify-between px-4 py-2.5 text-xs text-white font-semibold bg-white/15 transition-colors cursor-pointer"
                      : "w-full group flex items-center justify-between px-4 py-2.5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  }
                >
                  <span className="flex items-center">
                    <span
                      className={
                        isSelected
                          ? "material-icons text-sm mr-3 text-white"
                          : "material-icons text-sm mr-3 text-white/60 group-hover:text-white"
                      }
                    >
                      {option.icon}
                    </span>
                    <span>{option.label}</span>
                  </span>
                  {isSelected && (
                    <span className="material-icons text-sm text-hint-of-green">
                      check
                    </span>
                  )}
                </button>
              );
            })}

            <div className="border-t border-white/15 my-1" />

            <button
              type="button"
              role="menuitem"
              disabled={isCurrentUser}
              onClick={handleToggleSuspend}
              className="w-full group flex items-center px-4 py-2.5 text-xs text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-icons text-sm mr-3 text-red-300 group-hover:text-red-100">
                {isSuspended ? "check_circle_outline" : "block"}
              </span>
              <span>{isSuspended ? activateUserLabel : suspendUserLabel}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

