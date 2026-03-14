import type { Metadata } from "next";

import { OverviewMetricsCrudTable } from "@/components/smartor/overview-metrics-crud-table";

import { renderNoAccessContext, resolveHospitalPageContext } from "../context";

type HospitalOverviewCrudPageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: HospitalOverviewCrudPageProps): Promise<Metadata> {
  const { hospitalSlug } = await params;

  return {
    title: `${hospitalSlug} Hospital Overview`,
    description: "Manager workspace for hospital overview metrics CRUD.",
  };
}

export const dynamic = "force-dynamic";

export default async function HospitalOverviewCrudPage({
  params,
}: HospitalOverviewCrudPageProps) {
  const { hospitalSlug } = await params;
  const context = await resolveHospitalPageContext(hospitalSlug);

  if (context.mode === "no-access") {
    return renderNoAccessContext(context.viewerName, context.viewerEmail);
  }

  const canManageOverview = ["hospital_admin", "or_director", "scheduler"].includes(
    context.activeMembership.role,
  );

  if (!canManageOverview) {
    return (
      <div className="rounded-3xl border border-line/70 bg-white/80 p-6 text-sm text-muted">
        Your current role does not include hospital overview management access.
      </div>
    );
  }

  return (
    <OverviewMetricsCrudTable
      hospitalSlug={hospitalSlug}
      metrics={context.data.overviewMetrics}
      canMutate={canManageOverview}
    />
  );
}
