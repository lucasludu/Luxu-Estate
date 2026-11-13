import Image from "next/image";
import Link from "next/link";
import { formatMessage } from "@/i18n";
import { getServerI18n } from "@/i18n/server";
import {
  getAdminUsersDirectory,
  type RoleFilterTab,
} from "@/lib/admin";
import {
  isValidUserRole,
  requireAdminUser,
  type UserRole,
  type UserStatus,
} from "@/lib/auth";
import { UserRoleDropdown } from "./UserRoleDropdown";

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseUsersSearchParams(params: RawSearchParams): {
  q: string;
  role: RoleFilterTab;
} {
  const q = (first(params.q) ?? "").slice(0, 100).trim();
  const roleParam = first(params.role);
  const role: RoleFilterTab = isValidUserRole(roleParam) ? roleParam : "all";
  return { q, role };
}

function buildAdminUsersHref(params: { q?: string; role?: RoleFilterTab }) {
  const search = new URLSearchParams();
  if (params.role && params.role !== "all") {
    search.set("role", params.role);
  }
  if (params.q && params.q.trim()) {
    search.set("q", params.q.trim());
  }
  const qs = search.toString();
  return qs ? `/admin/users?${qs}` : "/admin/users";
}

function formatDateDisplay(iso: string | null, locale: string): string {
  if (!iso) return "—";
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

function getRoleBadgeClasses(roleId: UserRole) {
  switch (roleId) {
    case "admin":
      return "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-nordic-dark text-white";
    case "broker":
      return "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-mosque/15 text-mosque";
    case "agent":
      return "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-nordic-dark";
    case "viewer":
    default:
      return "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-nordic-muted";
  }
}

function getStatusIndicator(status: UserStatus) {
  switch (status) {
    case "active":
      return {
        dotClass: "bg-green-400",
        icon: "check_circle",
        iconClass: "text-mosque",
      };
    case "away":
      return {
        dotClass: "bg-yellow-400",
        icon: "schedule",
        iconClass: "text-amber-500",
      };
    case "suspended":
      return {
        dotClass: "bg-red-500",
        icon: "block",
        iconClass: "text-red-500",
      };
    case "inactive":
    default:
      return {
        dotClass: "bg-gray-400",
        icon: "remove_circle_outline",
        iconClass: "text-gray-400",
      };
  }
}

export function AdminUsersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-nordic-dark/10" />
          <div className="h-4 w-80 rounded bg-nordic-dark/10" />
        </div>
        <div className="h-10 w-72 rounded-lg bg-nordic-dark/10" />
      </div>
      <div className="h-10 w-full border-b border-nordic-dark/10" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-white border border-gray-100 p-5"
          />
        ))}
      </div>
    </div>
  );
}

