import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signInAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { resolvePreferredHospitalSlug } from "@/lib/smartor/default-hospital";
import { hasSupabaseBrowserEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to SmartOR to access hospital-scoped operating room workflows.",
};

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  if (hasSupabaseBrowserEnv()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const preferredHospitalSlug = await resolvePreferredHospitalSlug(supabase, user.id);

      if (preferredHospitalSlug) {
        redirect(`/hospitals/${preferredHospitalSlug}`);
      }

      redirect("/");
    }
  }

  return (
    <AuthShell
      title="Sign in"
      description="Use your hospital credentials to open your hospital overview and command modules."
      alternateHref="/register"
      alternateLabel="Create an account"
      alternateText="Need a new hospital workspace?"
      message={params.message}
      error={params.error}
      isSupabaseReady={hasSupabaseBrowserEnv()}
    >
      <form action={signInAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-foreground">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="field-input"
            placeholder="ops@hospital.org"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-foreground">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="field-input"
            placeholder="At least 8 characters"
          />
        </label>
        <SubmitButton
          idleLabel="Open SmartOR"
          pendingLabel="Signing in..."
          className="btn-primary mt-2 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        />
      </form>
    </AuthShell>
  );
}
