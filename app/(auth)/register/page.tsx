import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signUpAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { hasSupabaseBrowserEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Register",
  description: "Create the first SmartOR hospital workspace and its administrator account.",
};

type RegisterPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  if (hasSupabaseBrowserEnv()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/");
    }
  }

  return (
    <AuthShell
      title="Create hospital workspace"
      description="This provisions the first hospital admin account plus a starter command-center dataset so the dashboard is not empty on first login."
      alternateHref="/login"
      alternateLabel="Sign in"
      alternateText="Already have access?"
      message={params.message}
      error={params.error}
      isSupabaseReady={hasSupabaseBrowserEnv()}
    >
      <form action={signUpAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-foreground">Full name</span>
          <input
            name="fullName"
            type="text"
            autoComplete="name"
            required
            className="field-input"
            placeholder="Alex Morgan"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-foreground">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="field-input"
            placeholder="admin@hospital.org"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-foreground">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="field-input"
            placeholder="At least 8 characters"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-foreground">Hospital name</span>
          <input
            name="hospitalName"
            type="text"
            required
            className="field-input"
            placeholder="North Harbor Medical Center"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">City</span>
            <input
              name="city"
              type="text"
              required
              className="field-input"
              placeholder="Seattle"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">State</span>
            <input
              name="state"
              type="text"
              required
              className="field-input"
              placeholder="WA"
            />
          </label>
        </div>
        <SubmitButton
          idleLabel="Provision workspace"
          pendingLabel="Creating workspace..."
          className="btn-primary mt-2 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        />
      </form>
    </AuthShell>
  );
}
