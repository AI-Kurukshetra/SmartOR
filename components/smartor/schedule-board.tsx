"use client";

import { startTransition, useState } from "react";
import { GripVertical, MoveRight, Siren } from "lucide-react";

import { Panel } from "@/components/smartor/panel";
import { StatusPill } from "@/components/smartor/status-pill";
import { addMinutesToTime, cn, formatMinutes, toTimeMinutes } from "@/lib/utils";
import type {
  OperatingRoom,
  Surgeon,
  SurgeryCase,
  WaitlistEntry,
} from "@/lib/validations/smartor";

type ScheduleBoardProps = {
  rooms: OperatingRoom[];
  cases: SurgeryCase[];
  surgeons: Surgeon[];
  waitlist: WaitlistEntry[];
};

export function ScheduleBoard({
  rooms,
  cases,
  surgeons,
  waitlist,
}: ScheduleBoardProps) {
  const [localCases, setLocalCases] = useState<SurgeryCase[]>(cases);
  const [draggingCaseId, setDraggingCaseId] = useState<string | null>(null);
  const [boardNote, setBoardNote] = useState(
    "Drag scheduled and waiting cases between rooms to simulate rescheduling decisions.",
  );

  const surgeonMap = Object.fromEntries(surgeons.map((surgeon) => [surgeon.id, surgeon]));
  const queuedCases = localCases.filter((caseItem) => caseItem.operatingRoomId === null);
  const conflictRecommendations = buildConflictRecommendations(localCases, rooms, surgeonMap);

  function moveCase(targetRoomId: string | null) {
    if (!draggingCaseId) {
      return;
    }

    const caseToMove = localCases.find((caseItem) => caseItem.id === draggingCaseId);

    if (!caseToMove) {
      return;
    }

    startTransition(() => {
      setLocalCases((currentCases) =>
        currentCases.map((caseItem) =>
          caseItem.id === draggingCaseId
            ? {
                ...caseItem,
                operatingRoomId: targetRoomId,
                status: targetRoomId ? "Scheduled" : "Waitlist",
                delayReason: targetRoomId ? null : "Returned to waitlist for manual review",
              }
            : caseItem,
        ),
      );
    });

    const targetRoom = rooms.find((room) => room.id === targetRoomId);
    setBoardNote(
      targetRoom
        ? `${caseToMove.patientName} moved into ${targetRoom.name}. Check room and surgeon conflicts below.`
        : `${caseToMove.patientName} returned to the unscheduled queue.`,
    );
    setDraggingCaseId(null);
  }

  function autoPlaceEmergencyCase() {
    const emergencyCase = localCases.find(
      (caseItem) =>
        caseItem.operatingRoomId === null && caseItem.urgency === "Emergent",
    );

    if (!emergencyCase) {
      setBoardNote("No emergent cases are waiting for assignment.");
      return;
    }

    const preferredRoom =
      rooms.find((room) => room.status === "Available") ??
      rooms.find((room) => room.status === "Turnover") ??
      rooms[0];

    if (!preferredRoom) {
      setBoardNote("No room is currently available for automatic placement.");
      return;
    }

    startTransition(() => {
      setLocalCases((currentCases) =>
        currentCases.map((caseItem) =>
          caseItem.id === emergencyCase.id
            ? {
                ...caseItem,
                operatingRoomId: preferredRoom.id,
                status: "Scheduled",
                delayReason: null,
              }
            : caseItem,
        ),
      );
    });

    setBoardNote(
      `${emergencyCase.patientName} placed into ${preferredRoom.name} as the best immediate fit.`,
    );
  }

  function resetBoard() {
    setLocalCases(cases);
    setDraggingCaseId(null);
    setBoardNote(
      "Board reset to the original operating day plan from the mock command center dataset.",
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
        <StatusPill label="Drag active" />
        <p>{boardNote}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={autoPlaceEmergencyCase}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-accentStrong"
        >
          <Siren className="size-4" />
          Auto-place emergent case
        </button>
        <button
          type="button"
          onClick={resetBoard}
          className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/75 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent/25 hover:bg-white"
        >
          Reset board
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <Panel
          eyebrow="Emergency & waitlist management"
          title="Unscheduled queue"
          description="Emergency inserts and waitlist candidates sit here until the desk places them into a room."
          className="h-full"
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => moveCase(null)}
        >
          <div className="space-y-3">
            {queuedCases.map((caseItem) => (
              <CaseCard
                key={caseItem.id}
                caseItem={caseItem}
                surgeonName={surgeonMap[caseItem.surgeonId]?.name ?? "Unassigned surgeon"}
                onDragStart={setDraggingCaseId}
                isDragging={draggingCaseId === caseItem.id}
              />
            ))}
            <div className="rounded-[28px] border border-dashed border-line bg-background/55 p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted">
                Waitlist entries
              </p>
              <div className="mt-3 space-y-2">
                {waitlist.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-line/60 bg-white/80 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {entry.patientName}
                      </p>
                      <StatusPill label={entry.priority} />
                    </div>
                    <p className="mt-1 text-sm text-muted">{entry.procedureName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted">
                      {entry.requestedWindow} · {entry.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-4 md:grid-cols-2">
          {rooms.map((room) => {
            const roomCases = localCases
              .filter((caseItem) => caseItem.operatingRoomId === room.id)
              .toSorted((left, right) => toTimeMinutes(left.scheduledStart) - toTimeMinutes(right.scheduledStart));

            const roomConflictCount = countRoomConflicts(roomCases);

            return (
              <Panel
                key={room.id}
                eyebrow={room.serviceLine}
                title={room.name}
                description={`${roomCases.length} scheduled case${roomCases.length === 1 ? "" : "s"} · ${room.turnoverMinutes}m turnover target`}
                className={cn(
                  "min-h-[18rem] border-dashed bg-white/80 transition",
                  draggingCaseId ? "border-accent/35" : "",
                )}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => moveCase(room.id)}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <StatusPill label={room.status} />
                  <div className="text-xs uppercase tracking-[0.24em] text-muted">
                    {roomConflictCount} room conflict{roomConflictCount === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="space-y-3">
                  {roomCases.length ? (
                    roomCases.map((caseItem) => (
                      <CaseCard
                        key={caseItem.id}
                        caseItem={caseItem}
                        surgeonName={
                          surgeonMap[caseItem.surgeonId]?.name ?? "Unassigned surgeon"
                        }
                        onDragStart={setDraggingCaseId}
                        isDragging={draggingCaseId === caseItem.id}
                        hasConflict={hasSurgeonConflict(caseItem, localCases)}
                      />
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-line/80 bg-background/65 p-4 text-sm text-muted">
                      Drop a case here to simulate reassignment into this room.
                    </div>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      </div>

      <Panel
        eyebrow="Conflict resolution engine"
        title="Auto-detected scheduling collisions"
        description="Conflict recommendations are generated from room overlap, surgeon overlap, and unassigned urgent pressure."
      >
        <div className="space-y-3">
          {conflictRecommendations.length ? (
            conflictRecommendations.map((item) => (
              <div key={item.id} className="rounded-2xl border border-line/70 bg-white/85 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted">{item.detail}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
                      Recommendation: {item.recommendation}
                    </p>
                  </div>
                  <StatusPill label={item.severity} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-line/70 bg-white/85 p-4 text-sm text-muted">
              No active scheduling collisions detected. Continue monitoring room and surgeon load.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

type CaseCardProps = {
  caseItem: SurgeryCase;
  surgeonName: string;
  onDragStart: (caseId: string | null) => void;
  isDragging: boolean;
  hasConflict?: boolean;
};

function CaseCard({
  caseItem,
  surgeonName,
  onDragStart,
  isDragging,
  hasConflict = false,
}: CaseCardProps) {
  const checklistCompleteCount = caseItem.preOpChecklist.filter((item) => item.complete).length;
  const canDrag = !["In Surgery", "Turnover"].includes(caseItem.status);

  return (
    <div
      draggable={canDrag}
      onDragStart={() => {
        if (canDrag) {
          onDragStart(caseItem.id);
        }
      }}
      onDragEnd={() => onDragStart(null)}
      className={cn(
        "rounded-[24px] border border-line/70 bg-background/80 p-4 shadow-sm transition",
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        isDragging ? "opacity-50" : "hover:border-accent/25 hover:bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{caseItem.patientName}</p>
          <p className="text-sm text-muted">{caseItem.procedureName}</p>
        </div>
        <GripVertical className="size-4 text-muted" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill label={caseItem.urgency} />
        <StatusPill label={caseItem.insuranceStatus} />
        {hasConflict ? <StatusPill label="Delayed" /> : null}
      </div>

      <div className="mt-4 grid gap-2 text-sm text-muted">
        <div className="flex items-center justify-between gap-2">
          <span>{surgeonName}</span>
          <span>
            {caseItem.scheduledStart}
            <MoveRight className="mx-1 inline size-3" />
            {addMinutesToTime(caseItem.scheduledStart, caseItem.predictedMinutes)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Predicted duration</span>
          <span>{formatMinutes(caseItem.predictedMinutes)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Pre-op readiness</span>
          <span>
            {checklistCompleteCount}/{caseItem.preOpChecklist.length}
          </span>
        </div>
      </div>
    </div>
  );
}

function countRoomConflicts(roomCases: SurgeryCase[]) {
  let totalConflicts = 0;

  for (let index = 0; index < roomCases.length - 1; index += 1) {
    const currentCase = roomCases[index];
    const nextCase = roomCases[index + 1];

    if (
      toTimeMinutes(addMinutesToTime(currentCase.scheduledStart, currentCase.predictedMinutes)) >
      toTimeMinutes(nextCase.scheduledStart)
    ) {
      totalConflicts += 1;
    }
  }

  return totalConflicts;
}

function hasSurgeonConflict(
  currentCase: SurgeryCase,
  allCases: SurgeryCase[],
) {
  return allCases.some((caseItem) => {
    if (caseItem.id === currentCase.id || caseItem.surgeonId !== currentCase.surgeonId) {
      return false;
    }

    const currentEnd = toTimeMinutes(
      addMinutesToTime(currentCase.scheduledStart, currentCase.predictedMinutes),
    );
    const compareEnd = toTimeMinutes(
      addMinutesToTime(caseItem.scheduledStart, caseItem.predictedMinutes),
    );

    return (
      toTimeMinutes(currentCase.scheduledStart) < compareEnd &&
      currentEnd > toTimeMinutes(caseItem.scheduledStart)
    );
  });
}

type ResolutionItem = {
  id: string;
  severity: "Low" | "Medium" | "High";
  title: string;
  detail: string;
  recommendation: string;
};

function buildConflictRecommendations(
  cases: SurgeryCase[],
  rooms: OperatingRoom[],
  surgeonMap: Record<string, Surgeon>,
) {
  const recommendations: ResolutionItem[] = [];
  const roomMap = Object.fromEntries(rooms.map((room) => [room.id, room]));

  for (const room of rooms) {
    const roomCases = cases
      .filter((caseItem) => caseItem.operatingRoomId === room.id)
      .toSorted(
        (left, right) => toTimeMinutes(left.scheduledStart) - toTimeMinutes(right.scheduledStart),
      );

    for (let index = 0; index < roomCases.length - 1; index += 1) {
      const currentCase = roomCases[index];
      const nextCase = roomCases[index + 1];
      const currentEnd = toTimeMinutes(
        addMinutesToTime(currentCase.scheduledStart, currentCase.predictedMinutes),
      );

      if (currentEnd > toTimeMinutes(nextCase.scheduledStart)) {
        recommendations.push({
          id: `room-${room.id}-${currentCase.id}-${nextCase.id}`,
          severity: "High",
          title: `${room.name} overlap: ${currentCase.patientName} -> ${nextCase.patientName}`,
          detail: `${room.name} has an estimated overlap between ${currentCase.scheduledStart} and ${nextCase.scheduledStart}.`,
          recommendation: "Re-slot the second case or move one case to an available/turnover room.",
        });
      }
    }
  }

  const scheduledCases = cases.filter((caseItem) => caseItem.operatingRoomId !== null);
  for (let index = 0; index < scheduledCases.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < scheduledCases.length; compareIndex += 1) {
      const leftCase = scheduledCases[index];
      const rightCase = scheduledCases[compareIndex];

      if (leftCase.surgeonId !== rightCase.surgeonId) {
        continue;
      }

      const leftStart = toTimeMinutes(leftCase.scheduledStart);
      const rightStart = toTimeMinutes(rightCase.scheduledStart);
      const leftEnd = toTimeMinutes(addMinutesToTime(leftCase.scheduledStart, leftCase.predictedMinutes));
      const rightEnd = toTimeMinutes(
        addMinutesToTime(rightCase.scheduledStart, rightCase.predictedMinutes),
      );

      if (leftStart < rightEnd && leftEnd > rightStart) {
        const surgeonName = surgeonMap[leftCase.surgeonId]?.name ?? "Assigned surgeon";
        const leftRoom = leftCase.operatingRoomId ? roomMap[leftCase.operatingRoomId]?.name : "Unassigned";
        const rightRoom = rightCase.operatingRoomId
          ? roomMap[rightCase.operatingRoomId]?.name
          : "Unassigned";

        recommendations.push({
          id: `surgeon-${leftCase.surgeonId}-${leftCase.id}-${rightCase.id}`,
          severity: "High",
          title: `Surgeon overlap: ${surgeonName}`,
          detail: `${surgeonName} is double-booked across ${leftRoom} and ${rightRoom}.`,
          recommendation: "Reassign one case surgeon or move one case to a different time block.",
        });
      }
    }
  }

  const unassignedPriorityCases = cases.filter(
    (caseItem) => caseItem.operatingRoomId === null && caseItem.urgency !== "Elective",
  );

  if (unassignedPriorityCases.length) {
    recommendations.push({
      id: "priority-waitlist-pressure",
      severity: unassignedPriorityCases.some((caseItem) => caseItem.urgency === "Emergent")
        ? "High"
        : "Medium",
      title: "Urgent/emergent queue pressure",
      detail: `${unassignedPriorityCases.length} urgent or emergent case(s) remain unassigned.`,
      recommendation: "Use Auto-place or release a low-priority room block for immediate insertion.",
    });
  }

  return recommendations;
}
