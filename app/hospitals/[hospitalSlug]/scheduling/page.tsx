import type { Metadata } from "next";

import { Panel } from "@/components/smartor/panel";
import { ScheduleBoard } from "@/components/smartor/schedule-board";
import { SchedulingCrudPanel } from "@/components/smartor/scheduling-crud-panel";
import { hasPermission } from "@/lib/smartor/permissions";

import {
  renderNoAccessContext,
  resolveHospitalPageContext,
} from "../context";

type SchedulingPageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: SchedulingPageProps): Promise<Metadata> {
  const { hospitalSlug } = await params;

  return {
    title: `${hospitalSlug} Scheduling`,
    description:
      "Dedicated scheduling workspace for sequencing cases, room balancing, and schedule mutation controls.",
  };
}

export const dynamic = "force-dynamic";

export default async function HospitalSchedulingPage({ params }: SchedulingPageProps) {
  const { hospitalSlug } = await params;
  const context = await resolveHospitalPageContext(hospitalSlug);

  if (context.mode === "no-access") {
    return renderNoAccessContext(context.viewerName, context.viewerEmail);
  }

  const canSeeScheduling = hasPermission(context.activeMembership.role, "scheduling");

  return (
    <>
      {canSeeScheduling ? (
        <div className="space-y-4">
          <ScheduleBoard
            rooms={context.data.rooms}
            cases={context.data.cases}
            surgeons={context.data.surgeons}
            waitlist={context.data.waitlist}
          />
          <SchedulingCrudPanel
            hospitalSlug={context.data.hospital.slug}
            cases={context.data.cases}
            surgeons={context.data.surgeons}
            rooms={context.data.rooms}
            canMutate={canSeeScheduling}
          />
        </div>
      ) : (
        <Panel className="bg-white/80 p-6 text-sm text-muted">
          Your current role does not include scheduling access.
        </Panel>
      )}
    </>
  );
}
