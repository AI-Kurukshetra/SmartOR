"use client";

import { startTransition, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Activity, AlertTriangle, Clock3, PencilLine, Plus, Save, Sparkles, Trash2, X } from "lucide-react";

import {
  createConflictAction,
  createOperatingRoomAction,
  deleteConflictAction,
  deleteOperatingRoomAction,
  updateConflictAction,
  updateOperatingRoomAction,
} from "@/app/actions/operations-crud";
import {
  createSurgeryCaseAction,
  deleteSurgeryCaseAction,
  updateSurgeryCaseAction,
} from "@/app/actions/scheduling";
import { Panel } from "@/components/smartor/panel";
import { StatusPill } from "@/components/smartor/status-pill";
import { addMinutesToTime, formatMinutes, formatPercent } from "@/lib/utils";
import type { Conflict, OperatingRoom, Surgeon, SurgeryCase } from "@/lib/validations/smartor";

type OperationsGridProps = {
  hospitalSlug?: string;
  rooms: OperatingRoom[];
  cases: SurgeryCase[];
  surgeons: Surgeon[];
  staff?: unknown[];
  equipment?: unknown[];
  conflicts: Conflict[];
  canMutate?: boolean;
};

const roomStatusOptions: OperatingRoom["status"][] = ["Available", "Pre-op", "In Surgery", "Turnover", "Delayed"];
const conflictSeverityOptions: Conflict["severity"][] = ["Low", "Medium", "High"];
const caseStatusOptions: SurgeryCase["status"][] = ["Scheduled", "Pre-op", "Ready", "In Surgery", "Turnover", "Delayed", "Waitlist"];
const urgencyOptions: SurgeryCase["urgency"][] = ["Elective", "Urgent", "Emergent"];
const liveCaseStatuses = new Set<SurgeryCase["status"]>(["Pre-op", "Ready", "In Surgery", "Turnover", "Delayed"]);

