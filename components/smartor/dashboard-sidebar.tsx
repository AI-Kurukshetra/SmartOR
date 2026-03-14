"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  Activity,
  BadgeCheck,
  Building2,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  LineChart,
  Shield,
  Stethoscope,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react";

import type { ViewerMembership } from "@/lib/smartor/data";
import { getRoleProfile, hasPermission, type PermissionKey } from "@/lib/smartor/permissions";
import { cn } from "@/lib/utils";
import type { Hospital } from "@/lib/validations/smartor";

type DashboardSidebarProps = {
  hospitals: Hospital[];
  activeMembership: ViewerMembership;
  currentHospitalSlug?: string;
  viewerName?: string | null;
  viewerEmail?: string | null;
  insights?: {
    rooms: number;
    surgeons: number;
    staff: number;
    hospitals: number;
    users: number;
    overviewMetrics: number;
  };
};

type SidebarItem = {
  label: string;
  getHref: (routePrefix: string) => string;
  permission?: PermissionKey;
  icon: ComponentType<{ className?: string }>;
  group?: "core" | "management";
};

const networkSidebarItems: SidebarItem[] = [
  {
    label: "Network overview",
    getHref: () => "/",
    permission: "network_overview",
    icon: LayoutDashboard,
  },
];

const hospitalSidebarItems: SidebarItem[] = [
  {
    label: "Overview",
    getHref: (routePrefix) => routePrefix,
    icon: LayoutDashboard,
    group: "core",
  },
  {
    label: "Operations",
    getHref: (routePrefix) => `${routePrefix}/operations`,
    permission: "operations",
    icon: ClipboardCheck,
    group: "core",
  },
  {
    label: "Ops resources",
    getHref: (routePrefix) => `${routePrefix}/operations-resources`,
    permission: "operations",
    icon: Wrench,
    group: "core",
  },
  {
    label: "Scheduling",
    getHref: (routePrefix) => `${routePrefix}/scheduling`,
    permission: "scheduling",
    icon: CalendarRange,
    group: "core",
  },
  {
    label: "Coordination",
    getHref: (routePrefix) => `${routePrefix}/coordination`,
    permission: "coordination",
    icon: Stethoscope,
    group: "core",
  },
  {
    label: "Financial reporting",
    getHref: (routePrefix) => `${routePrefix}/financial-reporting`,
    permission: "financial_reporting",
    icon: LineChart,
    group: "management",
  },
  {
    label: "Rooms",
    getHref: (routePrefix) => `${routePrefix}/operations#rooms`,
    permission: "manager_tabs",
    icon: Building2,
    group: "management",
  },
  {
    label: "Surgeons",
    getHref: (routePrefix) => `${routePrefix}/operations-resources#surgeons`,
    permission: "manager_tabs",
    icon: Stethoscope,
    group: "management",
  },
  {
    label: "Staff users",
    getHref: (routePrefix) => `${routePrefix}/operations-resources#staff-users`,
    permission: "manager_tabs",
    icon: UsersRound,
    group: "management",
  },
  {
    label: "Hospital overview",
    getHref: (routePrefix) => `${routePrefix}/hospital-overview`,
    permission: "manager_tabs",
    icon: UserRound,
    group: "management",
  },
  {
    label: "Admin controls",
    getHref: (routePrefix) => `${routePrefix}/admin-controls`,
    permission: "admin_controls",
    icon: Shield,
    group: "management",
  },
];

