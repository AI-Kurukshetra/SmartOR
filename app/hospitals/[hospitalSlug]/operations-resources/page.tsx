import type { Metadata } from "next";

import { OperationsResourcesGrid } from "@/components/smartor/operations-resources-grid";
import { hasPermission } from "@/lib/smartor/permissions";

import {
  renderNoAccessContext,
  resolveHospitalPageContext,
} from "../context";

type OperationsResourcesPageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: OperationsResourcesPageProps): Promise<Metadata> {
  const { hospitalSlug } = await params;

  return {
    title: `${hospitalSlug} Operations Resources`,
    description:
      "Dedicated operations resources workspace for surgeon windows, staffing coverage, and instrument readiness.",
  };
}

export const dynamic = "force-dynamic";

export default async function HospitalOperationsResourcesPage({
  params,
}: OperationsResourcesPageProps) {
  const { hospitalSlug } = await params;
  const context = await resolveHospitalPageContext(hospitalSlug);

  if (context.mode === "no-access") {
    return renderNoAccessContext(context.viewerName, context.viewerEmail);
  }

  const canSeeOperations = hasPermission(context.activeMembership.role, "operations");
  const canMutateOperations = ["hospital_admin", "or_director", "scheduler"].includes(
    context.activeMembership.role,
  );

  return (
    <>
      {canSeeOperations ? (
        <OperationsResourcesGrid
          hospitalSlug={hospitalSlug}
          surgeons={context.data.surgeons}
          staff={context.data.staff}
          equipment={context.data.equipment}
          rooms={context.data.rooms}
          cases={context.data.cases}
          canMutate={canMutateOperations}
        />
      ) : (
        <div className="rounded-3xl border border-line/70 bg-white/80 p-6 text-sm text-muted">
          Your current role does not include operations access.
        </div>
      )}
    </>
  );
}