export async function AdminUsersScreen({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const [resolvedParams, { locale, dict }, currentAdmin] = await Promise.all([
    searchParams,
    getServerI18n(),
    requireAdminUser("/admin/users"),
  ]);

  const filters = parseUsersSearchParams(resolvedParams);
  const directory = await getAdminUsersDirectory(filters);

  const tabs: { id: RoleFilterTab; label: string; count: number }[] = [
    {
      id: "all",
      label: dict.admin.users.tabAll,
      count: directory.countsByRole.all,
    },
    {
      id: "agent",
      label: dict.admin.users.tabAgents,
      count: directory.countsByRole.agent,
    },
    {
      id: "broker",
      label: dict.admin.users.tabBrokers,
      count: directory.countsByRole.broker,
    },
    {
      id: "admin",
      label: dict.admin.users.tabAdmins,
      count: directory.countsByRole.admin,
    },
    {
      id: "viewer",
      label: dict.admin.users.tabViewers,
      count: directory.countsByRole.viewer,
    },
  ];

  const roleLabels: Record<UserRole, string> = {
    admin: dict.admin.users.roles.admin,
    broker: dict.admin.users.roles.broker,
    agent: dict.admin.users.roles.agent,
    viewer: dict.admin.users.roles.viewer,
  };

  const statusLabels: Record<UserStatus, string> = {
    active: dict.admin.users.statuses.active,
    away: dict.admin.users.statuses.away,
    inactive: dict.admin.users.statuses.inactive,
    suspended: dict.admin.users.statuses.suspended,
  };

  return (
    <div>
      {/* Header */}
      <header className="w-full pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-nordic-dark">
              {dict.admin.users.title}
            </h1>
            <p className="text-nordic-muted mt-1 text-sm sm:text-base">
              {dict.admin.users.subtitle}
            </p>
          </div>

          <form
            action="/admin/users"
            method="GET"
            className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
          >
            {filters.role !== "all" && (
              <input type="hidden" name="role" value={filters.role} />
            )}
            <div className="relative group w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-nordic-dark/40 group-focus-within:text-mosque text-xl">
                  search
                </span>
              </div>
              <input
                type="search"
                name="q"
                defaultValue={filters.q}
                placeholder={dict.admin.users.searchPlaceholder}
                className="block w-full pl-10 pr-4 py-2.5 border border-nordic-dark/10 rounded-lg bg-white text-nordic-dark shadow-soft placeholder:text-nordic-dark/35 focus:outline-none focus:ring-2 focus:ring-mosque transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2.5 border border-mosque text-sm font-medium rounded-lg text-mosque bg-white hover:bg-mosque hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              <span className="material-icons text-lg mr-1.5">search</span>
              <span>{dict.hero.searchButton}</span>
            </button>
          </form>
        </div>

        {/* Role Filter Tabs */}
        <div className="mt-8 flex gap-6 border-b border-nordic-dark/10 overflow-x-auto hide-scroll">
          {tabs.map((tab) => {
            const active = filters.role === tab.id;
            return (
              <Link
                key={tab.id}
                href={buildAdminUsersHref({ q: filters.q, role: tab.id })}
                className={
                  active
                    ? "pb-3 text-sm font-semibold text-mosque border-b-2 border-mosque inline-flex items-center gap-2 whitespace-nowrap"
                    : "pb-3 text-sm font-medium text-nordic-dark/60 hover:text-nordic-dark transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                }
              >
                <span>{tab.label}</span>
                <span
                  className={
                    active
                      ? "px-2 py-0.5 rounded-full text-[11px] font-semibold bg-hint-of-green text-mosque"
                      : "px-2 py-0.5 rounded-full text-[11px] font-medium bg-nordic-dark/5 text-nordic-muted"
                  }
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Column Headers */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-nordic-dark/50 mb-3">
        <div className="col-span-4">{dict.admin.users.colUserDetails}</div>
        <div className="col-span-3">{dict.admin.users.colRoleStatus}</div>
        <div className="col-span-3">{dict.admin.users.colAccessInfo}</div>
        <div className="col-span-2 text-right">{dict.admin.users.colActions}</div>
      </div>

      {/* User Directory Cards */}
      <div className="space-y-4">
        {directory.users.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
            <span className="material-icons text-4xl text-nordic-dark/25 mb-2">
              person_off
            </span>
            <p className="text-base font-medium text-nordic-dark">
              {dict.admin.users.noUsersFound}
            </p>
          </div>
        ) : (
          directory.users.map((userItem) => {
            const isCurrentUser = userItem.id === currentAdmin.id;
            const statusInfo = getStatusIndicator(userItem.status);

            return (
              <div
                key={userItem.id}
                className={
                  isCurrentUser
                    ? "group relative bg-hint-of-green rounded-xl p-5 shadow-sm border border-mosque/15 hover:shadow-soft flex flex-col md:grid md:grid-cols-12 gap-4 items-center transition-all"
                    : "group relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:bg-hint-of-green/60 hover:shadow-soft flex flex-col md:grid md:grid-cols-12 gap-4 items-center transition-all"
                }
              >
                {/* User Details */}
                <div className="col-span-12 md:col-span-4 flex items-center w-full">
                  <div className="relative flex-shrink-0">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-nordic-dark/10 border-2 border-white flex items-center justify-center">
                      {userItem.avatarUrl ? (
                        <Image
                          src={userItem.avatarUrl}
                          alt={userItem.fullName}
                          fill
                          sizes="48px"
                          referrerPolicy="no-referrer"
                          className={
                            userItem.status === "suspended"
                              ? "object-cover grayscale"
                              : "object-cover"
                          }
                        />
                      ) : (
                        <span className="text-base font-bold text-nordic-dark uppercase">
                          {userItem.fullName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${statusInfo.dotClass}`}
                    />
                  </div>

                  <div className="ml-4 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-nordic-dark truncate">
                        {userItem.fullName}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-mosque text-white shrink-0">
                          {dict.admin.users.youBadge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-nordic-dark/70 truncate">
                      {userItem.email}
                    </div>
                    <div className="mt-1 text-[10px] px-2 py-0.5 inline-block bg-white/70 rounded text-nordic-dark/60 font-mono">
                      ID: {userItem.shortId}
                    </div>
                  </div>
                </div>

                {/* Role & Status */}
                <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
                  <span className={getRoleBadgeClasses(userItem.roleId)}>
                    {roleLabels[userItem.roleId]}
                  </span>
                  <div className="flex items-center text-xs text-nordic-dark/70">
                    <span
                      className={`material-icons text-[14px] mr-1 ${statusInfo.iconClass}`}
                    >
                      {statusInfo.icon}
                    </span>
                    <span>{statusLabels[userItem.status]}</span>
                  </div>
                </div>

                {/* Access & Activity */}
                <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-nordic-dark/50">
                      {dict.admin.users.accessLevelLabel}
                    </div>
                    <div className="text-sm font-semibold text-nordic-dark">
                      {formatMessage(dict.admin.users.accessLevelValue, {
                        level: userItem.accessLevel,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-nordic-dark/50">
                      {dict.admin.users.lastLoginLabel}
                    </div>
                    <div className="text-sm font-semibold text-nordic-dark flex items-center gap-1.5">
                      <span>
                        {formatDateDisplay(userItem.lastSignInAt, locale)}
                      </span>
                      <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-nordic-dark/5 text-nordic-muted">
                        {userItem.provider}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions (Change Role Dropdown) */}
                <div className="col-span-12 md:col-span-2 w-full flex justify-end relative">
                  <UserRoleDropdown
                    userId={userItem.id}
                    currentRole={userItem.roleId}
                    currentStatus={userItem.status}
                    isCurrentUser={isCurrentUser}
                    changeRoleLabel={dict.admin.users.changeRole}
                    updatingLabel={dict.admin.users.updating}
                    suspendUserLabel={dict.admin.users.suspendUser}
                    activateUserLabel={dict.admin.users.activateUser}
                    selfDemoteErrorLabel={dict.admin.users.selfDemoteError}
                    selfSuspendErrorLabel={dict.admin.users.selfSuspendError}
                    roleLabels={roleLabels}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer summary */}
      <div className="mt-8 pt-4 border-t border-nordic-dark/10 flex items-center justify-between text-sm text-nordic-muted">
        <p>
          {formatMessage(dict.admin.users.showingUsers, {
            shown: directory.users.length,
            total: directory.totalCount,
          })}
        </p>
      </div>
    </div>
  );
}

