import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  Building2,
  Cable,
  ClipboardCheck,
  Flame,
  HeartPulse,
  Link2,
  Siren,
  TimerReset,
  WalletCards,
} from "lucide-react";

import { DashboardSidebar } from "@/components/smartor/dashboard-sidebar";
import { MetricCard } from "@/components/smartor/metric-card";
import { OperationsGrid } from "@/components/smartor/operations-grid";
import { Panel } from "@/components/smartor/panel";
import { RoleFocusPanel } from "@/components/smartor/role-focus-panel";
import { ScheduleBoard } from "@/components/smartor/schedule-board";
import { SectionHeading } from "@/components/smartor/section-heading";
import { StatusPill } from "@/components/smartor/status-pill";
import { SupportModules } from "@/components/smartor/support-modules";
import type { ViewerMembership } from "@/lib/smartor/data";
import { hasPermission } from "@/lib/smartor/permissions";
import { formatPercent } from "@/lib/utils";
import type { Hospital, HospitalDashboardData } from "@/lib/validations/smartor";

type HospitalDashboardProps = {
  data: HospitalDashboardData;
  networkHospitals: Hospital[];
  activeMembership: ViewerMembership;
  viewerName?: string | null;
  viewerEmail?: string | null;
  banner?: ReactNode;
};

