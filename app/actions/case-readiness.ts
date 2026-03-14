"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const managerRoles = ["hospital_admin", "or_director", "scheduler"] as const;

const UpdateCaseReadinessInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  caseId: z.string().min(1),
  status: z.enum(["Scheduled", "Pre-op", "Ready", "In Surgery", "Turnover", "Delayed", "Waitlist"]),
  insuranceStatus: z.enum(["Authorized", "Pending", "Missing"]),
  documentationStatus: z.enum(["Complete", "In Review", "Missing"]),
  delayReason: z.string().nullable(),
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
    throw new Error("You do not have permission to update case readiness.");
  }

  return { supabase, hospitalId: hospital.id, hospitalSlug: hospital.slug };
}

export async function updateCaseReadinessAction(
  input: z.infer<typeof UpdateCaseReadinessInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = UpdateCaseReadinessInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(
      parsed.hospitalSlug,
    );

    const { error } = await supabase
      .from("surgery_cases")
      .update({
        status: parsed.status,
        insurance_status: parsed.insuranceStatus,
        documentation_status: parsed.documentationStatus,
        delay_reason: parsed.delayReason,
      })
      .eq("id", parsed.caseId)
      .eq("hospital_id", hospitalId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/hospitals/${hospitalSlug}`);
    revalidatePath(`/hospitals/${hospitalSlug}/coordination`);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update readiness.",
    };
  }
}
