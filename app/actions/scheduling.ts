"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const managerRoles = ["hospital_admin", "or_director", "scheduler"] as const;

const CreateCaseInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  patientName: z.string().min(2),
  procedureName: z.string().min(2),
  surgeonId: z.string().min(1),
  operatingRoomId: z.string().nullable(),
  scheduledStart: z.string().regex(/^\d{2}:\d{2}$/),
  predictedMinutes: z.number().int().positive(),
  urgency: z.enum(["Elective", "Urgent", "Emergent"]),
});

const UpdateCaseInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  caseId: z.string().min(1),
  operatingRoomId: z.string().nullable(),
  scheduledStart: z.string().regex(/^\d{2}:\d{2}$/),
  predictedMinutes: z.number().int().positive(),
  status: z.enum(["Scheduled", "Pre-op", "Ready", "In Surgery", "Turnover", "Delayed", "Waitlist"]),
  urgency: z.enum(["Elective", "Urgent", "Emergent"]),
});

const DeleteCaseInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  caseId: z.string().min(1),
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
    throw new Error("You do not have permission to modify scheduling data.");
  }

  return { supabase, hospitalId: hospital.id, hospitalSlug: hospital.slug };
}

export async function createSurgeryCaseAction(
  input: z.infer<typeof CreateCaseInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = CreateCaseInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(
      parsed.hospitalSlug,
    );

    const { error } = await supabase.from("surgery_cases").insert({
      id: `case-${crypto.randomUUID()}`,
      hospital_id: hospitalId,
      patient_name: parsed.patientName,
      procedure_name: parsed.procedureName,
      surgeon_id: parsed.surgeonId,
      operating_room_id: parsed.operatingRoomId,
      scheduled_start: parsed.scheduledStart,
      estimated_minutes: parsed.predictedMinutes,
      predicted_minutes: parsed.predictedMinutes,
      actual_minutes: null,
      status: "Scheduled",
      urgency: parsed.urgency,
      insurance_status: "Pending",
      documentation_status: "Missing",
      delay_reason: null,
      staff_ids: [],
      equipment_ids: [],
      pre_op_checklist: [],
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/hospitals/${hospitalSlug}`);
    revalidatePath(`/hospitals/${hospitalSlug}/scheduling`);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create case.",
    };
  }
}

export async function updateSurgeryCaseAction(
  input: z.infer<typeof UpdateCaseInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = UpdateCaseInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(
      parsed.hospitalSlug,
    );

    const { error } = await supabase
      .from("surgery_cases")
      .update({
        operating_room_id: parsed.operatingRoomId,
        scheduled_start: parsed.scheduledStart,
        predicted_minutes: parsed.predictedMinutes,
        status: parsed.status,
        urgency: parsed.urgency,
      })
      .eq("id", parsed.caseId)
      .eq("hospital_id", hospitalId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/hospitals/${hospitalSlug}`);
    revalidatePath(`/hospitals/${hospitalSlug}/scheduling`);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update case.",
    };
  }
}

export async function deleteSurgeryCaseAction(
  input: z.infer<typeof DeleteCaseInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = DeleteCaseInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(
      parsed.hospitalSlug,
    );

    const { error } = await supabase
      .from("surgery_cases")
      .delete()
      .eq("id", parsed.caseId)
      .eq("hospital_id", hospitalId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/hospitals/${hospitalSlug}`);
    revalidatePath(`/hospitals/${hospitalSlug}/scheduling`);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete case.",
    };
  }
}
