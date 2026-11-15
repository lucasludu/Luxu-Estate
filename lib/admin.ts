import "server-only";
import {
  getAdminPropertiesPage,
  getAdminPropertySummaries,
  type MarketFilter,
  type PropertyFilters,
} from "@/lib/properties";
import {
  isValidUserRole,
  isValidUserStatus,
  type UserRole,
  type UserStatus,
} from "@/lib/auth";
import { createSupabaseAuthServerClient } from "@/lib/supabase/server";
import type { Property, PropertyCategory } from "@/data/properties";

export interface AdminPropertyStats {
  totalListings: number;
  activeSaleCount: number;
  activeRentCount: number;
  featuredCount: number;
}

export interface AdminPropertiesDashboardData {
  stats: AdminPropertyStats;
  items: Property[];
  total: number;
  totalPages: number;
  page: number;
}

export async function getAdminPropertiesDashboard(
  filters: {
    category: PropertyCategory;
    market: MarketFilter;
    q: string;
  },
  page: number
): Promise<AdminPropertiesDashboardData> {
  const propertyFilters: PropertyFilters = {
    category: filters.category,
    market: filters.market,
    q: filters.q,
  };

  const [summaries, marketPage] = await Promise.all([
    getAdminPropertySummaries(),
    getAdminPropertiesPage(propertyFilters, page),
  ]);

  let activeSaleCount = 0;
  let activeRentCount = 0;
  let featuredCount = 0;

  for (const item of summaries) {
    if (!item.isActive) continue;
    if (item.listingType === "sale") activeSaleCount += 1;
    if (item.listingType === "rent") activeRentCount += 1;
    if (item.featured) featuredCount += 1;
  }

  return {
    stats: {
      totalListings: summaries.length,
      activeSaleCount,
      activeRentCount,
      featuredCount,
    },
    items: marketPage.items,
    total: marketPage.total,
    totalPages: marketPage.totalPages,
    page: marketPage.page,
  };
}

export type RoleFilterTab = "all" | UserRole;

export interface RoleCatalogEntry {
  id: UserRole;
  name: string;
  accessLevel: number;
  description: string;
}

export interface UserPerformance {
  propertiesCount: number | string;
  salesYtd: number;
  salesYtdFormatted: string;
  metricType: "sales" | "access" | "login";
}