export function DashboardSidebar({
  hospitals,
  activeMembership,
  currentHospitalSlug,
  viewerName,
  viewerEmail,
  insights,
}: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const roleProfile = getRoleProfile(activeMembership.role);
  const activeHospitalSlug = currentHospitalSlug || activeMembership.hospitalSlug || hospitals[0]?.slug;
  const routePrefix = `/hospitals/${activeHospitalSlug}`;
  const isHospitalRoute = pathname.startsWith("/hospitals/");
  const baseSidebarItems = isHospitalRoute ? hospitalSidebarItems : networkSidebarItems;

  const navItems = baseSidebarItems.filter((item) =>
    item.permission ? hasPermission(activeMembership.role, item.permission) : true,
  );
  const coreNavItems = navItems.filter((item) => item.group !== "management");
  const managementNavItems = navItems.filter((item) => item.group === "management");
  const sidebarInsights = insights ?? {
    rooms: 0,
    surgeons: 0,
    staff: 0,
    hospitals: hospitals.length,
    users: 0,
    overviewMetrics: 0,
  };

  useEffect(() => {
    const savedValue = window.localStorage.getItem("smartor.sidebarCollapsed");

    if (savedValue === "true") {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("smartor.sidebarCollapsed", String(isCollapsed));
  }, [isCollapsed]);

  return (
    <aside
      className={cn(
        "relative z-[2] w-full transition-[width] duration-300 lg:sticky lg:top-0 lg:h-screen lg:self-stretch",
        isCollapsed ? "lg:w-[92px]" : "lg:w-[304px]",
      )}
    >
      <button
        type="button"
        onClick={() => setIsCollapsed((previous) => !previous)}
        className="absolute -right-3 top-6 z-20 hidden items-center justify-center rounded-full border border-white/20 bg-foreground/95 p-1.5 text-white shadow-lg transition hover:bg-foreground lg:inline-flex"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>

      <div
        className={cn(
          "command-sidebar-shell rounded-[20px] border border-white/15 p-3 transition-all duration-300 lg:h-full",
          isCollapsed ? "lg:px-2 lg:py-2" : "lg:px-3 lg:py-3",
        )}
      >
        <div
          className={cn(
            "command-sidebar rounded-[16px] border border-white/15 p-4 text-white transition-all duration-300 lg:h-full lg:overflow-y-auto",
            isCollapsed ? "lg:px-2.5 lg:py-3" : "lg:px-3.5 lg:py-4",
          )}
        >
          <div className={cn("space-y-3 border-b border-white/10 pb-4", isCollapsed && "space-y-2 pb-3")}>
            {isCollapsed ? (
              <p className="text-center text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/70">OR</p>
            ) : (
              <>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/70">SmartOR workspace</p>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/65">Operator</p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">{viewerName ?? viewerEmail ?? "SmartOR user"}</p>
                  <p className="mt-1 text-xs text-white/75">{roleProfile.label}</p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/[0.07] px-3 py-2">
                  <p className="text-xs text-white/80">
                    Hospital: <span className="font-semibold text-white">{hospitals.find((item) => item.slug === activeHospitalSlug)?.name ?? "Current workspace"}</span>
                  </p>
                </div>
              </>
            )}
          </div>

          <div className={cn("mt-4 rounded-2xl border border-white/15 bg-white/10 p-3", isCollapsed && "p-2.5")}> 
            {isCollapsed ? (
              <p className="inline-flex w-full items-center justify-center text-white/90">
                <Activity className="size-4" />
              </p>
            ) : (
              <>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/70">Access scope</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/90">
                  <BadgeCheck className="size-4" />
                  {navItems.length} modules available
                </p>
              </>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {!isCollapsed ? (
              <p className="px-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/70">Navigation</p>
            ) : null}

            <nav className="grid gap-3">
              <SidebarGroup
                isCollapsed={isCollapsed}
                title="Clinical"
                items={coreNavItems}
                pathname={pathname}
                routePrefix={routePrefix}
                isHospitalRoute={isHospitalRoute}
              />

              {managementNavItems.length > 0 ? (
                <SidebarGroup
                  isCollapsed={isCollapsed}
                  title="Management"
                  items={managementNavItems}
                  pathname={pathname}
                  routePrefix={routePrefix}
                  isHospitalRoute={isHospitalRoute}
                />
              ) : null}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}

type InsightChipProps = {
  label: string;
  value: string;
};

function InsightChip({ label, value }: InsightChipProps) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.08] px-2.5 py-2">
      <p className="text-[0.58rem] uppercase tracking-[0.18em] text-white/60">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

type SidebarGroupProps = {
  title: string;
  items: SidebarItem[];
  pathname: string;
  routePrefix: string;
  isHospitalRoute: boolean;
  isCollapsed: boolean;
};

function SidebarGroup({ title, items, pathname, routePrefix, isHospitalRoute, isCollapsed }: SidebarGroupProps) {
  return (
    <div
      className={cn(
        "space-y-2 rounded-2xl border border-white/10 bg-white/[0.08] p-2.5",
        isCollapsed && "bg-white/[0.06]",
      )}
    >
      {!isCollapsed ? (
        <p className="px-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/65">{title}</p>
      ) : null}

      <div className="grid gap-2">
        {items.map((item) => {
          const href = item.getHref(routePrefix);
          const hrefPath = href.split("#")[0];
          const Icon = item.icon;
          const isActive =
            hrefPath === "/"
              ? pathname === "/"
              : pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);

          return (
            <Link
              key={item.label}
              href={href}
              prefetch={!isHospitalRoute}
              title={item.label}
              className={cn(
                "inline-flex rounded-2xl border border-white/15 bg-white/[0.1] text-sm font-medium text-white transition hover:border-white/35 hover:bg-white/[0.16]",
                isActive && "border-white/45 bg-white/[0.2] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]",
                isCollapsed
                  ? "items-center justify-center px-2 py-2.5"
                  : "items-center gap-3 px-3 py-2.5",
              )}
            >
              <span className="rounded-xl border border-white/20 bg-white/10 p-1.5 text-white">
                <Icon className="size-4" />
              </span>
              {!isCollapsed ? item.label : <span className="sr-only">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
