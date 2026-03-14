import type { Metadata } from "next";
import { Cable, WalletCards } from "lucide-react";

import { CaseReadinessCrudPanel } from "@/components/smartor/case-readiness-crud-panel";
import { Panel } from "@/components/smartor/panel";
import { SupportModules } from "@/components/smartor/support-modules";
import { hasPermission } from "@/lib/smartor/permissions";

import {
  renderNoAccessContext,
  resolveHospitalPageContext,
} from "../context";

type CoordinationPageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: CoordinationPageProps): Promise<Metadata> {
  const { hospitalSlug } = await params;

  return {
    title: `${hospitalSlug} Coordination`,
    description:
      "Dedicated coordination workspace for support modules, notifications, documentation, and communication.",
  };
}

export const dynamic = "force-dynamic";

export default async function HospitalCoordinationPage({ params }: CoordinationPageProps) {
  const { hospitalSlug } = await params;
  const context = await resolveHospitalPageContext(hospitalSlug);

  if (context.mode === "no-access") {
    return renderNoAccessContext(context.viewerName, context.viewerEmail);
  }

  const canSeeCoordination = hasPermission(context.activeMembership.role, "coordination");
  const canMutateReadiness = ["hospital_admin", "or_director", "scheduler"].includes(
    context.activeMembership.role,
  );

  return (
    <>
      {canSeeCoordination ? (
        <div className="space-y-4">
          <SupportModules
            cases={context.data.cases}
            notifications={context.data.notifications}
            blockTimes={context.data.blockTimes}
            waitlist={context.data.waitlist}
            preferenceCards={context.data.preferenceCards}
            documents={context.data.documents}
            costCenters={context.data.costCenters}
            threads={context.data.threads}
            surgeons={context.data.surgeons}
          />
          <CaseReadinessCrudPanel
            hospitalSlug={context.data.hospital.slug}
            cases={context.data.cases}
            canMutate={canMutateReadiness}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Panel className="bg-white/80">
              <div className="inline-flex rounded-xl border border-accent/20 bg-accent/10 p-2 text-accentStrong">
                <Cable className="size-4" />
              </div>
              <h4 className="mt-4 font-semibold text-foreground">Integration boundaries</h4>
              <p className="mt-2 text-sm text-muted">
                Keep outbound handoffs mapped to EHR, patient messaging, billing, and analytics lanes.
              </p>
            </Panel>
            <Panel className="bg-white/80">
              <div className="inline-flex rounded-xl border border-accent/20 bg-accent/10 p-2 text-accentStrong">
                <WalletCards className="size-4" />
              </div>
              <h4 className="mt-4 font-semibold text-foreground">Revenue checkpoint</h4>
              <p className="mt-2 text-sm text-muted">
                Pair insurance authorization and documentation completion before closing the case loop.
              </p>
            </Panel>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-line/70 bg-white/80 p-6 text-sm text-muted">
          Your current role does not include coordination access.
        </div>
      )}
    </>
  );
}
