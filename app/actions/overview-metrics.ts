"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const managerRoles = ["hospital_admin", "or_director", "scheduler"] as const;
const metricUnitOptions = ["count", "percent", "currency", "minutes"] as const;
const metricTrendOptions = ["up", "down", "stable"] as const;

const CreateOverviewMetricInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  metricKey: z.string().min(2),
  metricLabel: z.string().min(2),
  metricValue: z.number(),
  unit: z.enum(metricUnitOptions),
  targetValue: z.number().nullable(),
  trend: z.enum(metricTrendOptions),
  owner: z.string().min(2),
  note: z.string().nullable(),
});

const UpdateOverviewMetricInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  metricId: z.string().min(1),
  metricLabel: z.string().min(2),
  metricValue: z.number(),
  unit: z.enum(metricUnitOptions),
  targetValue: z.number().nullable(),
  trend: z.enum(metricTrendOptions),
  owner: z.string().min(2),
  note: z.string().nullable(),
});

const DeleteOverviewMetricInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  metricId: z.string().min(1),
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
    throw new Error("You do not have permission to modify overview metrics.");
  }

  return { supabase, hospitalId: hospital.id, hospitalSlug: hospital.slug };
}

export async function createOverviewMetricAction(
  input: z.infer<typeof CreateOverviewMetricInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = CreateOverviewMetricInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(
      parsed.hospitalSlug,
    );

    const { error } = await supabase.from("overview_metrics").insert({
      id: `metric-${crypto.randomUUID()}`,
      hospital_id: hospitalId,
      metric_key: parsed.metricKey,
      metric_label: parsed.metricLabel,
      metric_value: parsed.metricValue,
      unit: parsed.unit,
      target_value: parsed.targetValue,
      trend: parsed.trend,
      owner: parsed.owner,
      note: parsed.note,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/hospitals/${hospitalSlug}`);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create overview metric.",
    };
  }
}

export async function updateOverviewMetricAction(
  input: z.infer<typeof UpdateOverviewMetricInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = UpdateOverviewMetricInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(
      parsed.hospitalSlug,
    );

    const { error } = await supabase
      .from("overview_metrics")
      .update({
        metric_label: parsed.metricLabel,
        metric_value: parsed.metricValue,
        unit: parsed.unit,
        target_value: parsed.targetValue,
        trend: parsed.trend,
        owner: parsed.owner,
        note: parsed.note,
      })
      .eq("id", parsed.metricId)
      .eq("hospital_id", hospitalId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/hospitals/${hospitalSlug}`);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update overview metric.",
    };
  }
}

export async function deleteOverviewMetricAction(
  input: z.infer<typeof DeleteOverviewMetricInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = DeleteOverviewMetricInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(
      parsed.hospitalSlug,
    );

    const { error } = await supabase
      .from("overview_metrics")
      .delete()
      .eq("id", parsed.metricId)
      .eq("hospital_id", hospitalId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/hospitals/${hospitalSlug}`);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete overview metric.",
    };
  }
}