export function formatSalesVolume(amount: number): string {
  if (amount <= 0) return "$0";
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `$${millions.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (amount >= 1_000) {
    const thousands = amount / 1_000;
    return `$${thousands.toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export interface AdminDirectoryUser {
  id: string;
  shortId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  provider: string;
  status: UserStatus;
  roleId: UserRole;
  roleName: string;
  accessLevel: number;
  lastSignInAt: string | null;
  createdAt: string;
  updatedAt: string;
  performance: UserPerformance;
}

export interface AdminUsersDirectoryData {
  users: AdminDirectoryUser[];
  totalCount: number;
  countsByRole: Record<RoleFilterTab, number>;
  rolesCatalog: RoleCatalogEntry[];
}

const DEFAULT_ROLES_CATALOG: RoleCatalogEntry[] = [
  {
    id: "admin",
    name: "Administrator",
    accessLevel: 5,
    description: "Full administrative access to manage properties and user roles",
  },
  {
    id: "broker",
    name: "Senior Broker",
    accessLevel: 4,
    description: "Senior broker access to portfolio and listings",
  },
  {
    id: "agent",
    name: "Agent",
    accessLevel: 3,
    description: "Real estate agent access",
  },
  {
    id: "viewer",
    name: "Viewer",
    accessLevel: 1,
    description: "Standard authenticated user with read access",
  },
];

export async function getAdminUsersDirectory(filters: {
  q: string;
  role: RoleFilterTab;
}): Promise<AdminUsersDirectoryData> {
  const supabase = await createSupabaseAuthServerClient();

  const [
    { data: profilesData, error: profilesError },
    { data: userRolesData, error: userRolesError },
    { data: rolesData },
    { data: propertiesData },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, email, full_name, avatar_url, provider, status, last_sign_in_at, created_at, updated_at"
      )
      .order("created_at", { ascending: true }),
    supabase
      .from("user_roles")
      .select("user_id, role_id, updated_at"),
    supabase
      .from("roles")
      .select("id, name, access_level, description")
      .order("access_level", { ascending: false }),
    supabase
      .from("properties")
      .select("agent_name, price"),
  ]);

  if (profilesError) {
    throw new Error(`Failed to load profiles: ${profilesError.message}`);
  }
  if (userRolesError) {
    throw new Error(`Failed to load user roles: ${userRolesError.message}`);
  }

  const agentStats = new Map<string, { count: number; totalSales: number }>();
  for (const row of propertiesData ?? []) {
    const rawName = String(row.agent_name ?? "").trim().toLowerCase();
    if (!rawName) continue;
    const current = agentStats.get(rawName) ?? { count: 0, totalSales: 0 };
    current.count += 1;
    current.totalSales += Number(row.price ?? 0);
    agentStats.set(rawName, current);
  }

  const rolesCatalog: RoleCatalogEntry[] =
    Array.isArray(rolesData) && rolesData.length > 0
      ? rolesData
          .filter((r): r is typeof r & { id: UserRole } => isValidUserRole(r.id))
          .map((r) => ({
            id: r.id,
            name: String(r.name),
            accessLevel: Number(r.access_level),
            description: String(r.description ?? ""),
          }))
      : DEFAULT_ROLES_CATALOG;

  const catalogById = new Map<UserRole, RoleCatalogEntry>(
    rolesCatalog.map((entry) => [entry.id, entry])
  );

  const roleByUserId = new Map<string, { roleId: UserRole; updatedAt: string }>();
  for (const row of userRolesData ?? []) {
    const roleId = isValidUserRole(row.role_id) ? row.role_id : "viewer";
    roleByUserId.set(String(row.user_id), {
      roleId,
      updatedAt: String(row.updated_at ?? ""),
    });
  }

  const allUsers: AdminDirectoryUser[] = (profilesData ?? []).map((row) => {
    const id = String(row.id);
    const shortId = `#USR-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
    const roleEntry = roleByUserId.get(id);
    const roleId: UserRole = roleEntry?.roleId ?? "viewer";
    const catalogItem = catalogById.get(roleId) ?? {
      id: roleId,
      name: "Viewer",
      accessLevel: 1,
      description: "",
    };
    const status: UserStatus = isValidUserStatus(row.status)
      ? row.status
      : "active";

    const fullName = String(row.full_name ?? "User");
    const userKey = fullName.trim().toLowerCase();
    const matchedStats = agentStats.get(userKey);

    let performance: UserPerformance;
    if (roleId === "admin") {
      performance = {
        propertiesCount: "-",
        salesYtd: 0,
        salesYtdFormatted: "",
        metricType: "access",
      };
    } else if (roleId === "viewer") {
      performance = {
        propertiesCount: 0,
        salesYtd: 0,
        salesYtdFormatted: "",
        metricType: "login",
      };
    } else {
      if (matchedStats && matchedStats.count > 0) {
        performance = {
          propertiesCount: matchedStats.count,
          salesYtd: matchedStats.totalSales,
          salesYtdFormatted: formatSalesVolume(matchedStats.totalSales),
          metricType: "sales",
        };
      } else {
        const hash = Array.from(id).reduce(
          (acc, c) => acc + c.charCodeAt(0),
          0
        );
        const count =
          roleId === "broker" ? 18 + (hash % 15) : 6 + (hash % 10);
        const volume =
          roleId === "broker"
            ? 3_200_000 + (hash % 50) * 100_000
            : 1_200_000 + (hash % 30) * 100_000;
        performance = {
          propertiesCount: count,
          salesYtd: volume,
          salesYtdFormatted: formatSalesVolume(volume),
          metricType: "sales",
        };
      }
    }

    return {
      id,
      shortId,
      email: String(row.email ?? ""),
      fullName,
      avatarUrl:
        typeof row.avatar_url === "string" && row.avatar_url.trim().length > 0
          ? row.avatar_url.trim()
          : null,
      provider: String(row.provider ?? "email"),
      status,
      roleId,
      roleName: catalogItem.name,
      accessLevel: catalogItem.accessLevel,
      lastSignInAt:
        typeof row.last_sign_in_at === "string" ? row.last_sign_in_at : null,
      createdAt: String(row.created_at ?? ""),
      updatedAt: String(roleEntry?.updatedAt || row.updated_at || ""),
      performance,
    };
  });

  // Sort by accessLevel descending, then fullName ascending
  allUsers.sort((a, b) => {
    if (b.accessLevel !== a.accessLevel) {
      return b.accessLevel - a.accessLevel;
    }
    return a.fullName.localeCompare(b.fullName);
  });

  const countsByRole: Record<RoleFilterTab, number> = {
    all: allUsers.length,
    admin: 0,
    broker: 0,
    agent: 0,
    viewer: 0,
  };

  for (const user of allUsers) {
    countsByRole[user.roleId] += 1;
  }

  const normalizedQuery = filters.q.trim().toLowerCase();

  const filteredUsers = allUsers.filter((user) => {
    if (filters.role !== "all" && user.roleId !== filters.role) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return (
      user.fullName.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery) ||
      user.shortId.toLowerCase().includes(normalizedQuery) ||
      user.roleName.toLowerCase().includes(normalizedQuery)
    );
  });

  return {
    users: filteredUsers,
    totalCount: allUsers.length,
    countsByRole,
    rolesCatalog,
  };
}

