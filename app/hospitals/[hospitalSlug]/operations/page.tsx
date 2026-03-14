import type { Metadata } from "next";

import { OperationsGrid } from "@/components/smartor/operations-grid";
import { hasPermission } from "@/lib/smartor/permissions";

import {
  renderNoAccessContext,
  resolveHospitalPageContext,
} from "../context";

type OperationsPageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: OperationsPageProps): Promise<Metadata> {
  const { hospitalSlug } = await params;

  return {
    title: `${hospitalSlug} Operations`,
    description:
      "Dedicated operations workspace for live OR rooms, staffing, equipment, and conflicts.",
  };
}

export const dynamic = "force-dynamic";

export default async function HospitalOperationsPage({ params }: OperationsPageProps) {
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
        <OperationsGrid
          hospitalSlug={hospitalSlug}
          rooms={context.data.rooms}
          cases={context.data.cases}
          surgeons={context.data.surgeons}
          conflicts={context.data.conflicts}
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
