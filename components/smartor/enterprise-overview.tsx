import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  Cable,
  CircleAlert,
  Clock3,
  HandCoins,
  Layers3,
  Link2,
  ShieldPlus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { MetricCard } from "@/components/smartor/metric-card";
import { DashboardSidebar } from "@/components/smartor/dashboard-sidebar";
import { Panel } from "@/components/smartor/panel";
import { RoleFocusPanel } from "@/components/smartor/role-focus-panel";
import { SectionHeading } from "@/components/smartor/section-heading";
import { StatusPill } from "@/components/smartor/status-pill";
import { type EnterpriseSnapshot, smartorFeatureGroups } from "@/lib/smartor/mock-data";
import { hasPermission } from "@/lib/smartor/permissions";
import { formatPercent } from "@/lib/utils";
import type { ViewerMembership } from "@/lib/smartor/data";
import type { Hospital } from "@/lib/validations/smartor";

type EnterpriseOverviewProps = {
  hospitals: Hospital[];
  snapshot: EnterpriseSnapshot;
  activeMembership: ViewerMembership;
  viewerName?: string | null;
  viewerEmail?: string | null;
  banner?: ReactNode;
};

export function EnterpriseOverview({
  hospitals,
  snapshot,
  activeMembership,
  viewerName,
  viewerEmail,
  banner,
}: EnterpriseOverviewProps) {
  const canSeeNetwork = hasPermission(activeMembership.role, "network_overview");
  const commandCenterHref = `/hospitals/${activeMembership.hospitalSlug}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[98rem] flex-col gap-6 px-4 py-8 md:px-8 lg:py-10">
      {banner}
      <div className="dashboard-stage flex flex-col gap-6 lg:flex-row">
        <DashboardSidebar
          hospitals={hospitals}
          activeMembership={activeMembership}
          viewerName={viewerName}
          viewerEmail={viewerEmail}
        />

        <div className="content-canvas relative z-[1] min-w-0 flex-1 space-y-10 rounded-[20px] border border-white/80 p-4 shadow-[0_14px_36px_rgba(10,34,60,0.1)] md:p-7">
          <section className="grid gap-6 xl:grid-cols-[1.28fr_0.72fr]">
            <Panel className="overflow-hidden bg-mesh">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white/70 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accentStrong">
                  <Stethoscope className="size-4" />
                  {canSeeNetwork
                    ? "Multi-hospital surgical command center"
                    : "Role-centered surgical command center"}
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-4xl font-display text-4xl leading-tight text-foreground md:text-6xl">
                    {canSeeNetwork
                      ? "SmartOR turns every operating room into a visible, schedulable network surface."
                      : "Your role dashboard focuses on the modules you can directly execute."}
                  </h1>
                  <p className="max-w-3xl text-base leading-7 text-muted md:text-lg">
                    {canSeeNetwork
                      ? "This first implementation pass translates the PRD into a live multi-hospital Next.js shell: network overview, hospital-level command dashboards, drag scheduling, and the supporting operational modules needed to express all core features."
                      : "You can still access your hospital command center, live room operations, and coordination modules. Network-wide posture metrics remain restricted to leadership roles."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={commandCenterHref} className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold">
                    Open command center
                    <ArrowRight className="size-4" />
                  </Link>
                  {canSeeNetwork ? (
                    <Link
                      href="#coverage"
                      className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:translate-x-0.5 hover:border-accent/30 hover:bg-white"
                    >
                      See feature coverage
                      <Link2 className="size-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </Panel>
            <div className="space-y-5">
              <RoleFocusPanel role={activeMembership.role} />
              {canSeeNetwork ? (
                <Panel
                  eyebrow="Network posture"
                  title="Cascade Surgical Alliance"
                  description="Each hospital keeps its own schedule and operational state while the central desk monitors throughput, alerts, and EHR readiness."
                  className="bg-white/80"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-line/70 bg-background/70 p-4">
                      <p className="text-sm text-muted">Connected hospitals</p>
                      <p className="mt-3 font-display text-4xl text-foreground">
                        {snapshot.connectedHospitals}/{hospitals.length}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-line/70 bg-background/70 p-4">
                      <p className="text-sm text-muted">Rooms monitored</p>
                      <p className="mt-3 font-display text-4xl text-foreground">
                        {snapshot.totalOperatingRooms}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-line/70 bg-background/70 p-4">
                      <p className="text-sm text-muted">Active cases</p>
                      <p className="mt-3 font-display text-4xl text-foreground">
                        {snapshot.activeCases}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-line/70 bg-background/70 p-4">
                      <p className="text-sm text-muted">Open alerts</p>
                      <p className="mt-3 font-display text-4xl text-foreground">
                        {snapshot.openAlerts}
                      </p>
                    </div>
                  </div>
                </Panel>
              ) : null}
            </div>
          </section>

          {canSeeNetwork ? (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={Layers3}
                label="Network utilization"
                value={formatPercent(snapshot.networkUtilization)}
                detail="Average OR utilization across all hospitals in the network."
              />
              <MetricCard
                icon={Clock3}
                label="First-case starts"
                value={formatPercent(snapshot.firstCaseStarts)}
                detail="On-time starts benchmark for the current operating day."
              />
              <MetricCard
                icon={CircleAlert}
                label="Emergency queue"
                value={String(snapshot.emergentCases)}
                detail="Emergent and urgent queue pressure visible to the command desk."
              />
              <MetricCard
                icon={ShieldCheck}
                label="Adoption score"
                value={formatPercent(
                  Math.round(
                    hospitals.reduce((total, hospital) => total + hospital.adoptionScore, 0) /
                      hospitals.length,
                  ),
                )}
                detail="Operational adoption confidence based on scheduler and staff usage."
              />
            </section>
          ) : null}

          <section>
            <SectionHeading
              eyebrow="Multi-hospital"
              title="Hospital-level command centers"
              description="Each location has its own real-time board, room allocation logic, staffing context, and downstream operational modules."
            />
            <div className="grid gap-5 lg:grid-cols-2">
              {hospitals.map((hospital) => (
                  <Panel key={hospital.id} className="border-foreground/8 bg-white/88 transition hover:-translate-y-0.5 hover:shadow-halo">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-accent/15 bg-accent/10 p-3 text-accentStrong">
                          <Building2 className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-2xl text-foreground">
                            {hospital.name}
                          </h3>
                          <p className="text-sm text-muted">
                            {hospital.city}, {hospital.state}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusPill label={hospital.ehrStatus} />
                        <StatusPill label={`${hospital.orCount} ORs`} />
                      </div>
                    </div>
                    <Link
                      href={`/hospitals/${hospital.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent/30 hover:bg-white"
                    >
                      Open
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-line/60 bg-background/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted">
                        Utilization
                      </p>
                      <p className="mt-2 font-display text-3xl text-foreground">
                        {formatPercent(hospital.occupancyRate)}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-line/60 bg-background/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted">
                        On-time starts
                      </p>
                      <p className="mt-2 font-display text-3xl text-foreground">
                        {formatPercent(hospital.onTimeStarts)}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-line/60 bg-background/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted">
                        Average turnover
                      </p>
                      <p className="mt-2 font-display text-3xl text-foreground">
                        {hospital.turnoverMinutes}m
                      </p>
                    </div>
                    <div className="rounded-3xl border border-line/60 bg-background/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted">
                        Open alerts
                      </p>
                      <p className="mt-2 font-display text-3xl text-foreground">
                        {hospital.alertsOpen}
                      </p>
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
          </section>

          {canSeeNetwork ? (
            <section id="coverage">
              <SectionHeading
                eyebrow="Coverage map"
                title="Core feature coverage in this build"
                description="The implementation starts with a command-center shell that maps every PRD core feature into either an interactive workflow or a dedicated operational module."
              />
              <div className="grid gap-5 xl:grid-cols-3">
                {smartorFeatureGroups.map((group) => (
                  <Panel
                    key={group.title}
                    eyebrow={group.title}
                    title={`${group.items.length} feature surfaces`}
                    description={group.description}
                    className="bg-white/75"
                  >
                    <ul className="grid gap-2">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="rounded-2xl border border-line/60 bg-background/65 px-3 py-2 text-sm text-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Panel>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <SectionHeading
              eyebrow="Platform capabilities"
              title="Feature lanes inspired by modern ASC software"
              description="Scheduling, coordination, financial workflow, and integrations are presented as one operating system instead of disconnected tools."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Panel className="bg-white/80">
                <div className="inline-flex rounded-xl border border-accent/20 bg-accent/10 p-2 text-accentStrong">
                  <Layers3 className="size-4" />
                </div>
                <h4 className="mt-4 font-semibold text-foreground">Case orchestration</h4>
                <p className="mt-2 text-sm text-muted">
                  Drag scheduling, room balancing, and urgent placement in one command flow.
                </p>
              </Panel>
              <Panel className="bg-white/80">
                <div className="inline-flex rounded-xl border border-accent/20 bg-accent/10 p-2 text-accentStrong">
                  <HandCoins className="size-4" />
                </div>
                <h4 className="mt-4 font-semibold text-foreground">Revenue visibility</h4>
                <p className="mt-2 text-sm text-muted">
                  Financial readiness and authorization bottlenecks surfaced before day-of-surgery.
                </p>
              </Panel>
              <Panel className="bg-white/80">
                <div className="inline-flex rounded-xl border border-accent/20 bg-accent/10 p-2 text-accentStrong">
                  <Cable className="size-4" />
                </div>
                <h4 className="mt-4 font-semibold text-foreground">Interoperability layer</h4>
                <p className="mt-2 text-sm text-muted">
                  EHR and downstream system boundaries mapped for cleaner data handoff.
                </p>
              </Panel>
              <Panel className="bg-white/80">
                <div className="inline-flex rounded-xl border border-accent/20 bg-accent/10 p-2 text-accentStrong">
                  <ShieldPlus className="size-4" />
                </div>
                <h4 className="mt-4 font-semibold text-foreground">Governed access</h4>
                <p className="mt-2 text-sm text-muted">
                  Role-level controls ensure every team sees only the modules they can execute.
                </p>
              </Panel>
            </div>
          </section>

          <section>
            <Panel
              eyebrow="Integration-ready"
              title="Connected stack posture"
              description="SmartOR can be positioned as a hub between clinical, billing, and reporting systems."
              className="bg-gradient-to-r from-white via-white/95 to-surface"
              action={
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accentStrong">
                  <Sparkles className="size-3.5" />
                  roadmap view
                </div>
              }
            >
              <div className="flex flex-wrap gap-2 text-sm">
                {["EHR", "Scheduling", "Patient Engagement", "Claims", "Analytics", "BI Exports"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-line/70 bg-background/70 px-3 py-1.5 text-foreground"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </Panel>
          </section>
        </div>
      </div>
    </main>
  );
}
