import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Hospital,
  Layers,
  Smartphone,
  UsersRound,
} from "lucide-react";

import { NoAccessState } from "@/components/smartor/no-access-state";
import { getOverviewData } from "@/lib/smartor/data";

export const metadata: Metadata = {
  title: "Intelligent Surgical Operations",
  description:
    "SmartOR landing page inspired by the Casetabs blueprint for real-time surgical scheduling and operating room coordination.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getOverviewData();

  if (data.mode === "supabase") {
    redirect(`/hospitals/${data.activeMembership.hospitalSlug}`);
  }

  if (data.mode === "no-access") {
    return (
      <NoAccessState
        viewerName={data.viewer.fullName}
        viewerEmail={data.viewer.email}
      />
    );
  }

  const mustHaveFeatures = [
    "Real-time OR dashboard",
    "Drag-and-drop scheduling",
    "Surgeon calendar integration",
    "Equipment and resource tracking",
    "Staff scheduling and assignments",
    "Case duration estimation",
    "Automated notifications",
    "Patient pre-op workflow",
  ];

  const advancedCapabilities = [
    "Conflict resolution engine",
    "Emergency case integration",
    "Multi-hospital management",
    "Insurance and authorization tracking",
    "Preference cards management",
    "Block time management",
    "Case documentation portal",
    "Waitlist and throughput optimization",
  ];

  const systemStats = [
    {
      label: "OR Utilization Target",
      value: "87%",
      icon: Layers,
    },
    {
      label: "First Case On-Time",
      value: "94%",
      icon: Clock3,
    },
    {
      label: "Auto-Resolved Conflicts",
      value: "73%",
      icon: CheckCircle2,
    },
    {
      label: "Mobile Team Coverage",
      value: "24/7",
      icon: Smartphone,
    },
  ];

  return (
    <main className="relative overflow-hidden px-6 pb-16 pt-6 md:px-12 md:pb-24 md:pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-[-220px] h-[460px] bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.22),transparent_62%)]" />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="surface-panel flex items-center justify-between rounded-2xl px-5 py-3 md:px-7">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-800">
              <Hospital className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-lg text-ink-900">SmartOR</p>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Surgical command center</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-line/80 bg-white/80 px-4 py-2 text-sm font-semibold text-ink-800 transition hover:bg-white"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accentStrong to-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(24,108,86,0.28)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
            >
              Register
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        <div className="surface-panel relative overflow-hidden p-7 md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/4 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/85 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
              <Hospital className="h-3.5 w-3.5" />
              Clinical Operations and Care Delivery
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <h1 className="font-display text-4xl font-semibold leading-tight text-ink-900 md:text-6xl">
                  Intelligent Surgical Operations Management Platform
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-ink-700 md:text-lg">
                  SmartOR is a Casetabs-inspired command layer for real-time
                  surgical scheduling, OR coordination, and throughput control.
                  It is designed for teams that need one operational picture
                  across rooms, surgeons, staff, and pre-op readiness.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/login"
                    className="btn-primary inline-flex items-center gap-2 bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Open Command Center
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full border border-line/80 bg-white/70 px-5 py-2.5 text-sm font-semibold text-ink-800 transition hover:bg-white"
                  >
                    Request Access
                  </Link>
                </div>

                <p className="text-sm text-muted">
                  Blueprint anchor: Casetabs domain analysis generated on March
                  09, 2026. Market reference: surgical scheduling software
                  projected to reach $465M by 2028.
                </p>
              </div>

              <div className="rounded-3xl border border-line/70 bg-white/80 p-5 shadow-panel">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                  Live Operations Snapshot
                </h2>
                <div className="mt-4 grid gap-3">
                  {systemStats.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-line/70 bg-white/90 px-4 py-3"
                    >
                      <div className="flex items-center gap-2.5 text-sm text-ink-700">
                        <item.icon className="h-4 w-4 text-accentStrong" />
                        {item.label}
                      </div>
                      <span className="font-display text-xl font-semibold text-ink-900">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="surface-panel p-6 md:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-900">
              <CalendarClock className="h-3.5 w-3.5" />
              Must-Have Features
            </div>
            <h2 className="font-display text-2xl text-ink-900 md:text-3xl">
              Core execution layer for the OR day
            </h2>
            <ul className="mt-5 grid gap-3 text-sm text-ink-700 md:text-base">
              {mustHaveFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 rounded-xl border border-line/65 bg-white/80 px-3.5 py-2.5"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accentStrong" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="surface-panel p-6 md:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-900">
              <UsersRound className="h-3.5 w-3.5" />
              Strategic Capabilities
            </div>
            <h2 className="font-display text-2xl text-ink-900 md:text-3xl">
              Coordination intelligence across teams and sites
            </h2>
            <ul className="mt-5 grid gap-3 text-sm text-ink-700 md:text-base">
              {advancedCapabilities.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 rounded-xl border border-line/65 bg-white/80 px-3.5 py-2.5"
                >
                  <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
