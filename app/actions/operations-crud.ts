"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const managerRoles = ["hospital_admin", "or_director", "scheduler"] as const;

const TimeBlockInputSchema = z.object({
  day: z.string().min(1),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  note: z.string().nullable(),
});

const CreateRoomInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  name: z.string().min(2),
  serviceLine: z.string().min(2),
  status: z.enum(["Available", "Pre-op", "In Surgery", "Turnover", "Delayed"]),
  utilizationRate: z.number().min(0).max(100),
  turnoverMinutes: z.number().int().min(0),
});

const UpdateRoomInputSchema = CreateRoomInputSchema.extend({
  roomId: z.string().min(1),
});

const DeleteRoomInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  roomId: z.string().min(1),
});

const CreateConflictInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  severity: z.enum(["Low", "Medium", "High"]),
  title: z.string().min(2),
  detail: z.string().min(2),
  recommendation: z.string().min(2),
});

const UpdateConflictInputSchema = CreateConflictInputSchema.extend({
  conflictId: z.string().min(1),
});

const DeleteConflictInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  conflictId: z.string().min(1),
});

const CreateSurgeonInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  name: z.string().min(2),
  specialty: z.string().min(2),
  blockPreference: z.string().min(2),
  availability: z.array(TimeBlockInputSchema),
});

const UpdateSurgeonInputSchema = CreateSurgeonInputSchema.extend({
  surgeonId: z.string().min(1),
});

const DeleteSurgeonInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  surgeonId: z.string().min(1),
});

const CreateStaffInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  name: z.string().min(2),
  role: z.string().min(2),
  shift: z.string().min(2),
  availabilityLabel: z.string().min(2),
  assignedRoomId: z.string().nullable(),
});

const UpdateStaffInputSchema = CreateStaffInputSchema.extend({
  staffId: z.string().min(1),
});

const DeleteStaffInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  staffId: z.string().min(1),
});

const CreateEquipmentInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  name: z.string().min(2),
  type: z.string().min(2),
  status: z.enum(["Ready", "Reserved", "In Use", "Sterilizing", "Maintenance"]),
  lastSterilizedAt: z.string().regex(/^\d{2}:\d{2}$/),
  assignedCaseId: z.string().nullable(),
});

const UpdateEquipmentInputSchema = CreateEquipmentInputSchema.extend({
  equipmentId: z.string().min(1),
});

const DeleteEquipmentInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  equipmentId: z.string().min(1),
});

type ActionResult = {
  ok: boolean;
  error?: string;
};

async function resolveManagedHospital(hospitalSlug: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (!hospital) {
    throw new Error("Hospital not found.");
  }

  const { data: membership } = await supabase
    .from("hospital_memberships")
    .select("role")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !managerRoles.includes(membership.role)) {
    throw new Error("You do not have permission to modify operations data.");
  }

  return { supabase, hospitalId: hospital.id, hospitalSlug: hospital.slug };
}

function revalidateHospitalRoutes(hospitalSlug: string) {
  revalidatePath(`/hospitals/${hospitalSlug}`);
  revalidatePath(`/hospitals/${hospitalSlug}/operations`);
  revalidatePath(`/hospitals/${hospitalSlug}/operations-resources`);
}

export async function createOperatingRoomAction(
  input: z.infer<typeof CreateRoomInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = CreateRoomInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase.from("operating_rooms").insert({
      id: `room-${crypto.randomUUID()}`,
      hospital_id: hospitalId,
      name: parsed.name,
      service_line: parsed.serviceLine,
      status: parsed.status,
      active_case_id: null,
      next_case_id: null,
      utilization_rate: parsed.utilizationRate,
      turnover_minutes: parsed.turnoverMinutes,
      staffed_by: [],
    });

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create room." };
  }
}

export async function updateOperatingRoomAction(
  input: z.infer<typeof UpdateRoomInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = UpdateRoomInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase
      .from("operating_rooms")
      .update({
        name: parsed.name,
        service_line: parsed.serviceLine,
        status: parsed.status,
        utilization_rate: parsed.utilizationRate,
        turnover_minutes: parsed.turnoverMinutes,
      })
      .eq("id", parsed.roomId)
      .eq("hospital_id", hospitalId);

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update room." };
  }
}

export async function deleteOperatingRoomAction(
  input: z.infer<typeof DeleteRoomInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = DeleteRoomInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase
      .from("operating_rooms")
      .delete()
      .eq("id", parsed.roomId)
      .eq("hospital_id", hospitalId);

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete room." };
  }
}

export async function createConflictAction(
  input: z.infer<typeof CreateConflictInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = CreateConflictInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase.from("conflicts").insert({
      id: `conflict-${crypto.randomUUID()}`,
      hospital_id: hospitalId,
      severity: parsed.severity,
      title: parsed.title,
      detail: parsed.detail,
      recommendation: parsed.recommendation,
    });

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create conflict." };
  }
}

