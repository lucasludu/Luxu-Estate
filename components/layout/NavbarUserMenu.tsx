"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { AuthUserProfile } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { signOutAction } from "@/app/actions/auth";

interface NavbarUserMenuProps {
  initialUser: AuthUserProfile | null;
  profileAriaLabel: string;
  signInLabel: string;
  signOutLabel: string;
  adminDashboardLabel?: string;
}

function mapSupabaseUser(
  user: User,
  previousUser: AuthUserProfile | null
): AuthUserProfile {
  const meta = user.user_metadata;
  let avatarUrl: string | null = null;

  if (
    typeof meta?.avatar_url === "string" &&
    meta.avatar_url.trim().length > 0
  ) {
    avatarUrl = meta.avatar_url.trim();
  } else if (
    typeof meta?.picture === "string" &&
    meta.picture.trim().length > 0
  ) {
    avatarUrl = meta.picture.trim();
  } else if (Array.isArray(user.identities)) {
    for (const identity of user.identities) {
      const data = identity.identity_data;
      if (
        typeof data?.avatar_url === "string" &&
        data.avatar_url.trim().length > 0
      ) {
        avatarUrl = data.avatar_url.trim();
        break;
      }
      if (
        typeof data?.picture === "string" &&
        data.picture.trim().length > 0
      ) {
        avatarUrl = data.picture.trim();
        break;
      }
    }
  }

  const nameCandidates = [
    meta?.full_name,
    meta?.name,
    meta?.user_name,
    meta?.preferred_username,
    user.email?.split("@")[0],
  ];
  let name = "User";
  for (const candidate of nameCandidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      name = candidate.trim();
      break;
    }
  }

  const provider =
    typeof user.app_metadata?.provider === "string"
      ? user.app_metadata.provider
      : user.identities?.[0]?.provider ?? null;

  const sameUser = previousUser && previousUser.id === user.id;

  return {
    id: user.id,
    email: user.email ?? null,
    name: sameUser ? previousUser.name : name,
    avatarUrl: sameUser && previousUser.avatarUrl ? previousUser.avatarUrl : avatarUrl,
    provider,
    role: sameUser ? previousUser.role : "viewer",
    status: sameUser ? previousUser.status : "active",
  };
}

export function NavbarUserMenu({
  initialUser,
  profileAriaLabel,
  signInLabel,
  signOutLabel,
  adminDashboardLabel = "Admin Dashboard",
}: NavbarUserMenuProps) {
  const [authOverride, setAuthOverride] = useState<{
    hasChanged: boolean;
    user: AuthUserProfile | null;
  }>({ hasChanged: false, user: null });
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = authOverride.hasChanged ? authOverride.user : initialUser;

  useEffect(() => {
    let isMounted = true;
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        setAuthOverride((prev) => {
          const baseUser = prev.hasChanged ? prev.user : initialUser;
          return {
            hasChanged: true,
            user: session?.user ? mapSupabaseUser(session.user, baseUser) : null,
          };
        });
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } catch {
      return () => {
        isMounted = false;
      };
    }
  }, [initialUser]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label={signInLabel}
        title={signInLabel}
        className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-1 group"
      >
        <div className="relative w-9 h-9 rounded-full bg-mosque/10 text-mosque flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-mosque transition-all">
          <span className="material-icons text-xl">person_outline</span>
        </div>
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative flex items-center pl-2 border-l border-nordic-dark/10 ml-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={profileAriaLabel}
        aria-expanded={open}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="relative w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all flex items-center justify-center">
          {user.avatarUrl ? (
            <Image
              alt={user.name}
              className="object-cover"
              data-alt="User profile avatar"
              fill
              sizes="36px"
              src={user.avatarUrl}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-sm font-semibold text-nordic-dark uppercase">
              {user.name.charAt(0)}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 rounded-2xl bg-white shadow-soft-hover border border-nordic-dark/10 p-1.5 z-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-nordic-dark/10 mb-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-nordic-dark truncate">
                {user.name}
              </p>
              {user.role === "admin" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-nordic-dark text-white shrink-0">
                  Admin
                </span>
              )}
            </div>
            {user.email && (
              <p className="text-xs text-nordic-muted truncate mt-0.5">
                {user.email}
              </p>
            )}
          </div>

          {user.role === "admin" && (
            <Link
              href="/admin/properties"
              onClick={() => setOpen(false)}
              className="w-full px-3 py-2 rounded-xl text-left text-sm font-medium text-nordic-dark hover:bg-hint-of-green/60 hover:text-mosque transition-colors flex items-center gap-2.5 mb-0.5"
            >
              <span className="material-icons text-base text-mosque">
                admin_panel_settings
              </span>
              <span>{adminDashboardLabel}</span>
            </Link>
          )}

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full px-3 py-2 rounded-xl text-left text-sm font-medium text-nordic-dark hover:bg-mosque/10 hover:text-mosque transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <span className="material-icons text-base">logout</span>
              <span>{signOutLabel}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