export function OperationsGrid({
  hospitalSlug = "",
  rooms,
  cases,
  surgeons,
  conflicts,
  canMutate = false,
}: OperationsGridProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  const [isCreateConflictOpen, setIsCreateConflictOpen] = useState(false);
  const [editingConflictId, setEditingConflictId] = useState<string | null>(null);

  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);

  const caseMap = Object.fromEntries(cases.map((caseItem) => [caseItem.id, caseItem]));
  const surgeonMap = Object.fromEntries(surgeons.map((surgeon) => [surgeon.id, surgeon]));
  const roomMap = Object.fromEntries(rooms.map((room) => [room.id, room]));

  const activeCases = cases.filter((caseItem) => caseItem.status === "In Surgery").length;
  const urgentCases = cases.filter((caseItem) => caseItem.urgency === "Urgent").length;
  const turnoverRooms = rooms.filter((room) => room.status === "Turnover").length;
  const waitingCases = cases.filter((caseItem) => caseItem.status === "Waitlist").length;

  const sortedRooms = useMemo(() => [...rooms].sort((a, b) => a.name.localeCompare(b.name)), [rooms]);
  const sortedConflicts = useMemo(() => [...conflicts].sort((a, b) => a.severity.localeCompare(b.severity)), [conflicts]);
  const sortedCases = useMemo(() => [...cases].sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart)), [cases]);
  const roomLiveCases = useMemo(() => {
    const casesByRoom = new Map<string, SurgeryCase[]>();

    for (const caseItem of sortedCases) {
      if (!caseItem.operatingRoomId) continue;
      const queued = casesByRoom.get(caseItem.operatingRoomId) ?? [];
      queued.push(caseItem);
      casesByRoom.set(caseItem.operatingRoomId, queued);
    }

    const assignments = new Map<string, { current: SurgeryCase | undefined; upcoming: SurgeryCase | undefined }>();

    for (const room of sortedRooms) {
      const roomCases = casesByRoom.get(room.id) ?? [];
      const current = roomCases.find((caseItem) => liveCaseStatuses.has(caseItem.status));
      const upcoming = roomCases.find(
        (caseItem) => caseItem.status === "Scheduled" && caseItem.id !== current?.id,
      );
      assignments.set(room.id, { current, upcoming });
    }

    return assignments;
  }, [sortedCases, sortedRooms]);
  const currentProcedures = useMemo(
    () => sortedCases.filter((caseItem) => liveCaseStatuses.has(caseItem.status)),
    [sortedCases],
  );
  const upcomingCases = useMemo(
    () => sortedCases.filter((caseItem) => caseItem.status === "Scheduled"),
    [sortedCases],
  );

  const editingRoom = useMemo(() => sortedRooms.find((room) => room.id === editingRoomId) ?? null, [editingRoomId, sortedRooms]);
  const editingConflict = useMemo(
    () => sortedConflicts.find((conflict) => conflict.id === editingConflictId) ?? null,
    [editingConflictId, sortedConflicts],
  );
  const editingCase = useMemo(() => sortedCases.find((caseItem) => caseItem.id === editingCaseId) ?? null, [editingCaseId, sortedCases]);

  async function handleCreateRoom(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to create rooms.");
    setIsSaving(true);
    const result = await createOperatingRoomAction({
      hospitalSlug,
      name: String(formData.get("name") ?? ""),
      serviceLine: String(formData.get("serviceLine") ?? ""),
      status: String(formData.get("status") ?? "Available") as OperatingRoom["status"],
      utilizationRate: Number(formData.get("utilizationRate") ?? 0),
      turnoverMinutes: Number(formData.get("turnoverMinutes") ?? 0),
    });
    setIsSaving(false);
    setMessage(result.ok ? "Room created." : result.error ?? "Failed to create room.");
    if (result.ok) {
      setIsCreateRoomOpen(false);
      router.refresh();
    }
  }

  async function handleUpdateRoom(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to update rooms.");
    setIsSaving(true);
    const result = await updateOperatingRoomAction({
      hospitalSlug,
      roomId: String(formData.get("roomId") ?? ""),
      name: String(formData.get("name") ?? ""),
      serviceLine: String(formData.get("serviceLine") ?? ""),
      status: String(formData.get("status") ?? "Available") as OperatingRoom["status"],
      utilizationRate: Number(formData.get("utilizationRate") ?? 0),
      turnoverMinutes: Number(formData.get("turnoverMinutes") ?? 0),
    });
    setIsSaving(false);
    setMessage(result.ok ? "Room updated." : result.error ?? "Failed to update room.");
    if (result.ok) {
      setEditingRoomId(null);
      router.refresh();
    }
  }

  async function handleDeleteRoom(roomId: string) {
    if (!canMutate) return setMessage("You do not have permission to delete rooms.");
    setIsSaving(true);
    const result = await deleteOperatingRoomAction({ hospitalSlug, roomId });
    setIsSaving(false);
    setMessage(result.ok ? "Room deleted." : result.error ?? "Failed to delete room.");
    if (result.ok) {
      setEditingRoomId(null);
      router.refresh();
    }
  }

  async function handleCreateConflict(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to create conflicts.");
    setIsSaving(true);
    const result = await createConflictAction({
      hospitalSlug,
      severity: String(formData.get("severity") ?? "Low") as Conflict["severity"],
      title: String(formData.get("title") ?? ""),
      detail: String(formData.get("detail") ?? ""),
      recommendation: String(formData.get("recommendation") ?? ""),
    });
    setIsSaving(false);
    setMessage(result.ok ? "Conflict created." : result.error ?? "Failed to create conflict.");
    if (result.ok) {
      setIsCreateConflictOpen(false);
      router.refresh();
    }
  }

  async function handleUpdateConflict(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to update conflicts.");
    setIsSaving(true);
    const result = await updateConflictAction({
      hospitalSlug,
      conflictId: String(formData.get("conflictId") ?? ""),
      severity: String(formData.get("severity") ?? "Low") as Conflict["severity"],
      title: String(formData.get("title") ?? ""),
      detail: String(formData.get("detail") ?? ""),
      recommendation: String(formData.get("recommendation") ?? ""),
    });
    setIsSaving(false);
    setMessage(result.ok ? "Conflict updated." : result.error ?? "Failed to update conflict.");
    if (result.ok) {
      setEditingConflictId(null);
      router.refresh();
    }
  }

  async function handleDeleteConflict(conflictId: string) {
    if (!canMutate) return setMessage("You do not have permission to delete conflicts.");
    setIsSaving(true);
    const result = await deleteConflictAction({ hospitalSlug, conflictId });
    setIsSaving(false);
    setMessage(result.ok ? "Conflict deleted." : result.error ?? "Failed to delete conflict.");
    if (result.ok) {
      setEditingConflictId(null);
      router.refresh();
    }
  }

  async function handleCreateCase(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to create cases.");
    setIsSaving(true);
    const result = await createSurgeryCaseAction({
      hospitalSlug,
      patientName: String(formData.get("patientName") ?? ""),
      procedureName: String(formData.get("procedureName") ?? ""),
      surgeonId: String(formData.get("surgeonId") ?? ""),
      operatingRoomId: normalizeNullable(formData.get("operatingRoomId")),
      scheduledStart: String(formData.get("scheduledStart") ?? ""),
      predictedMinutes: Number(formData.get("predictedMinutes") ?? 0),
      urgency: String(formData.get("urgency") ?? "Elective") as SurgeryCase["urgency"],
    });
    setIsSaving(false);
    setMessage(result.ok ? "Case created." : result.error ?? "Failed to create case.");
    if (result.ok) {
      setIsCreateCaseOpen(false);
      router.refresh();
    }
  }

  async function handleUpdateCase(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to update cases.");
    setIsSaving(true);
    const result = await updateSurgeryCaseAction({
      hospitalSlug,
      caseId: String(formData.get("caseId") ?? ""),
      operatingRoomId: normalizeNullable(formData.get("operatingRoomId")),
      scheduledStart: String(formData.get("scheduledStart") ?? ""),
      predictedMinutes: Number(formData.get("predictedMinutes") ?? 0),
      status: String(formData.get("status") ?? "Scheduled") as SurgeryCase["status"],
      urgency: String(formData.get("urgency") ?? "Elective") as SurgeryCase["urgency"],
    });
    setIsSaving(false);
    setMessage(result.ok ? "Case updated." : result.error ?? "Failed to update case.");
    if (result.ok) {
      setEditingCaseId(null);
      router.refresh();
    }
  }

  async function handleDeleteCase(caseId: string) {
    if (!canMutate) return setMessage("You do not have permission to delete cases.");
    setIsSaving(true);
    const result = await deleteSurgeryCaseAction({ hospitalSlug, caseId });
    setIsSaving(false);
    setMessage(result.ok ? "Case deleted." : result.error ?? "Failed to delete case.");
    if (result.ok) {
      setEditingCaseId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <Panel
        id="rooms"
        eyebrow="Real-time OR dashboard"
        title="Operations command board"
        description="Focused view for live room status, active conflict triage, and current case movement."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active in-surgery" value={String(activeCases)} detail={`${rooms.length} rooms monitored`} icon={<Activity className="size-4 text-accentStrong" />} />
          <MetricCard label="Turnover rooms" value={String(turnoverRooms)} detail="Watch sterilization and setup timing" icon={<Clock3 className="size-4 text-accentStrong" />} />
          <MetricCard label="Urgent load" value={String(urgentCases)} detail="Priority cases requiring sequence control" icon={<AlertTriangle className="size-4 text-accentStrong" />} />
          <MetricCard label="Waitlist pressure" value={String(waitingCases)} detail="Cases pending room capacity" icon={<Sparkles className="size-4 text-accentStrong" />} />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={!canMutate || isSaving}
            onClick={() => setIsCreateRoomOpen(true)}
            className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold disabled:opacity-60"
          >
            <Plus className="size-3.5" />
            Add room
          </button>
        </div>

        <div className="mt-3 table-shell">
          <table className="min-w-full text-sm">
            <thead className="bg-background/70 text-xs uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Room</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Active case</th>
                <th className="px-4 py-3 text-left">Surgeon / Window</th>
                <th className="px-4 py-3 text-left">Utilization</th>
                <th className="px-4 py-3 text-left">Turnover</th>
                <th className="px-4 py-3 text-left">Next case</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRooms.map((room) => {
                const livePair = roomLiveCases.get(room.id);
                const activeCase = livePair?.current ?? (room.activeCaseId ? caseMap[room.activeCaseId] : undefined);
                const nextCase = livePair?.upcoming ?? (room.nextCaseId ? caseMap[room.nextCaseId] : undefined);
                const activeSurgeon = activeCase && activeCase.surgeonId ? surgeonMap[activeCase.surgeonId] : undefined;

                return (
                  <tr key={room.id} className="border-t border-line/50 align-top text-foreground">
                    <td className="px-4 py-3"><p className="font-semibold">{room.name}</p><p className="text-xs text-muted">{room.serviceLine}</p></td>
                    <td className="px-4 py-3"><StatusPill label={room.status} /></td>
                    <td className="px-4 py-3"><p className="font-medium">{activeCase?.procedureName ?? "No active procedure"}</p><p className="text-xs text-muted">{activeCase ? activeCase.patientName : "Holding clean for assignment"}</p></td>
                    <td className="px-4 py-3"><p>{activeSurgeon?.name ?? "Room ready"}</p><p className="text-xs text-muted">{activeCase ? `${activeCase.scheduledStart} - ${addMinutesToTime(activeCase.scheduledStart, activeCase.predictedMinutes)}` : "No active window"}</p></td>
                    <td className="px-4 py-3">{formatPercent(room.utilizationRate)}</td>
                    <td className="px-4 py-3">{room.turnoverMinutes}m</td>
                    <td className="px-4 py-3">{nextCase ? <><p className="font-medium">{nextCase.patientName}</p><p className="text-xs text-muted">{nextCase.procedureName} · {nextCase.scheduledStart} · {formatMinutes(nextCase.predictedMinutes)}</p></> : <span className="text-xs text-muted">No queued case</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" disabled={!canMutate || isSaving} onClick={() => setEditingRoomId(room.id)} className="inline-flex items-center gap-1 rounded-lg border border-line/70 px-2 py-1 text-xs"><PencilLine className="size-3" />Edit</button>
                        <button type="button" disabled={!canMutate || isSaving} onClick={() => { void handleDeleteRoom(room.id); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"><Trash2 className="size-3" />Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          eyebrow="Conflict resolution engine"
          title="Active resolution queue"
          description="The board surfaces the highest-risk overlaps first so coordinators can absorb disruption before incisions slip."
          action={<div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accentStrong">{conflicts.length} open</div>}
        >
          <div className="mb-3 flex justify-end">
            <button type="button" disabled={!canMutate || isSaving} onClick={() => setIsCreateConflictOpen(true)} className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold disabled:opacity-60"><Plus className="size-3.5" />Add conflict</button>
          </div>
          <div className="table-shell">
            <table className="min-w-full text-sm">
              <thead className="bg-background/70 text-xs uppercase tracking-[0.2em] text-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Severity</th>
                  <th className="px-4 py-3 text-left">Conflict</th>
                  <th className="px-4 py-3 text-left">Detail</th>
                  <th className="px-4 py-3 text-left">Recommendation</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedConflicts.map((conflict) => (
                  <tr key={conflict.id} className="border-t border-line/50 align-top">
                    <td className="px-4 py-3"><StatusPill label={conflict.severity} /></td>
                    <td className="px-4 py-3 font-medium text-foreground">{conflict.title}</td>
                    <td className="px-4 py-3 text-muted">{conflict.detail}</td>
                    <td className="px-4 py-3 text-foreground">{conflict.recommendation}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" disabled={!canMutate || isSaving} onClick={() => setEditingConflictId(conflict.id)} className="inline-flex items-center gap-1 rounded-lg border border-line/70 px-2 py-1 text-xs"><PencilLine className="size-3" />Edit</button><button type="button" disabled={!canMutate || isSaving} onClick={() => { void handleDeleteConflict(conflict.id); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"><Trash2 className="size-3" />Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-3xl border border-accent/20 bg-accent/10 p-4">
            <div className="flex items-center gap-2 text-accentStrong"><Sparkles className="size-4" /><p className="text-sm font-semibold uppercase tracking-[0.24em]">Duration confidence</p></div>
            <p className="mt-3 text-sm text-muted">Predicted duration is already visible in room cards so teams can rebalance sequence risk before schedule slip.</p>
          </div>
        </Panel>

        <Panel
          eyebrow="Patient status"
          title="Current procedures and upcoming cases"
          description="Live procedure board with same-workspace create, update, and delete controls."
        >
          <div className="mb-3 flex justify-end">
            <button type="button" disabled={!canMutate || isSaving} onClick={() => setIsCreateCaseOpen(true)} className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold disabled:opacity-60"><Plus className="size-3.5" />Add case</button>
          </div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">Current procedures ({currentProcedures.length})</p>
          <div className="table-shell mb-5">
            <table className="min-w-full text-sm">
              <thead className="bg-background/70 text-xs uppercase tracking-[0.2em] text-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Procedure</th>
                  <th className="px-4 py-3 text-left">Room</th>
                  <th className="px-4 py-3 text-left">Surgeon</th>
                  <th className="px-4 py-3 text-left">Start</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProcedures.map((caseItem) => (
                  <tr key={caseItem.id} className="border-t border-line/50">
                    <td className="px-4 py-3 font-medium text-foreground">{caseItem.patientName}</td>
                    <td className="px-4 py-3 text-muted">{caseItem.procedureName}</td>
                    <td className="px-4 py-3 text-muted">{caseItem.operatingRoomId ? roomMap[caseItem.operatingRoomId]?.name ?? "Unknown room" : "Unassigned"}</td>
                    <td className="px-4 py-3 text-muted">{surgeonMap[caseItem.surgeonId]?.name ?? "Unknown surgeon"}</td>
                    <td className="px-4 py-3 text-muted">{caseItem.scheduledStart}</td>
                    <td className="px-4 py-3"><div className="inline-flex items-center gap-2"><Activity className="size-4 text-accentStrong" /><StatusPill label={caseItem.status} /></div></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" disabled={!canMutate || isSaving} onClick={() => setEditingCaseId(caseItem.id)} className="inline-flex items-center gap-1 rounded-lg border border-line/70 px-2 py-1 text-xs"><PencilLine className="size-3" />Edit</button><button type="button" disabled={!canMutate || isSaving} onClick={() => { void handleDeleteCase(caseItem.id); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"><Trash2 className="size-3" />Delete</button></div></td>
                  </tr>
                ))}
                {!currentProcedures.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted">
                      No live procedures are currently in progress.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">Upcoming cases ({upcomingCases.length})</p>
          <div className="table-shell">
            <table className="min-w-full text-sm">
              <thead className="bg-background/70 text-xs uppercase tracking-[0.2em] text-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Procedure</th>
                  <th className="px-4 py-3 text-left">Room</th>
                  <th className="px-4 py-3 text-left">Surgeon</th>
                  <th className="px-4 py-3 text-left">Start</th>
                  <th className="px-4 py-3 text-left">Urgency</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingCases.map((caseItem) => (
                  <tr key={caseItem.id} className="border-t border-line/50">
                    <td className="px-4 py-3 font-medium text-foreground">{caseItem.patientName}</td>
                    <td className="px-4 py-3 text-muted">{caseItem.procedureName}</td>
                    <td className="px-4 py-3 text-muted">{caseItem.operatingRoomId ? roomMap[caseItem.operatingRoomId]?.name ?? "Unknown room" : "Unassigned"}</td>
                    <td className="px-4 py-3 text-muted">{surgeonMap[caseItem.surgeonId]?.name ?? "Unknown surgeon"}</td>
                    <td className="px-4 py-3 text-muted">{caseItem.scheduledStart}</td>
                    <td className="px-4 py-3"><StatusPill label={caseItem.urgency} /></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" disabled={!canMutate || isSaving} onClick={() => setEditingCaseId(caseItem.id)} className="inline-flex items-center gap-1 rounded-lg border border-line/70 px-2 py-1 text-xs"><PencilLine className="size-3" />Edit</button><button type="button" disabled={!canMutate || isSaving} onClick={() => { void handleDeleteCase(caseItem.id); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"><Trash2 className="size-3" />Delete</button></div></td>
                  </tr>
                ))}
                {!upcomingCases.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted">
                      No upcoming scheduled cases.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {message ? <p className="rounded-xl border border-line/70 bg-background/70 px-3 py-2 text-xs text-muted">{message}</p> : null}

      {isCreateRoomOpen ? (
        <Modal title="Add room" onClose={() => setIsCreateRoomOpen(false)}>
          <form action={(fd) => startTransition(() => void handleCreateRoom(fd))} className="grid gap-3 md:grid-cols-2">
            <input required name="name" placeholder="Room name" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <input required name="serviceLine" placeholder="Service line" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <select name="status" defaultValue="Available" className="rounded-xl border border-line/70 px-3 py-2 text-sm">{roomStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select>
            <input name="utilizationRate" type="number" min={0} max={100} defaultValue={75} className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <input name="turnoverMinutes" type="number" min={0} defaultValue={30} className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <button type="submit" disabled={!canMutate || isSaving} className="btn-primary inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold"><Save className="size-4" />Save room</button>
          </form>
        </Modal>
      ) : null}

      {editingRoom ? (
        <Modal title={`Edit ${editingRoom.name}`} onClose={() => setEditingRoomId(null)}>
          <form action={(fd) => startTransition(() => void handleUpdateRoom(fd))} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="roomId" value={editingRoom.id} />
            <input required name="name" defaultValue={editingRoom.name} className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <input required name="serviceLine" defaultValue={editingRoom.serviceLine} className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <select name="status" defaultValue={editingRoom.status} className="rounded-xl border border-line/70 px-3 py-2 text-sm">{roomStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select>
            <input name="utilizationRate" type="number" min={0} max={100} defaultValue={editingRoom.utilizationRate} className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <input name="turnoverMinutes" type="number" min={0} defaultValue={editingRoom.turnoverMinutes} className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <button type="submit" disabled={!canMutate || isSaving} className="btn-primary inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold"><Save className="size-4" />Save room</button>
          </form>
        </Modal>
      ) : null}

      {isCreateConflictOpen ? (
        <Modal title="Add conflict" onClose={() => setIsCreateConflictOpen(false)}>
          <form action={(fd) => startTransition(() => void handleCreateConflict(fd))} className="grid gap-3 md:grid-cols-2">
            <select name="severity" defaultValue="Low" className="rounded-xl border border-line/70 px-3 py-2 text-sm">{conflictSeverityOptions.map((severity) => <option key={severity} value={severity}>{severity}</option>)}</select>
            <input required name="title" placeholder="Conflict title" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <textarea required name="detail" placeholder="Conflict detail" className="rounded-xl border border-line/70 px-3 py-2 text-sm md:col-span-2" rows={3} />
            <textarea required name="recommendation" placeholder="Recommendation" className="rounded-xl border border-line/70 px-3 py-2 text-sm md:col-span-2" rows={3} />
            <button type="submit" disabled={!canMutate || isSaving} className="btn-primary inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold"><Save className="size-4" />Save conflict</button>
          </form>
        </Modal>
      ) : null}

      {editingConflict ? (
        <Modal title="Edit conflict" onClose={() => setEditingConflictId(null)}>
          <form action={(fd) => startTransition(() => void handleUpdateConflict(fd))} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="conflictId" value={editingConflict.id} />
            <select name="severity" defaultValue={editingConflict.severity} className="rounded-xl border border-line/70 px-3 py-2 text-sm">{conflictSeverityOptions.map((severity) => <option key={severity} value={severity}>{severity}</option>)}</select>
            <input required name="title" defaultValue={editingConflict.title} className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <textarea required name="detail" defaultValue={editingConflict.detail} className="rounded-xl border border-line/70 px-3 py-2 text-sm md:col-span-2" rows={3} />
            <textarea required name="recommendation" defaultValue={editingConflict.recommendation} className="rounded-xl border border-line/70 px-3 py-2 text-sm md:col-span-2" rows={3} />
            <button type="submit" disabled={!canMutate || isSaving} className="btn-primary inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold"><Save className="size-4" />Save conflict</button>
          </form>
        </Modal>
      ) : null}

      {isCreateCaseOpen ? (
        <Modal title="Add case" onClose={() => setIsCreateCaseOpen(false)}>
          <form action={(fd) => startTransition(() => void handleCreateCase(fd))} className="grid gap-3 md:grid-cols-2">
            <input required name="patientName" placeholder="Patient" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <input required name="procedureName" placeholder="Procedure" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <select required name="surgeonId" defaultValue="" className="rounded-xl border border-line/70 px-3 py-2 text-sm"><option value="" disabled>Select surgeon</option>{surgeons.map((surgeon) => <option key={surgeon.id} value={surgeon.id}>{surgeon.name}</option>)}</select>
            <select name="operatingRoomId" defaultValue="" className="rounded-xl border border-line/70 px-3 py-2 text-sm"><option value="">Unassigned room</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select>
            <input required type="time" name="scheduledStart" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <input required type="number" min={1} defaultValue={90} name="predictedMinutes" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <select name="urgency" defaultValue="Elective" className="rounded-xl border border-line/70 px-3 py-2 text-sm">{urgencyOptions.map((urgency) => <option key={urgency} value={urgency}>{urgency}</option>)}</select>
            <button type="submit" disabled={!canMutate || isSaving} className="btn-primary inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold"><Save className="size-4" />Save case</button>
          </form>
        </Modal>
      ) : null}

      {editingCase ? (
        <Modal title={`Edit ${editingCase.patientName}`} onClose={() => setEditingCaseId(null)}>
          <form action={(fd) => startTransition(() => void handleUpdateCase(fd))} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="caseId" value={editingCase.id} />
            <select name="operatingRoomId" defaultValue={editingCase.operatingRoomId ?? ""} className="rounded-xl border border-line/70 px-3 py-2 text-sm"><option value="">Unassigned room</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select>
            <input required type="time" name="scheduledStart" defaultValue={editingCase.scheduledStart} className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <input required type="number" min={1} name="predictedMinutes" defaultValue={editingCase.predictedMinutes} className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
            <select name="status" defaultValue={editingCase.status} className="rounded-xl border border-line/70 px-3 py-2 text-sm">{caseStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select>
            <select name="urgency" defaultValue={editingCase.urgency} className="rounded-xl border border-line/70 px-3 py-2 text-sm">{urgencyOptions.map((urgency) => <option key={urgency} value={urgency}>{urgency}</option>)}</select>
            <button type="submit" disabled={!canMutate || isSaving} className="btn-primary inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold"><Save className="size-4" />Save case</button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
};

function MetricCard({ label, value, detail, icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-line/60 bg-white/75 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-4xl rounded-[26px] border border-line/60 bg-white p-5 shadow-[0_24px_48px_rgba(8,27,29,0.2)] md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full border border-line/70 p-2 text-muted transition hover:bg-background" aria-label="Close modal">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function normalizeNullable(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}