export async function updateConflictAction(
  input: z.infer<typeof UpdateConflictInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = UpdateConflictInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase
      .from("conflicts")
      .update({
        severity: parsed.severity,
        title: parsed.title,
        detail: parsed.detail,
        recommendation: parsed.recommendation,
      })
      .eq("id", parsed.conflictId)
      .eq("hospital_id", hospitalId);

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update conflict." };
  }
}

export async function deleteConflictAction(
  input: z.infer<typeof DeleteConflictInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = DeleteConflictInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase
      .from("conflicts")
      .delete()
      .eq("id", parsed.conflictId)
      .eq("hospital_id", hospitalId);

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete conflict." };
  }
}

export async function createSurgeonAction(
  input: z.infer<typeof CreateSurgeonInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = CreateSurgeonInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const availability = parsed.availability.map((slot) => ({
      day: slot.day,
      start: slot.start,
      end: slot.end,
      ...(slot.note ? { note: slot.note } : {}),
    }));

    const { error } = await supabase.from("surgeons").insert({
      id: `surgeon-${crypto.randomUUID()}`,
      hospital_id: hospitalId,
      name: parsed.name,
      specialty: parsed.specialty,
      block_preference: parsed.blockPreference,
      availability,
    });

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create surgeon." };
  }
}

export async function updateSurgeonAction(
  input: z.infer<typeof UpdateSurgeonInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = UpdateSurgeonInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const availability = parsed.availability.map((slot) => ({
      day: slot.day,
      start: slot.start,
      end: slot.end,
      ...(slot.note ? { note: slot.note } : {}),
    }));

    const { error } = await supabase
      .from("surgeons")
      .update({
        name: parsed.name,
        specialty: parsed.specialty,
        block_preference: parsed.blockPreference,
        availability,
      })
      .eq("id", parsed.surgeonId)
      .eq("hospital_id", hospitalId);

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update surgeon." };
  }
}

export async function deleteSurgeonAction(
  input: z.infer<typeof DeleteSurgeonInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = DeleteSurgeonInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase
      .from("surgeons")
      .delete()
      .eq("id", parsed.surgeonId)
      .eq("hospital_id", hospitalId);

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete surgeon." };
  }
}

export async function createStaffMemberAction(
  input: z.infer<typeof CreateStaffInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = CreateStaffInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase.from("staff_members").insert({
      id: `staff-${crypto.randomUUID()}`,
      hospital_id: hospitalId,
      name: parsed.name,
      role: parsed.role,
      shift: parsed.shift,
      assigned_room_id: parsed.assignedRoomId,
      availability_label: parsed.availabilityLabel,
    });

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create staff member." };
  }
}

export async function updateStaffMemberAction(
  input: z.infer<typeof UpdateStaffInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = UpdateStaffInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase
      .from("staff_members")
      .update({
        name: parsed.name,
        role: parsed.role,
        shift: parsed.shift,
        assigned_room_id: parsed.assignedRoomId,
        availability_label: parsed.availabilityLabel,
      })
      .eq("id", parsed.staffId)
      .eq("hospital_id", hospitalId);

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update staff member." };
  }
}

export async function deleteStaffMemberAction(
  input: z.infer<typeof DeleteStaffInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = DeleteStaffInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase
      .from("staff_members")
      .delete()
      .eq("id", parsed.staffId)
      .eq("hospital_id", hospitalId);

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete staff member." };
  }
}

export async function createEquipmentAction(
  input: z.infer<typeof CreateEquipmentInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = CreateEquipmentInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase.from("equipment").insert({
      id: `equipment-${crypto.randomUUID()}`,
      hospital_id: hospitalId,
      name: parsed.name,
      type: parsed.type,
      status: parsed.status,
      assigned_case_id: parsed.assignedCaseId,
      last_sterilized_at: parsed.lastSterilizedAt,
    });

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create equipment." };
  }
}

export async function updateEquipmentAction(
  input: z.infer<typeof UpdateEquipmentInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = UpdateEquipmentInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase
      .from("equipment")
      .update({
        name: parsed.name,
        type: parsed.type,
        status: parsed.status,
        assigned_case_id: parsed.assignedCaseId,
        last_sterilized_at: parsed.lastSterilizedAt,
      })
      .eq("id", parsed.equipmentId)
      .eq("hospital_id", hospitalId);

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update equipment." };
  }
}

export async function deleteEquipmentAction(
  input: z.infer<typeof DeleteEquipmentInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = DeleteEquipmentInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(parsed.hospitalSlug);

    const { error } = await supabase
      .from("equipment")
      .delete()
      .eq("id", parsed.equipmentId)
      .eq("hospital_id", hospitalId);

    if (error) throw new Error(error.message);
    revalidateHospitalRoutes(hospitalSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete equipment." };
  }
}
