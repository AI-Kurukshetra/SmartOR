import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BellRing,
  CalendarRange,
  ClipboardCheck,
  HeartPulse,
  Link2,
  Microscope,
  UserCog,
  Users,
} from "lucide-react";

import { MetricCard } from "@/components/smartor/metric-card";
import { Panel } from "@/components/smartor/panel";
import { RoleFocusPanel } from "@/components/smartor/role-focus-panel";
import { hasPermission, type PermissionKey } from "@/lib/smartor/permissions";
import type { AppRole, OverviewMetric } from "@/lib/validations/smartor";
import { formatPercent } from "@/lib/utils";

import {
  renderNoAccessContext,
  resolveHospitalPageContext,
} from "./context";

type HospitalPageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: HospitalPageProps): Promise<Metadata> {
  const { hospitalSlug } = await params;

  return {
    title: `${hospitalSlug} Command Center`,
    description:
      "Hospital overview with links to dedicated operations, scheduling, and coordination workspaces.",
  };
}

export const dynamic = "force-dynamic";

export default async function HospitalPage({ params }: HospitalPageProps) {
  const { hospitalSlug } = await params;
  const context = await resolveHospitalPageContext(hospitalSlug);

  if (context.mode === "no-access") {
    return renderNoAccessContext(context.viewerName, context.viewerEmail);
  }

  const activeCases = context.data.cases.filter((caseItem) => caseItem.status !== "Waitlist").length;
  const roleOverview = buildRoleOverview({
    role: context.activeMembership.role,
  });
  const basicOverviewMetrics: RoleMetric[] =
    context.data.overviewMetrics.length > 0
      ? context.data.overviewMetrics.map((metric) => ({
          icon: getOverviewMetricIcon(metric.metricKey),
          label: metric.metricLabel,
          value: formatOverviewMetricValue(metric),
          detail: metric.note ?? `Owner: ${metric.owner}`,
        }))
      : [
          {
            icon: HeartPulse,
            label: "Hospital utilization",
            value: formatPercent(context.data.hospital.occupancyRate),
            detail: "Average utilization across this hospital’s OR footprint.",
          },
          {
            icon: ClipboardCheck,
            label: "Active cases",
            value: String(activeCases),
            detail: "Scheduled, pre-op, in-room, turnover, and delayed cases.",
          },
          {
            icon: BellRing,
            label: "Open alerts",
            value: String(context.data.hospital.alertsOpen),
            detail: "Notifications and conflicts requiring immediate review.",
          },
        ];
  const topMetrics: RoleMetric[] = basicOverviewMetrics;
  const moduleCards: ModuleCard[] = [
    {
      title: "Operations board",
      href: `/hospitals/${hospitalSlug}/operations`,
      icon: Microscope,
      permission: "operations",
      detail: `${context.data.rooms.length} rooms · ${context.data.conflicts.length} active conflicts`,
      summary: "Live room state, surgeon coverage, resource readiness, and escalation queue.",
    },
    {
      title: "Scheduling control",
      href: `/hospitals/${hospitalSlug}/scheduling`,
      icon: CalendarRange,
      permission: "scheduling",
      detail: `${context.data.cases.filter((item) => item.status !== "Waitlist").length} active cases · ${context.data.waitlist.length} waitlist`,
      summary: "Case sequencing, drag movement, emergent insertion, and conflict recommendations.",
    },
    {
      title: "Coordination hub",
      href: `/hospitals/${hospitalSlug}/coordination`,
      icon: Users,
      permission: "coordination",
      detail: `${context.data.notifications.length} notifications · ${context.data.threads.length} threads`,
      summary: "Pre-op workflow, documentation, turnover checkpoints, and team communication.",
    },
    {
      title: "Admin controls",
      href: `/hospitals/${hospitalSlug}/admin-controls`,
      icon: UserCog,
      permission: "admin_controls",
      detail: `${context.data.integrationSettings.length} integration boundaries`,
      summary: "Hospital-level access posture, escalation policy, and integration governance.",
    },
  ];
  const visibleModuleCards = moduleCards.filter((card) =>
    hasPermission(context.activeMembership.role, card.permission),
  );
  const commandRouteItems: CommandRouteItem[] = [
    {
      permission: "operations",
      text: "Operations: live room board, staffing, equipment, and conflict queue.",
    },
    {
      permission: "scheduling",
      text: "Scheduling: case sequencing plus create/update/delete case controls.",
    },
    {
      permission: "coordination",
      text: "Coordination: support modules, notifications, documents, and financial checkpoints.",
    },
    {
      permission: "financial_reporting",
      text: "Financial reporting: cost, utilization, and throughput signals by service line.",
    },
    {
      permission: "admin_controls",
      text: "Admin controls: integration boundaries and governance controls.",
    },
  ];
  const commandRoutes = commandRouteItems.filter((item) =>
    hasPermission(context.activeMembership.role, item.permission),
  );

  return (
    <div className="space-y-6">
      <section>
        <Panel
          eyebrow="Mission control"
          title={context.data.hospital.name}
          description={`${context.data.hospital.city}, ${context.data.hospital.state} · ${context.data.hospital.orCount} ORs · EHR ${context.data.hospital.ehrStatus}`}
          className="bg-mesh"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-line/60 bg-white/80 p-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Active surgical load</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {context.data.cases.filter((item) => item.status !== "Waitlist").length}
              </p>
            </div>
            <div className="rounded-2xl border border-line/60 bg-white/80 p-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Delayed cases</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {context.data.cases.filter((item) => item.status === "Delayed").length}
              </p>
            </div>
            <div className="rounded-2xl border border-line/60 bg-white/80 p-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Priority waitlist</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {
                  context.data.waitlist.filter(
                    (entry) => entry.priority === "Urgent" || entry.priority === "Emergent",
                  ).length
                }
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
          />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleModuleCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-[24px] border border-line/70 bg-white/85 p-4 shadow-sm transition hover:border-accent/30 hover:bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex rounded-xl border border-accent/20 bg-accent/10 p-2 text-accentStrong">
                <card.icon className="size-4" />
              </div>
              <ArrowRight className="size-4 text-muted transition group-hover:translate-x-0.5" />
            </div>
            <p className="mt-3 font-semibold text-foreground">{card.title}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{card.detail}</p>
            <p className="mt-2 text-sm text-muted">{card.summary}</p>
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <Panel
          eyebrow="Role command brief"
          title={roleOverview.title}
          description={roleOverview.description}
          action={
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accentStrong">
              <Link2 className="size-3.5" />
              Live role feed
            </span>
          }
          className="bg-white/80"
        >
          <ul className="grid gap-2 text-sm text-muted">
            {roleOverview.highlights.map((highlight) => (
              <li key={highlight} className="rounded-2xl border border-line/60 bg-white/70 px-3 py-2">
                {highlight}
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <RoleFocusPanel role={context.activeMembership.role} />
        <Panel
          eyebrow="Command routing"
          title="Dedicated module views"
          description="Each sidebar tab opens a focused module while keeping this shell persistent."
        >
          <div className="grid gap-2 text-sm text-muted">
            {commandRoutes.map((item) => (
              <p key={item.text}>{item.text}</p>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function getOverviewMetricIcon(metricKey: string): LucideIcon {
  if (metricKey === "hospital_utilization") {
    return HeartPulse;
  }

  if (metricKey === "on_time_starts") {
    return CalendarRange;
  }

  if (metricKey === "open_alerts") {
    return BellRing;
  }

  return ClipboardCheck;
}

function formatOverviewMetricValue(metric: OverviewMetric) {
  if (metric.unit === "percent") {
    return formatPercent(metric.metricValue);
  }

  if (metric.unit === "currency") {
    return `$${metric.metricValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  if (metric.unit === "minutes") {
    return `${metric.metricValue.toFixed(0)} min`;
  }

  return metric.metricValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

type RoleMetric = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
};

type RoleOverview = {
  title: string;
  description: string;
  highlights: string[];
};

type BuildRoleOverviewInput = {
  role: AppRole;
};

type ModuleCard = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission: PermissionKey;
  detail: string;
  summary: string;
};

type CommandRouteItem = {
  permission: PermissionKey;
  text: string;
};

function buildRoleOverview({ role }: BuildRoleOverviewInput): RoleOverview {
  if (role === "hospital_admin") {
    return {
      title: "Hospital governance and escalation posture",
      description: "Administrative command indicators across utilization, policy risk, and integration readiness.",
      highlights: [
        "Monitor conflict severity, delay pressure, and authorization drift across all active rooms.",
        "Track financial closure signals early to avoid end-of-day claims and documentation backlog.",
        "Use Admin Controls for policy, escalation ownership, and integration boundary governance.",
      ],
    };
  }

  if (role === "or_director") {
    return {
      title: "Room flow and same-day throughput control",
      description: "Operational command indicators for real-time room flow, staffing, and bottleneck containment.",
      highlights: [
        "Prioritize high-severity conflicts and delayed-case clusters before cascade effects spread.",
        "Resolve staffing and equipment constraints to protect turnover rhythm.",
        "Keep emergent/urgent placement options visible when schedule pressure rises.",
      ],
    };
  }

  if (role === "scheduler") {
    return {
      title: "Schedule pressure and block-time management",
      description: "Scheduling command indicators for case movement, block usage, and waitlist conversion.",
      highlights: [
        "Balance urgent queue movement with on-time starts and room utilization.",
        "Adjust cases around surgeon availability and room readiness to reduce day-of delays.",
        "Use waitlist pressure and block utilization together for release/reclaim decisions.",
      ],
    };
  }

  if (role === "surgeon") {
    return {
      title: "Procedure readiness and timeline confidence",
      description: "Clinical command indicators centered on surgical case readiness and timeline impact.",
      highlights: [
        "Keep pre-op checklist completion and staffing readiness aligned before room handoff.",
        "Watch delay signals that affect planned procedure start times.",
        "Track unresolved documentation and authorization tasks tied to upcoming cases.",
      ],
    };
  }

  return {
    title: "Assignment readiness and handoff execution",
    description: "Frontline command indicators for room assignments, turnover, and immediate care-team messaging.",
    highlights: [
      "Keep assigned room readiness and turnover checkpoints current for safe case handoffs.",
      "Resolve critical notifications quickly to prevent intra-day room disruption.",
      "Track open team messages tied to active room coordination and patient movement.",
    ],
  };
}