export function HospitalDashboard({
  data,
  networkHospitals,
  activeMembership,
  viewerName,
  viewerEmail,
  banner,
}: HospitalDashboardProps) {
  const activeCases = data.cases.filter((caseItem) => caseItem.status !== "Waitlist").length;
  const pendingFinancialClearance = data.cases.filter(
    (caseItem) => caseItem.insuranceStatus !== "Authorized",
  ).length;
  const canSeeOperations = hasPermission(activeMembership.role, "operations");
  const canSeeScheduling = hasPermission(activeMembership.role, "scheduling");
  const canSeeCoordination = hasPermission(activeMembership.role, "coordination");
  const canSeeFinancial = hasPermission(activeMembership.role, "financial_reporting");
  const preOpCount = data.cases.filter((item) => item.status === "Pre-op").length;
  const inRoomCount = data.cases.filter((item) => item.status === "In Surgery").length;
  const turnoverCount = data.cases.filter((item) => item.status === "Turnover").length;
  const documentationDue = data.cases.filter(
    (item) => item.documentationStatus !== "Complete",
  ).length;
  const delayedCases = data.cases.filter((item) => item.status === "Delayed").length;
  const emergentCases = data.cases.filter((item) => item.urgency === "Emergent").length;
  const highSeverityConflicts = data.conflicts.filter(
    (conflict) => conflict.severity === "High",
  ).length;
  const readyRooms = data.rooms.filter((room) => room.status === "Available").length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[98rem] flex-col gap-6 px-4 py-8 md:px-8 lg:py-12">
      {banner}
      <div className="dashboard-stage flex flex-col gap-6 lg:flex-row">
        <DashboardSidebar
          hospitals={networkHospitals}
          activeMembership={activeMembership}
          currentHospitalSlug={data.hospital.slug}
          viewerName={viewerName}
          viewerEmail={viewerEmail}
          insights={{
            rooms: data.rooms.length,
            surgeons: data.surgeons.length,
            staff: data.staff.length,
            hospitals: networkHospitals.length,
            users: data.surgeons.length + data.staff.length,
            overviewMetrics: data.overviewMetrics.length,
          }}
        />

        <div className="content-canvas relative z-[1] min-w-0 flex-1 space-y-10 rounded-[30px] border border-white/70 p-4 shadow-[0_18px_48px_rgba(12,43,46,0.12)] md:p-7">
          <section className="grid gap-6 xl:grid-cols-[1.24fr_0.76fr]">
            <Panel className="command-horizon relative overflow-hidden border-transparent bg-mesh">
              <div className="space-y-5">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/75 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent/30 hover:bg-white"
                >
                  <ArrowLeft className="size-4" />
                  Back to network overview
                </Link>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill label={data.hospital.ehrStatus} />
                  <StatusPill label={`${data.hospital.orCount} ORs`} />
                  <StatusPill label={`${data.hospital.city}, ${data.hospital.state}`} />
                </div>
                <div className="space-y-3">
                  <h1 className="font-display text-5xl leading-none text-foreground md:text-6xl">
                    {data.hospital.name}
                  </h1>
                  <p className="max-w-3xl text-base leading-7 text-muted md:text-lg">
                    Real-time OR mission control for room readiness, surgeon flow, staffing
                    coverage, and conflict containment with one shared command view.
                  </p>
                </div>
                <div className="or-pulse-strip grid gap-3 rounded-[26px] p-4 md:grid-cols-2">
                  <SignalTile
                    icon={Siren}
                    label="Open alerts"
                    value={String(data.hospital.alertsOpen)}
                    tone="warning"
                  />
                  <SignalTile
                    icon={AlertTriangle}
                    label="High severity conflicts"
                    value={String(highSeverityConflicts)}
                  />
                  <SignalTile
                    icon={TimerReset}
                    label="Delayed cases"
                    value={String(delayedCases)}
                  />
                  <SignalTile
                    icon={Flame}
                    label="Emergent queue"
                    value={String(emergentCases)}
                  />
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {canSeeOperations ? (
                    <a
                      href="#operations"
                      className="rounded-full border border-foreground/10 bg-white/70 px-4 py-2 font-semibold text-foreground transition hover:border-accent/25 hover:bg-white"
                    >
                      Operations
                    </a>
                  ) : null}
                  {canSeeScheduling ? (
                    <a
                      href="#scheduling"
                      className="rounded-full border border-foreground/10 bg-white/70 px-4 py-2 font-semibold text-foreground transition hover:border-accent/25 hover:bg-white"
                    >
                      Scheduling
                    </a>
                  ) : null}
                  {canSeeCoordination ? (
                    <a
                      href="#coordination"
                      className="rounded-full border border-foreground/10 bg-white/70 px-4 py-2 font-semibold text-foreground transition hover:border-accent/25 hover:bg-white"
                    >
                      Coordination modules
                    </a>
                  ) : null}
                </div>
              </div>
            </Panel>

            <div className="space-y-5">
              <RoleFocusPanel role={activeMembership.role} />
              <Panel
                eyebrow="Network switching"
                title="Other locations"
                description="Central administrators can pivot between hospitals without leaving the command surface."
                action={
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accentStrong">
                    <Link2 className="size-3.5" />
                    Shared controls
                  </div>
                }
              >
                <div className="space-y-3">
                  {networkHospitals.map((hospital) => (
                    <Link
                      key={hospital.id}
                      href={`/hospitals/${hospital.slug}`}
                      className={`flex items-center justify-between gap-3 rounded-3xl border px-4 py-3 transition ${
                        hospital.slug === data.hospital.slug
                          ? "border-accent/25 bg-accent/10 text-accentStrong"
                          : "border-line/60 bg-background/70 text-foreground hover:border-accent/25 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-current/15 bg-white/70 p-2">
                          <Building2 className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{hospital.name}</p>
                          <p className="text-sm opacity-75">
                            {hospital.city}, {hospital.state}
                          </p>
                        </div>
                      </div>
                      <StatusPill label={hospital.ehrStatus} />
                    </Link>
                  ))}
                </div>
              </Panel>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={HeartPulse}
              label="Hospital utilization"
              value={formatPercent(data.hospital.occupancyRate)}
              detail="Average utilization across this hospital’s OR footprint."
            />
            <MetricCard
              icon={ClipboardCheck}
              label="Active cases"
              value={String(activeCases)}
              detail="Scheduled, pre-op, active, turnover, and delayed cases today."
            />
            <MetricCard
              icon={BellRing}
              label="Open alerts"
              value={String(data.hospital.alertsOpen)}
              detail="Notifications and conflict events demanding command-desk attention."
            />
            {canSeeFinancial ? (
              <MetricCard
                icon={Building2}
                label="Financial clearance"
                value={String(pendingFinancialClearance)}
                detail="Cases still waiting for authorization or documentation completion."
              />
            ) : null}
          </section>

          <section>
            <SectionHeading
              eyebrow="Live command rhythm"
              title="OR pulse lane"
              description="Fast situational strip so coordinators can decide in seconds what to pull next."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Panel className="bg-white/80">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Rooms ready now</p>
                <p className="mt-3 font-display text-4xl text-foreground">{readyRooms}</p>
                <p className="mt-2 text-sm text-muted">Available rooms that can absorb the next case.</p>
              </Panel>
              <Panel className="bg-white/80">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Conflict pressure</p>
                <p className="mt-3 font-display text-4xl text-foreground">
                  {highSeverityConflicts}
                </p>
                <p className="mt-2 text-sm text-muted">High-risk collisions requiring immediate triage.</p>
              </Panel>
              <Panel className="bg-white/80">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Delay load</p>
                <p className="mt-3 font-display text-4xl text-foreground">{delayedCases}</p>
                <p className="mt-2 text-sm text-muted">Cases actively flagged as delayed in flow.</p>
              </Panel>
              <Panel className="bg-white/80">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Pending docs / claims</p>
                <p className="mt-3 font-display text-4xl text-foreground">{documentationDue}</p>
                <p className="mt-2 text-sm text-muted">Revenue-completion tasks still open.</p>
              </Panel>
            </div>
          </section>

          <section>
            <SectionHeading
              eyebrow="Daily workflow"
              title="Clinical-to-financial execution lane"
              description="A compact flow view that keeps perioperative and business milestones in one line of sight."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Panel className="bg-white/80">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Pre-op ready</p>
                <p className="mt-3 font-display text-4xl text-foreground">{preOpCount}</p>
                <p className="mt-2 text-sm text-muted">Cases staged for room handoff.</p>
              </Panel>
              <Panel className="bg-white/80">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">In room</p>
                <p className="mt-3 font-display text-4xl text-foreground">{inRoomCount}</p>
                <p className="mt-2 text-sm text-muted">Procedures actively in progress.</p>
              </Panel>
              <Panel className="bg-white/80">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Turnover</p>
                <p className="mt-3 font-display text-4xl text-foreground">{turnoverCount}</p>
                <p className="mt-2 text-sm text-muted">Rooms preparing next case.</p>
              </Panel>
              <Panel className="bg-white/80">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Doc / claims due</p>
                <p className="mt-3 font-display text-4xl text-foreground">{documentationDue}</p>
                <p className="mt-2 text-sm text-muted">Records to finalize after procedure.</p>
              </Panel>
            </div>
          </section>

          {canSeeOperations ? (
            <section id="operations">
              <SectionHeading
                eyebrow="Operations"
                title="Room state, staffing, resources, and conflicts"
                description="This layer covers the real-time OR dashboard, surgeon calendars, equipment readiness, staff assignments, and resolution guidance."
              />
              <OperationsGrid
                rooms={data.rooms}
                cases={data.cases}
                surgeons={data.surgeons}
                staff={data.staff}
                equipment={data.equipment}
                conflicts={data.conflicts}
              />
            </section>
          ) : null}

          {canSeeScheduling ? (
            <section id="scheduling">
              <SectionHeading
                eyebrow="Scheduling"
                title="Interactive case movement"
                description="The schedule board exposes drag-and-drop case movement, emergency placement, duration prediction, and room-level conflict detection."
              />
              <ScheduleBoard
                rooms={data.rooms}
                cases={data.cases}
                surgeons={data.surgeons}
                waitlist={data.waitlist}
              />
            </section>
          ) : null}

          {canSeeCoordination ? (
            <section id="coordination">
              <SectionHeading
                eyebrow="Coordination modules"
                title="Operational support systems"
                description="Notifications, pre-op readiness, room turnover, insurance tracking, preference cards, documentation, waitlists, cost centers, and communication all stay in the same hospital context."
              />
              <SupportModules
                cases={data.cases}
                notifications={data.notifications}
                blockTimes={data.blockTimes}
                waitlist={data.waitlist}
                preferenceCards={data.preferenceCards}
                documents={data.documents}
                costCenters={data.costCenters}
                threads={data.threads}
                surgeons={data.surgeons}
              />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Panel className="bg-white/80">
                  <div className="inline-flex rounded-xl border border-accent/20 bg-accent/10 p-2 text-accentStrong">
                    <Cable className="size-4" />
                  </div>
                  <h4 className="mt-4 font-semibold text-foreground">Integration boundaries</h4>
                  <p className="mt-2 text-sm text-muted">
                    Keep outbound handoffs mapped to EHR, patient messaging, billing, and analytics lanes.
                  </p>
                </Panel>
                <Panel className="bg-white/80">
                  <div className="inline-flex rounded-xl border border-accent/20 bg-accent/10 p-2 text-accentStrong">
                    <WalletCards className="size-4" />
                  </div>
                  <h4 className="mt-4 font-semibold text-foreground">Revenue checkpoint</h4>
                  <p className="mt-2 text-sm text-muted">
                    Pair insurance authorization and documentation completion before closing the case loop.
                  </p>
                </Panel>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}

type SignalTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "neutral" | "warning";
};

function SignalTile({ icon: Icon, label, value, tone = "neutral" }: SignalTileProps) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        tone === "warning"
          ? "border-amber/35 bg-amber/12 text-foreground"
          : "border-line/70 bg-white/72 text-foreground"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.28em] text-muted">
          {label}
        </p>
        <div className="rounded-xl border border-current/15 bg-white/70 p-2 text-accentStrong">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl">{value}</p>
    </div>
  );
}
