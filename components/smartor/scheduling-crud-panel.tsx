"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilLine, Plus, Save, Trash2, X } from "lucide-react";

import {
  createSurgeryCaseAction,
  deleteSurgeryCaseAction,
  updateSurgeryCaseAction,
} from "@/app/actions/scheduling";
import { Panel } from "@/components/smartor/panel";
import { StatusPill } from "@/components/smartor/status-pill";
import type { OperatingRoom, Surgeon, SurgeryCase } from "@/lib/validations/smartor";

type SchedulingCrudPanelProps = {
  hospitalSlug: string;
  cases: SurgeryCase[];
  surgeons: Surgeon[];
  rooms: OperatingRoom[];
  canMutate: boolean;
};

const urgencyOptions: SurgeryCase["urgency"][] = ["Elective", "Urgent", "Emergent"];
const statusOptions: SurgeryCase["status"][] = [
  "Scheduled",
  "Pre-op",
  "Ready",
  "In Surgery",
  "Turnover",
  "Delayed",
  "Waitlist",
];

export function SchedulingCrudPanel({
  hospitalSlug,
  cases,
  surgeons,
  rooms,
  canMutate,
}: SchedulingCrudPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);

  const roomOptions = useMemo(
    () =>
      rooms
        .map((room) => ({ id: room.id, name: room.name }))
        .sort((left, right) => left.name.localeCompare(right.name)),
    [rooms],
  );

  const sortedCases = useMemo(
    () =>
      [...cases].sort((left, right) => {
        if (left.scheduledStart === right.scheduledStart) {
          return left.patientName.localeCompare(right.patientName);
        }

        return left.scheduledStart.localeCompare(right.scheduledStart);
      }),
    [cases],
  );
  const editingCase = useMemo(
    () => sortedCases.find((caseItem) => caseItem.id === editingCaseId) ?? null,
    [editingCaseId, sortedCases],
  );

  async function handleCreate(formData: FormData) {
    if (!canMutate) {
      setMessage("You do not have permission to create cases.");
      return;
    }

    const predictedMinutes = Number(formData.get("predictedMinutes"));

    setIsSaving(true);
    setMessage(null);

    const result = await createSurgeryCaseAction({
      hospitalSlug,
      patientName: String(formData.get("patientName") ?? ""),
      procedureName: String(formData.get("procedureName") ?? ""),
      surgeonId: String(formData.get("surgeonId") ?? ""),
      operatingRoomId: normalizeNullableValue(formData.get("operatingRoomId")),
      scheduledStart: String(formData.get("scheduledStart") ?? ""),
      predictedMinutes: Number.isNaN(predictedMinutes) ? 0 : predictedMinutes,
      urgency: String(formData.get("urgency") ?? "Elective") as SurgeryCase["urgency"],
    });

    setIsSaving(false);
    setMessage(result.ok ? "Case created." : result.error ?? "Unable to create case.");

    if (result.ok) {
      setIsCreateModalOpen(false);
      router.refresh();
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!canMutate) {
      setMessage("You do not have permission to update cases.");
      return;
    }

    const predictedMinutes = Number(formData.get("predictedMinutes"));

    setIsSaving(true);
    setMessage(null);

    const result = await updateSurgeryCaseAction({
      hospitalSlug,
      caseId: String(formData.get("caseId") ?? ""),
      operatingRoomId: normalizeNullableValue(formData.get("operatingRoomId")),
      scheduledStart: String(formData.get("scheduledStart") ?? ""),
      predictedMinutes: Number.isNaN(predictedMinutes) ? 0 : predictedMinutes,
      status: String(formData.get("status") ?? "Scheduled") as SurgeryCase["status"],
      urgency: String(formData.get("urgency") ?? "Elective") as SurgeryCase["urgency"],
    });

    setIsSaving(false);
    setMessage(result.ok ? "Case updated." : result.error ?? "Unable to update case.");

    if (result.ok) {
      setEditingCaseId(null);
      router.refresh();
    }
  }

  async function handleDelete(caseId: string) {
    if (!canMutate) {
      setMessage("You do not have permission to delete cases.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const result = await deleteSurgeryCaseAction({ hospitalSlug, caseId });

    setIsSaving(false);
    setMessage(result.ok ? "Case deleted." : result.error ?? "Unable to delete case.");

    if (result.ok) {
      setEditingCaseId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      <Panel
        eyebrow="Case CRUD"
        title="Scheduling controls"
        description="Create and manage scheduled cases using focused modal forms."
        className="bg-white/80"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/60 bg-white/85 p-4">
          <p className="text-sm text-muted">
            Open a dedicated modal to create a scheduled case instead of filling inline fields.
          </p>
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setIsCreateModalOpen(true);
            }}
            disabled={!canMutate || isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-accentStrong disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="size-4" />
            Create scheduling
          </button>
        </div>
      </Panel>

      <Panel
        eyebrow="Case CRUD"
        title="Scheduled case list"
        description="Use Edit to open a modal and update schedule details or delete a case."
      >
        <div className="space-y-3">
          {sortedCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/70 bg-white/85 p-3"
            >
              <div>
                <p className="font-semibold text-foreground">{caseItem.patientName}</p>
                <p className="text-sm text-muted">
                  {caseItem.procedureName} · {caseItem.scheduledStart}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill label={caseItem.status} />
                <button
                  type="button"
                  disabled={!canMutate || isSaving}
                  onClick={() => {
                    setMessage(null);
                    setEditingCaseId(caseItem.id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-foreground/10 bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:border-accent/25 hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <PencilLine className="size-3.5" />
                  Edit scheduling
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-4xl rounded-[26px] border border-line/60 bg-white p-5 shadow-[0_24px_48px_rgba(8,27,29,0.2)] md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Create scheduling</p>
                <h3 className="text-xl font-semibold text-foreground">Create new scheduled case</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full border border-line/70 p-2 text-muted transition hover:bg-background"
                aria-label="Close create scheduling modal"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              action={(formData) => {
                startTransition(() => {
                  void handleCreate(formData);
                });
              }}
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
            >
              <input
                required
                name="patientName"
                placeholder="Patient name"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm"
              />
              <input
                required
                name="procedureName"
                placeholder="Procedure"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm"
              />
              <select
                required
                name="surgeonId"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Select surgeon
                </option>
                {surgeons.map((surgeon) => (
                  <option key={surgeon.id} value={surgeon.id}>
                    {surgeon.name}
                  </option>
                ))}
              </select>
              <select
                name="operatingRoomId"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="">Unassigned room</option>
                {roomOptions.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              <input
                required
                name="scheduledStart"
                type="time"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm"
              />
              <input
                required
                name="predictedMinutes"
                type="number"
                min={1}
                defaultValue={90}
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm"
              />
              <select
                name="urgency"
                defaultValue="Elective"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm"
              >
                {urgencyOptions.map((urgency) => (
                  <option key={urgency} value={urgency}>
                    {urgency}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!canMutate || isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-3 py-2 text-sm font-semibold text-background transition hover:bg-accentStrong disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="size-4" />
                Add case
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {editingCase ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-4xl rounded-[26px] border border-line/60 bg-white p-5 shadow-[0_24px_48px_rgba(8,27,29,0.2)] md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Edit scheduling</p>
                <h3 className="text-xl font-semibold text-foreground">{editingCase.patientName}</h3>
                <p className="text-sm text-muted">{editingCase.procedureName}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCaseId(null)}
                className="rounded-full border border-line/70 p-2 text-muted transition hover:bg-background"
                aria-label="Close edit scheduling modal"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              action={(formData) => {
                startTransition(() => {
                  void handleUpdate(formData);
                });
              }}
              className="space-y-4"
            >
              <input type="hidden" name="caseId" value={editingCase.id} />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <select
                  name="operatingRoomId"
                  defaultValue={editingCase.operatingRoomId ?? ""}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Unassigned room</option>
                  {roomOptions.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <input
                  required
                  name="scheduledStart"
                  type="time"
                  defaultValue={editingCase.scheduledStart}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                />
                <input
                  required
                  name="predictedMinutes"
                  type="number"
                  min={1}
                  defaultValue={editingCase.predictedMinutes}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                />
                <select
                  name="status"
                  defaultValue={editingCase.status}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  name="urgency"
                  defaultValue={editingCase.urgency}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                >
                  {urgencyOptions.map((urgency) => (
                    <option key={urgency} value={urgency}>
                      {urgency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={!canMutate || isSaving}
                  onClick={() => {
                    startTransition(() => {
                      void handleDelete(editingCase.id);
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-danger/25 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="size-3.5" />
                  Delete case
                </button>
                <button
                  type="submit"
                  disabled={!canMutate || isSaving}
                  className="inline-flex items-center gap-2 rounded-xl border border-foreground/10 bg-background/75 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-accent/25 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="size-3.5" />
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-2xl border border-line/70 bg-white/80 px-3 py-2 text-sm text-muted">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function normalizeNullableValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value;
}
