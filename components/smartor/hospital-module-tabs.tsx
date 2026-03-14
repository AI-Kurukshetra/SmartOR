"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { hasPermission } from "@/lib/smartor/permissions";
import type { AppRole } from "@/lib/validations/smartor";
import { cn } from "@/lib/utils";

type HospitalModuleTabsProps = {
  hospitalSlug: string;
  role: AppRole;
};

type HospitalTabKey = "overview" | "operations" | "scheduling" | "coordination";

const tabMeta: Record<
  HospitalTabKey,
  {
    label: string;
    description: string;
    getHref: (hospitalSlug: string) => string;
  }
> = {
  overview: {
    label: "Overview",
    description:
      "High-level command posture with summary metrics and route guidance for dedicated module workspaces.",
    getHref: (hospitalSlug) => `/hospitals/${hospitalSlug}`,
  },
  operations: {
    label: "Operations",
    description:
      "Focused live operations view for room state, staffing, equipment readiness, and conflict containment.",
    getHref: (hospitalSlug) => `/hospitals/${hospitalSlug}/operations`,
  },
  scheduling: {
    label: "Scheduling",
    description:
      "Dedicated scheduling page for case sequencing, room balancing, and mutation workflows.",
    getHref: (hospitalSlug) => `/hospitals/${hospitalSlug}/scheduling`,
  },
  coordination: {
    label: "Coordination",
    description:
      "Dedicated coordination page for notifications, pre-op readiness, room turnover, documentation, and communication.",
    getHref: (hospitalSlug) => `/hospitals/${hospitalSlug}/coordination`,
  },
};

const tabOrder: HospitalTabKey[] = [
  "overview",
  "operations",
  "scheduling",
  "coordination",
];

export function HospitalModuleTabs({ hospitalSlug, role }: HospitalModuleTabsProps) {
  const selectedSegment = useSelectedLayoutSegment();
  const activeTab = toTabKey(selectedSegment);

  const visibleTabs = tabOrder.filter((tab) => {
    if (tab === "overview") {
      return true;
    }

    return hasPermission(role, tab);
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-4xl text-foreground">{tabMeta[activeTab].label}</h2>
        <p className="mt-2 max-w-4xl text-base leading-7 text-muted">
          {tabMeta[activeTab].description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTabs.map((tab) => (
          <Link
            key={tab}
            href={tabMeta[tab].getHref(hospitalSlug)}
            prefetch={false}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              tab === activeTab
                ? "border-accent/30 bg-accent/10 text-accentStrong"
                : "border-foreground/10 bg-white/70 text-foreground hover:border-accent/25 hover:bg-white",
            )}
          >
            {tabMeta[tab].label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function toTabKey(segment: string | null): HospitalTabKey {
  if (segment === "operations" || segment === "scheduling" || segment === "coordination") {
    return segment;
  }

  return "overview";
}
