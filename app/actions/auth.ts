"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { resolvePreferredHospitalSlug } from "@/lib/smartor/default-hospital";
import { provisionHospitalForUser } from "@/lib/smartor/provisioning";
import { hasSupabaseBrowserEnv, hasSupabaseServiceRoleEnv, resolveSiteUrl } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignInSchema, SignUpSchema } from "@/lib/validations/auth";

function redirectWith(
  path: string,
  key: "error" | "message",
  value: string,
): never {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
}

export async function signInAction(formData: FormData) {
  if (!hasSupabaseBrowserEnv()) {
    redirectWith("/login", "error", "Supabase credentials are not configured.");
  }

  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirectWith("/login", "error", "Enter a valid email and password.");
  }

  const credentials = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    redirectWith("/login", "error", error.message);
  }

  const signedInUserId = data.user?.id;
  const preferredHospitalSlug = signedInUserId
    ? await resolvePreferredHospitalSlug(supabase, signedInUserId)
    : null;

  if (preferredHospitalSlug) {
    redirect(`/hospitals/${preferredHospitalSlug}`);
  }

  redirect("/");
}

export async function signUpAction(formData: FormData) {
  if (!hasSupabaseBrowserEnv()) {
    redirectWith("/register", "error", "Supabase credentials are not configured.");
  }

  if (!hasSupabaseServiceRoleEnv()) {
    redirectWith(
      "/register",
      "error",
      "SUPABASE_SERVICE_ROLE_KEY is required to provision a hospital workspace.",
    );
  }

  const parsed = SignUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    hospitalName: formData.get("hospitalName"),
    city: formData.get("city"),
    state: formData.get("state"),
  });

  if (!parsed.success) {
    redirectWith("/register", "error", "Complete every field with valid values.");
  }

  const values = parsed.data;
  const forwardedHost = (await headers()).get("origin");
  const redirectTo = `${resolveSiteUrl(forwardedHost)}/auth/callback`;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: values.fullName,
      },
    },
  });

  if (error || !data.user) {
    redirectWith("/register", "error", error?.message ?? "Unable to create account.");
  }

  const user = data.user;

  try {
    await provisionHospitalForUser({
      userId: user.id,
      email: values.email,
      fullName: values.fullName,
      hospitalName: values.hospitalName,
      city: values.city,
      state: values.state,
    });
  } catch (provisionError) {
    const message =
      provisionError instanceof Error
        ? provisionError.message
        : "Hospital provisioning failed.";

    redirectWith("/register", "error", message);
  }

  redirectWith(
    "/login",
    "message",
    "Account created. Check your email if confirmations are enabled, then sign in.",
  );
}

export async function signOutAction() {
  if (hasSupabaseBrowserEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
