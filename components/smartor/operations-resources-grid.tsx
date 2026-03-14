"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, PencilLine, Plus, Save, Trash2, X } from "lucide-react";

import {
  createEquipmentAction,
  createStaffMemberAction,
  createSurgeonAction,
  deleteEquipmentAction,
  deleteStaffMemberAction,
  deleteSurgeonAction,
  updateEquipmentAction,
  updateStaffMemberAction,
  updateSurgeonAction,
} from "@/app/actions/operations-crud";
import { Panel } from "@/components/smartor/panel";
import { StatusPill } from "@/components/smartor/status-pill";
import type { Equipment, OperatingRoom, StaffMember, Surgeon, SurgeryCase } from "@/lib/validations/smartor";

type OperationsResourcesGridProps = {
  hospitalSlug: string;
  surgeons: Surgeon[];
  staff: StaffMember[];
  equipment: Equipment[];
  rooms: OperatingRoom[];
  cases: SurgeryCase[];
  canMutate: boolean;
};

const equipmentStatusOptions: Equipment["status"][] = ["Ready", "Reserved", "In Use", "Sterilizing", "Maintenance"];

export function OperationsResourcesGrid({
  hospitalSlug,
  surgeons,
  staff,
  equipment,
  rooms,
  cases,
  canMutate,
}: OperationsResourcesGridProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isCreateSurgeonOpen, setIsCreateSurgeonOpen] = useState(false);
  const [editingSurgeonId, setEditingSurgeonId] = useState<string | null>(null);

  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const [isCreateEquipmentOpen, setIsCreateEquipmentOpen] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);

  const sortedSurgeons = useMemo(() => [...surgeons].sort((a, b) => a.name.localeCompare(b.name)), [surgeons]);
  const sortedStaff = useMemo(() => [...staff].sort((a, b) => a.name.localeCompare(b.name)), [staff]);
  const sortedEquipment = useMemo(() => [...equipment].sort((a, b) => a.name.localeCompare(b.name)), [equipment]);

  const editingSurgeon = useMemo(
    () => sortedSurgeons.find((surgeon) => surgeon.id === editingSurgeonId) ?? null,
    [editingSurgeonId, sortedSurgeons],
  );
  const editingStaff = useMemo(() => sortedStaff.find((member) => member.id === editingStaffId) ?? null, [editingStaffId, sortedStaff]);
  const editingEquipment = useMemo(
    () => sortedEquipment.find((item) => item.id === editingEquipmentId) ?? null,
    [editingEquipmentId, sortedEquipment],
  );

  async function handleCreateSurgeon(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to create surgeons.");
    setIsSaving(true);
    const result = await createSurgeonAction({
      hospitalSlug,
      name: String(formData.get("name") ?? ""),
      specialty: String(formData.get("specialty") ?? ""),
      blockPreference: String(formData.get("blockPreference") ?? ""),
      availability: parseAvailability(String(formData.get("availability") ?? "")),
    });
    setIsSaving(false);
    setMessage(result.ok ? "Surgeon created." : result.error ?? "Failed to create surgeon.");
    if (result.ok) {
      setIsCreateSurgeonOpen(false);
      router.refresh();
    }
  }

  async function handleUpdateSurgeon(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to update surgeons.");
    setIsSaving(true);
    const result = await updateSurgeonAction({
      hospitalSlug,
      surgeonId: String(formData.get("surgeonId") ?? ""),
      name: String(formData.get("name") ?? ""),
      specialty: String(formData.get("specialty") ?? ""),
      blockPreference: String(formData.get("blockPreference") ?? ""),
      availability: parseAvailability(String(formData.get("availability") ?? "")),
    });
    setIsSaving(false);
    setMessage(result.ok ? "Surgeon updated." : result.error ?? "Failed to update surgeon.");
    if (result.ok) {
      setEditingSurgeonId(null);
      router.refresh();
    }
  }

  async function handleDeleteSurgeon(surgeonId: string) {
    if (!canMutate) return setMessage("You do not have permission to delete surgeons.");
    setIsSaving(true);
    const result = await deleteSurgeonAction({ hospitalSlug, surgeonId });
    setIsSaving(false);
    setMessage(result.ok ? "Surgeon deleted." : result.error ?? "Failed to delete surgeon.");
    if (result.ok) {
      setEditingSurgeonId(null);
      router.refresh();
    }
  }

  async function handleCreateStaff(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to create staff.");
    setIsSaving(true);
    const result = await createStaffMemberAction({
      hospitalSlug,
      name: String(formData.get("name") ?? ""),
      role: String(formData.get("role") ?? ""),
      shift: String(formData.get("shift") ?? ""),
      availabilityLabel: String(formData.get("availabilityLabel") ?? ""),
      assignedRoomId: normalizeNullable(formData.get("assignedRoomId")),
    });
    setIsSaving(false);
    setMessage(result.ok ? "Staff member created." : result.error ?? "Failed to create staff member.");
    if (result.ok) {
      setIsCreateStaffOpen(false);
      router.refresh();
    }
  }

  async function handleUpdateStaff(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to update staff.");
    setIsSaving(true);
    const result = await updateStaffMemberAction({
      hospitalSlug,
      staffId: String(formData.get("staffId") ?? ""),
      name: String(formData.get("name") ?? ""),
      role: String(formData.get("role") ?? ""),
      shift: String(formData.get("shift") ?? ""),
      availabilityLabel: String(formData.get("availabilityLabel") ?? ""),
      assignedRoomId: normalizeNullable(formData.get("assignedRoomId")),
    });
    setIsSaving(false);
    setMessage(result.ok ? "Staff member updated." : result.error ?? "Failed to update staff member.");
    if (result.ok) {
      setEditingStaffId(null);
      router.refresh();
    }
  }

  async function handleDeleteStaff(staffId: string) {
    if (!canMutate) return setMessage("You do not have permission to delete staff.");
    setIsSaving(true);
    const result = await deleteStaffMemberAction({ hospitalSlug, staffId });
    setIsSaving(false);
    setMessage(result.ok ? "Staff member deleted." : result.error ?? "Failed to delete staff member.");
    if (result.ok) {
      setEditingStaffId(null);
      router.refresh();
    }
  }

  async function handleCreateEquipment(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to create equipment.");
    setIsSaving(true);
    const result = await createEquipmentAction({
      hospitalSlug,
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? ""),
      status: String(formData.get("status") ?? "Ready") as Equipment["status"],
      lastSterilizedAt: String(formData.get("lastSterilizedAt") ?? "00:00"),
      assignedCaseId: normalizeNullable(formData.get("assignedCaseId")),
    });
    setIsSaving(false);
    setMessage(result.ok ? "Equipment created." : result.error ?? "Failed to create equipment.");
    if (result.ok) {
      setIsCreateEquipmentOpen(false);
      router.refresh();
    }
  }

  async function handleUpdateEquipment(formData: FormData) {
    if (!canMutate) return setMessage("You do not have permission to update equipment.");
    setIsSaving(true);
    const result = await updateEquipmentAction({
      hospitalSlug,
      equipmentId: String(formData.get("equipmentId") ?? ""),
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? ""),
      status: String(formData.get("status") ?? "Ready") as Equipment["status"],
      lastSterilizedAt: String(formData.get("lastSterilizedAt") ?? "00:00"),
      assignedCaseId: normalizeNullable(formData.get("assignedCaseId")),
    });
    setIsSaving(false);
    setMessage(result.ok ? "Equipment updated." : result.error ?? "Failed to update equipment.");
    if (result.ok) {
      setEditingEquipmentId(null);
      router.refresh();
    }
  }

  async function handleDeleteEquipment(equipmentId: string) {
    if (!canMutate) return setMessage("You do not have permission to delete equipment.");
    setIsSaving(true);
    const result = await deleteEquipmentAction({ hospitalSlug, equipmentId });
    setIsSaving(false);
    setMessage(result.ok ? "Equipment deleted." : result.error ?? "Failed to delete equipment.");
    if (result.ok) {
      setEditingEquipmentId(null);
      router.refresh();
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <Panel id="surgeons" eyebrow="Surgeon calendar integration" title="Availability windows" description="Calendar visibility for surgeon availability and block preferences.">
          <div className="mb-3 flex justify-end">
            <button type="button" disabled={!canMutate || isSaving} onClick={() => setIsCreateSurgeonOpen(true)} className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold disabled:opacity-60"><Plus className="size-3.5" />Add surgeon</button>
          </div>
          <div className="table-shell">
            <table className="min-w-full text-sm">
              <thead className="bg-background/70 text-xs uppercase tracking-[0.2em] text-muted">
                <tr><th className="px-4 py-3 text-left">Surgeon</th><th className="px-4 py-3 text-left">Specialty</th><th className="px-4 py-3 text-left">Block preference</th><th className="px-4 py-3 text-left">Availability</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {sortedSurgeons.map((surgeon) => (
                  <tr key={surgeon.id} className="border-t border-line/50 align-top">
                    <td className="px-4 py-3 font-medium text-foreground">{surgeon.name}</td>
                    <td className="px-4 py-3 text-muted">{surgeon.specialty}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accentStrong"><CalendarDays className="size-3.5" />{surgeon.blockPreference}</span></td>
                    <td className="px-4 py-3"><div className="space-y-1 text-muted">{surgeon.availability.map((slot) => <p key={`${surgeon.id}-${slot.day}-${slot.start}`}>{slot.day} · {slot.start} - {slot.end}{slot.note ? ` · ${slot.note}` : ""}</p>)}</div></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" disabled={!canMutate || isSaving} onClick={() => setEditingSurgeonId(surgeon.id)} className="inline-flex items-center gap-1 rounded-lg border border-line/70 px-2 py-1 text-xs"><PencilLine className="size-3" />Edit</button><button type="button" disabled={!canMutate || isSaving} onClick={() => { void handleDeleteSurgeon(surgeon.id); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"><Trash2 className="size-3" />Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel eyebrow="Equipment & resource tracking" title="Instrument readiness" description="Equipment state, assignment target, and sterilization timing across the suite.">
          <div className="mb-3 flex justify-end">
            <button type="button" disabled={!canMutate || isSaving} onClick={() => setIsCreateEquipmentOpen(true)} className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold disabled:opacity-60"><Plus className="size-3.5" />Add equipment</button>
          </div>
          <div className="table-shell">
            <table className="min-w-full text-sm">
              <thead className="bg-background/70 text-xs uppercase tracking-[0.2em] text-muted">
                <tr><th className="px-4 py-3 text-left">Equipment</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Last sterilized</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {sortedEquipment.map((item) => (
                  <tr key={item.id} className="border-t border-line/50">
                    <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-4 py-3 text-muted">{item.type}</td>
                    <td className="px-4 py-3"><StatusPill label={item.status} /></td>
                    <td className="px-4 py-3 text-muted">{item.lastSterilizedAt}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" disabled={!canMutate || isSaving} onClick={() => setEditingEquipmentId(item.id)} className="inline-flex items-center gap-1 rounded-lg border border-line/70 px-2 py-1 text-xs"><PencilLine className="size-3" />Edit</button><button type="button" disabled={!canMutate || isSaving} onClick={() => { void handleDeleteEquipment(item.id); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"><Trash2 className="size-3" />Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div>
        <Panel id="staff-users" eyebrow="Staff scheduling & assignments" title="Staffed rooms" description="Charge coverage, anesthesia, scrub support, and operations staffing alignment.">
          <div className="mb-3 flex justify-end">
            <button type="button" disabled={!canMutate || isSaving} onClick={() => setIsCreateStaffOpen(true)} className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold disabled:opacity-60"><Plus className="size-3.5" />Add staff</button>
          </div>
          <div className="table-shell">
            <table className="min-w-full text-sm">
              <thead className="bg-background/70 text-xs uppercase tracking-[0.2em] text-muted">
                <tr><th className="px-4 py-3 text-left">Staff</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Shift</th><th className="px-4 py-3 text-left">Coverage note</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {sortedStaff.map((member) => (
                  <tr key={member.id} className="border-t border-line/50">
                    <td className="px-4 py-3 font-medium text-foreground">{member.name}</td>
                    <td className="px-4 py-3 text-muted">{member.role}</td>
                    <td className="px-4 py-3 text-muted">{member.shift}</td>
                    <td className="px-4 py-3 text-muted">{member.availabilityLabel}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" disabled={!canMutate || isSaving} onClick={() => setEditingStaffId(member.id)} className="inline-flex items-center gap-1 rounded-lg border border-line/70 px-2 py-1 text-xs"><PencilLine className="size-3" />Edit</button><button type="button" disabled={!canMutate || isSaving} onClick={() => { void handleDeleteStaff(member.id); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"><Trash2 className="size-3" />Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {message ? <p className="xl:col-span-2 rounded-xl border border-line/70 bg-background/70 px-3 py-2 text-xs text-muted">{message}</p> : null}

      {isCreateSurgeonOpen ? (
        <Modal title="Add surgeon" onClose={() => setIsCreateSurgeonOpen(false)}>
          <SurgeonForm onSubmit={handleCreateSurgeon} isSaving={isSaving} canMutate={canMutate} />
        </Modal>
      ) : null}

      {editingSurgeon ? (
        <Modal title={`Edit ${editingSurgeon.name}`} onClose={() => setEditingSurgeonId(null)}>
          <SurgeonForm surgeon={editingSurgeon} onSubmit={handleUpdateSurgeon} isSaving={isSaving} canMutate={canMutate} />
        </Modal>
      ) : null}

      {isCreateStaffOpen ? (
        <Modal title="Add staff" onClose={() => setIsCreateStaffOpen(false)}>
          <StaffForm rooms={rooms} onSubmit={handleCreateStaff} isSaving={isSaving} canMutate={canMutate} />
        </Modal>
      ) : null}

      {editingStaff ? (
        <Modal title={`Edit ${editingStaff.name}`} onClose={() => setEditingStaffId(null)}>
          <StaffForm staff={editingStaff} rooms={rooms} onSubmit={handleUpdateStaff} isSaving={isSaving} canMutate={canMutate} />
        </Modal>
      ) : null}

      {isCreateEquipmentOpen ? (
        <Modal title="Add equipment" onClose={() => setIsCreateEquipmentOpen(false)}>
          <EquipmentForm cases={cases} onSubmit={handleCreateEquipment} isSaving={isSaving} canMutate={canMutate} />
        </Modal>
      ) : null}

      {editingEquipment ? (
        <Modal title={`Edit ${editingEquipment.name}`} onClose={() => setEditingEquipmentId(null)}>
          <EquipmentForm equipment={editingEquipment} cases={cases} onSubmit={handleUpdateEquipment} isSaving={isSaving} canMutate={canMutate} />
        </Modal>
      ) : null}
    </div>
  );
}

type SurgeonFormProps = {
  surgeon?: Surgeon;
  onSubmit: (formData: FormData) => Promise<void>;
  isSaving: boolean;
  canMutate: boolean;
};

function SurgeonForm({ surgeon, onSubmit, isSaving, canMutate }: SurgeonFormProps) {
  const availabilityText = surgeon ? formatAvailability(surgeon.availability) : "Today|07:00|15:00|\nTomorrow|08:00|12:00|";

  return (
    <form action={(fd) => startTransition(() => void onSubmit(fd))} className="grid gap-3 md:grid-cols-2">
      {surgeon ? <input type="hidden" name="surgeonId" value={surgeon.id} /> : null}
      <input required name="name" defaultValue={surgeon?.name ?? ""} placeholder="Name" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
      <input required name="specialty" defaultValue={surgeon?.specialty ?? ""} placeholder="Specialty" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
      <input required name="blockPreference" defaultValue={surgeon?.blockPreference ?? ""} placeholder="Block preference" className="rounded-xl border border-line/70 px-3 py-2 text-sm md:col-span-2" />
      <textarea name="availability" defaultValue={availabilityText} rows={5} className="rounded-xl border border-line/70 px-3 py-2 text-sm md:col-span-2" />
      <p className="text-xs text-muted md:col-span-2">Availability format: `Day|HH:MM|HH:MM|note` (one row per line).</p>
      <button type="submit" disabled={!canMutate || isSaving} className="btn-primary inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold"><Save className="size-4" />Save surgeon</button>
    </form>
  );
}

type StaffFormProps = {
  staff?: StaffMember;
  rooms: OperatingRoom[];
  onSubmit: (formData: FormData) => Promise<void>;
  isSaving: boolean;
  canMutate: boolean;
};

function StaffForm({ staff, rooms, onSubmit, isSaving, canMutate }: StaffFormProps) {
  return (
    <form action={(fd) => startTransition(() => void onSubmit(fd))} className="grid gap-3 md:grid-cols-2">
      {staff ? <input type="hidden" name="staffId" value={staff.id} /> : null}
      <input required name="name" defaultValue={staff?.name ?? ""} placeholder="Name" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
      <input required name="role" defaultValue={staff?.role ?? ""} placeholder="Role" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
      <input required name="shift" defaultValue={staff?.shift ?? ""} placeholder="Shift" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
      <select name="assignedRoomId" defaultValue={staff?.assignedRoomId ?? ""} className="rounded-xl border border-line/70 px-3 py-2 text-sm">
        <option value="">Unassigned room</option>
        {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
      </select>
      <input required name="availabilityLabel" defaultValue={staff?.availabilityLabel ?? ""} placeholder="Coverage note" className="rounded-xl border border-line/70 px-3 py-2 text-sm md:col-span-2" />
      <button type="submit" disabled={!canMutate || isSaving} className="btn-primary inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold"><Save className="size-4" />Save staff</button>
    </form>
  );
}

type EquipmentFormProps = {
  equipment?: Equipment;
  cases: SurgeryCase[];
  onSubmit: (formData: FormData) => Promise<void>;
  isSaving: boolean;
  canMutate: boolean;
};

function EquipmentForm({ equipment, cases, onSubmit, isSaving, canMutate }: EquipmentFormProps) {
  return (
    <form action={(fd) => startTransition(() => void onSubmit(fd))} className="grid gap-3 md:grid-cols-2">
      {equipment ? <input type="hidden" name="equipmentId" value={equipment.id} /> : null}
      <input required name="name" defaultValue={equipment?.name ?? ""} placeholder="Equipment" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
      <input required name="type" defaultValue={equipment?.type ?? ""} placeholder="Type" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
      <select name="status" defaultValue={equipment?.status ?? "Ready"} className="rounded-xl border border-line/70 px-3 py-2 text-sm">{equipmentStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select>
      <input required name="lastSterilizedAt" defaultValue={equipment?.lastSterilizedAt ?? "07:00"} placeholder="HH:MM" className="rounded-xl border border-line/70 px-3 py-2 text-sm" />
      <select name="assignedCaseId" defaultValue={equipment?.assignedCaseId ?? ""} className="rounded-xl border border-line/70 px-3 py-2 text-sm md:col-span-2">
        <option value="">Unassigned case</option>
        {cases.map((caseItem) => <option key={caseItem.id} value={caseItem.id}>{caseItem.patientName} · {caseItem.procedureName}</option>)}
      </select>
      <button type="submit" disabled={!canMutate || isSaving} className="btn-primary inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold"><Save className="size-4" />Save equipment</button>
    </form>
  );
}

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-4xl rounded-[26px] border border-line/60 bg-white p-5 shadow-[0_24px_48px_rgba(8,27,29,0.2)] md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full border border-line/70 p-2 text-muted transition hover:bg-background" aria-label="Close modal"><X className="size-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function normalizeNullable(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function parseAvailability(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, start, end, note] = line.split("|").map((part) => part.trim());
      return {
        day: day || "Today",
        start: start || "07:00",
        end: end || "15:00",
        note: note || null,
      };
    });
}

function formatAvailability(slots: Surgeon["availability"]) {
  return slots.map((slot) => `${slot.day}|${slot.start}|${slot.end}|${slot.note ?? ""}`).join("\n");
}
