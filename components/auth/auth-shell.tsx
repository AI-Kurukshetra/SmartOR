import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, ShieldCheck, Workflow } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  alternateHref: string;
  alternateLabel: string;
  alternateText: string;
  message?: string;
  error?: string;
  isSupabaseReady: boolean;
};

export function AuthShell({
  title,
  description,
  children,
  alternateHref,
  alternateLabel,
  alternateText,
  message,
  error,
  isSupabaseReady,
}: AuthShellProps) {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-8 md:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-10">
      <section className="surface-panel bg-mesh p-8 md:p-10">
        <div className="flex h-full flex-col justify-between gap-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white/80 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accentStrong">
              <ShieldCheck className="size-4" />
              SmartOR Auth Layer
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-5xl leading-none text-foreground md:text-6xl">
                Control multi-hospital access before the schedule moves.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted md:text-lg">
                Authentication now sits in front of the network overview and each
                hospital dashboard. Once Supabase is configured, users only see
                the hospitals they belong to.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-line/70 bg-white/88 p-5">
              <Workflow className="size-5 text-accentStrong" />
              <p className="mt-4 font-semibold text-foreground">
                Hospital-scoped access
              </p>
              <p className="mt-2 text-sm text-muted">
                Memberships determine which operating room boards and schedules a
                user can access.
              </p>
            </div>
            <div className="rounded-[24px] border border-line/70 bg-white/88 p-5">
              <ChevronRight className="size-5 text-accentStrong" />
              <p className="mt-4 font-semibold text-foreground">
                Admin onboarding
              </p>
              <p className="mt-2 text-sm text-muted">
                The first hospital admin can provision a new hospital workspace
                and starter operational records.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-panel bg-surface/92 p-8 md:p-10">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-muted">
              Secure entry
            </p>
            <h2 className="font-display text-[2.35rem] leading-tight text-foreground">{title}</h2>
            <p className="text-sm leading-7 text-muted md:text-base">{description}</p>
          </div>

          {!isSupabaseReady ? (
            <div className="rounded-[16px] border border-amber/25 bg-amber/10 p-4 text-sm text-amber">
              Supabase environment variables are not configured in this
              workspace. The app will continue to run in demo mode until
              `NEXT_PUBLIC_SUPABASE_URL` and a publishable key are set.
            </div>
          ) : null}

          {message ? (
            <div className="rounded-[16px] border border-accent/20 bg-accent/10 p-4 text-sm text-accentStrong">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[16px] border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
              {error}
            </div>
          ) : null}

          {children}

          <p className="text-sm text-muted">
            {alternateText}{" "}
            <Link href={alternateHref} className="font-semibold text-foreground underline">
              {alternateLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
