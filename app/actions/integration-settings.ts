"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const managerRoles = ["hospital_admin", "or_director", "scheduler"] as const;
const integrationStatuses = ["Connected", "Sandbox", "Pending", "Disconnected"] as const;

const CreateIntegrationSettingInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  integrationKey: z.string().min(2),
  integrationLabel: z.string().min(2),
  vendorName: z.string().min(2),
  status: z.enum(integrationStatuses),
  baseUrl: z.string().nullable(),
  notes: z.string().nullable(),
});

const UpdateIntegrationSettingInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  integrationId: z.string().min(1),
  integrationLabel: z.string().min(2),
  vendorName: z.string().min(2),
  status: z.enum(integrationStatuses),
  baseUrl: z.string().nullable(),
  notes: z.string().nullable(),
});

const DeleteIntegrationSettingInputSchema = z.object({
  hospitalSlug: z.string().min(1),
  integrationId: z.string().min(1),
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
    throw new Error("You do not have permission to modify integration settings.");
  }

  return { supabase, hospitalId: hospital.id, hospitalSlug: hospital.slug };
}

export async function createIntegrationSettingAction(
  input: z.infer<typeof CreateIntegrationSettingInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = CreateIntegrationSettingInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(
      parsed.hospitalSlug,
    );

    const { error } = await supabase.from("hospital_integrations").insert({
      id: `integration-${crypto.randomUUID()}`,
      hospital_id: hospitalId,
      integration_key: parsed.integrationKey.trim().toLowerCase().replace(/\s+/g, "_"),
      integration_label: parsed.integrationLabel,
      vendor_name: parsed.vendorName,
      status: parsed.status,
      base_url: parsed.baseUrl,
      notes: parsed.notes,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/hospitals/${hospitalSlug}/admin-controls`);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create integration setting.",
    };
  }
}

export async function updateIntegrationSettingAction(
  input: z.infer<typeof UpdateIntegrationSettingInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = UpdateIntegrationSettingInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(
      parsed.hospitalSlug,
    );

    const payload = {
      integration_label: parsed.integrationLabel,
      vendor_name: parsed.vendorName,
      status: parsed.status,
      base_url: parsed.baseUrl,
      notes: parsed.notes,
      last_sync_at:
        parsed.status === "Connected" ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from("hospital_integrations")
      .update(payload)
      .eq("id", parsed.integrationId)
      .eq("hospital_id", hospitalId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/hospitals/${hospitalSlug}/admin-controls`);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update integration setting.",
    };
  }
}

export async function deleteIntegrationSettingAction(
  input: z.infer<typeof DeleteIntegrationSettingInputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = DeleteIntegrationSettingInputSchema.parse(input);
    const { supabase, hospitalId, hospitalSlug } = await resolveManagedHospital(
      parsed.hospitalSlug,
    );

    const { error } = await supabase
      .from("hospital_integrations")
      .delete()
      .eq("id", parsed.integrationId)
      .eq("hospital_id", hospitalId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/hospitals/${hospitalSlug}/admin-controls`);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete integration setting.",
    };
  }
}
