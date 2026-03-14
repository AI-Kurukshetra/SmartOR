import { FileText, MessageSquareMore, Smartphone, Wallet } from "lucide-react";

import { Panel } from "@/components/smartor/panel";
import { StatusPill } from "@/components/smartor/status-pill";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type {
  BlockTime,
  CostCenter,
  DocumentRecord,
  MessageThread,
  Notification,
  PreferenceCard,
  Surgeon,
  SurgeryCase,
  WaitlistEntry,
} from "@/lib/validations/smartor";

type SupportModulesProps = {
  cases: SurgeryCase[];
  notifications: Notification[];
  blockTimes: BlockTime[];
  waitlist: WaitlistEntry[];
  preferenceCards: PreferenceCard[];
  documents: DocumentRecord[];
  costCenters: CostCenter[];
  threads: MessageThread[];
  surgeons: Surgeon[];
};

export function SupportModules({
  cases,
  notifications,
  blockTimes,
  waitlist,
  preferenceCards,
  documents,
  costCenters,
  threads,
  surgeons,
}: SupportModulesProps) {
  const surgeonMap = Object.fromEntries(surgeons.map((surgeon) => [surgeon.id, surgeon]));
  const preOpCases = cases.filter((caseItem) =>
    ["Pre-op", "Scheduled", "Waitlist"].includes(caseItem.status),
  );
  const turnoverCases = cases.filter((caseItem) =>
    ["Turnover", "Delayed"].includes(caseItem.status),
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel
        eyebrow="Automated notifications"
        title="Notification feed"
        description="Delay, cancellation, and reschedule awareness for schedulers and clinical teams."
      >
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-3xl border border-line/60 bg-background/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{notification.title}</p>
                  <p className="mt-1 text-sm text-muted">{notification.detail}</p>
                </div>
                <StatusPill label={notification.level} />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-muted">
                {notification.timestamp}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Patient pre-op workflow"
        title="Readiness tracker"
        description="Checklist progress, missing dependencies, and case release confidence before room entry."
      >
        <div className="space-y-3">
          {preOpCases.map((caseItem) => {
            const completeCount = caseItem.preOpChecklist.filter((item) => item.complete).length;

            return (
              <div
                key={caseItem.id}
                className="rounded-3xl border border-line/60 bg-background/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{caseItem.patientName}</p>
                    <p className="text-sm text-muted">{caseItem.procedureName}</p>
                  </div>
                  <StatusPill label={caseItem.status} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted">
                  <span>
                    Checklist {completeCount}/{caseItem.preOpChecklist.length}
                  </span>
                  <StatusPill label={caseItem.documentationStatus} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel
        eyebrow="Room turnover tracking"
        title="Turnover and delay watch"
        description="Cleaning, setup, and readiness pressure between cases."
      >
        <div className="space-y-3">
          {turnoverCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="rounded-3xl border border-line/60 bg-background/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{caseItem.procedureName}</p>
                  <p className="text-sm text-muted">{caseItem.patientName}</p>
                </div>
                <StatusPill label={caseItem.status} />
              </div>
              <p className="mt-3 text-sm text-muted">
                {caseItem.delayReason ?? "Turnover tracking active with no current delay reason."}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Block time management"
        title="Protected service lines"
        description="Block ownership, usage, and remaining capacity for major specialties."
      >
        <div className="space-y-3">
          {blockTimes.map((block) => (
            <div
              key={block.id}
              className="rounded-3xl border border-line/60 bg-background/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{block.serviceLine}</p>
                  <p className="text-sm text-muted">
                    {block.day} · {block.owner}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {block.usedHours.toFixed(1)} / {block.allocatedHours} hours
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Insurance & authorization"
        title="Financial clearance"
        description="Coverage status and pending authorizations before cases roll into the room."
        action={
          <div className="rounded-full border border-amber/20 bg-amber/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber">
            {cases.filter((caseItem) => caseItem.insuranceStatus !== "Authorized").length} action items
          </div>
        }
      >
        <div className="space-y-3">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line/60 bg-background/70 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-foreground">{caseItem.patientName}</p>
                <p className="text-sm text-muted">{caseItem.procedureName}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill label={caseItem.insuranceStatus} />
                <StatusPill label={caseItem.documentationStatus} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Preference cards"
        title="Surgeon setup memory"
        description="Preference cards keep room setup, devices, and positioning consistent across locations."
        action={
          <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accentStrong">
            {preferenceCards.length} active cards
          </div>
        }
      >
        <div className="space-y-3">
          {preferenceCards.map((card) => (
            <div
              key={card.id}
              className="rounded-3xl border border-line/60 bg-background/70 p-4"
            >
              <p className="font-semibold text-foreground">
                {surgeonMap[card.surgeonId]?.name ?? "Unknown surgeon"}
              </p>
              <p className="mt-2 text-sm text-muted">{card.setupNotes}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {card.preferredDevices.map((device) => (
                  <span
                    key={device}
                    className="rounded-full border border-line/60 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted"
                  >
                    {device}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Case documentation portal"
        title="Documents in play"
        description="Clinical notes, packet assets, and images remain visible with the schedule."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-foreground">
            <FileText className="size-3.5" />
            {documents.length} records
          </div>
        }
      >
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="rounded-3xl border border-line/60 bg-background/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{document.title}</p>
                  <p className="text-sm text-muted">
                    {document.type} · {document.owner}
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  {document.updatedAt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Waitlist management"
        title="Backfill candidates"
        description="Cases that can absorb cancellations or newly-opened room capacity."
      >
        <div className="space-y-3">
          {waitlist.map((entry) => (
            <div
              key={entry.id}
              className="rounded-3xl border border-line/60 bg-background/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{entry.patientName}</p>
                  <p className="text-sm text-muted">{entry.procedureName}</p>
                </div>
                <StatusPill label={entry.priority} />
              </div>
              <p className="mt-3 text-sm text-muted">
                {entry.requestedWindow} · {entry.reason}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Cost center tracking"
        title="Department economics"
        description="Utilization, cost per procedure, and revenue per OR day by major service line."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-foreground">
            <Wallet className="size-3.5" />
            {costCenters.length} centers
          </div>
        }
      >
        <div className="space-y-3">
          {costCenters.map((center) => (
            <div
              key={center.id}
              className="rounded-3xl border border-line/60 bg-background/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{center.department}</p>
                  <p className="text-sm text-muted">
                    Utilization {formatPercent(center.utilizationRate)}
                  </p>
                </div>
                <div className="text-right text-sm text-muted">
                  <p>{formatCurrency(center.costPerProcedure)} / procedure</p>
                  <p>{formatCurrency(center.revenuePerOrDay)} / OR day</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Communication hub"
        title="Team threads"
        description="Case-specific discussions stay attached to rooms, events, and escalation decisions."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-foreground">
            <MessageSquareMore className="size-3.5" />
            {threads.length} threads
          </div>
        }
      >
        <div className="space-y-3">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="rounded-3xl border border-line/60 bg-background/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{thread.topic}</p>
                  <p className="text-sm text-muted">
                    {thread.roomLabel} · {thread.participants.join(", ")}
                  </p>
                </div>
                <div className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
                  {thread.unreadCount}
                </div>
              </div>
              <p className="mt-3 rounded-2xl border border-line/60 bg-white/80 px-3 py-2 text-sm text-foreground">
                {thread.lastMessage}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-3xl border border-dashed border-line bg-background/60 p-4 text-sm text-muted">
          <div className="mb-2 flex items-center gap-2 text-foreground">
            <Smartphone className="size-4 text-accentStrong" />
            Mobile access note
          </div>
          The layout stays responsive down to handset widths so charge nurses and
          surgeons can review the same command surface from mobile browsers.
        </div>
      </Panel>
    </div>
  );
}
