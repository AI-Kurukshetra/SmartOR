import type { SupabaseClient } from "@supabase/supabase-js";

type MembershipRow = {
  hospital_id: string;
  is_default: boolean;
};

type ProfileRow = {
  default_hospital_id: string | null;
};

type HospitalRow = {
  id: string;
  slug: string;
};

export async function resolvePreferredHospitalSlug(
  supabase: SupabaseClient,
  userId: string,
) {
  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("default_hospital_id").eq("id", userId).maybeSingle(),
    supabase
      .from("hospital_memberships")
      .select("hospital_id, is_default")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true }),
  ]);

  const membershipRows = (memberships ?? []) as MembershipRow[];

  if (!membershipRows.length) {
    return null;
  }

  const profileRow = profile as ProfileRow | null;
  const preferredHospitalId =
    membershipRows.find((membership) => membership.is_default)?.hospital_id ??
    (profileRow?.default_hospital_id
      ? membershipRows.find(
          (membership) => membership.hospital_id === profileRow.default_hospital_id,
        )?.hospital_id
      : null) ??
    membershipRows[0].hospital_id;

  if (!preferredHospitalId) {
    return null;
  }

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, slug")
    .in(
      "id",
      membershipRows.map((membership) => membership.hospital_id),
    );

  const hospitals = (hospital ?? []) as HospitalRow[];
  const preferredHospital = hospitals.find((item) => item.id === preferredHospitalId);

  return preferredHospital?.slug ?? null;
}
