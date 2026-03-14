import type { Metadata } from "next";
import { ShieldCheck, UserCog } from "lucide-react";

import { IntegrationSettingsPanel } from "@/components/smartor/integration-settings-panel";
import { Panel } from "@/components/smartor/panel";
import { hasPermission } from "@/lib/smartor/permissions";

import { renderNoAccessContext, resolveHospitalPageContext } from "../context";

type AdminControlsPageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: AdminControlsPageProps): Promise<Metadata> {
  const { hospitalSlug } = await params;

  return {
    title: `${hospitalSlug} Admin Controls`,
    description:
      "Dedicated admin controls workspace for governance, access policy, and integration settings.",
  };
}

export const dynamic = "force-dynamic";

export default async function HospitalAdminControlsPage({ params }: AdminControlsPageProps) {
  const { hospitalSlug } = await params;
  const context = await resolveHospitalPageContext(hospitalSlug);

  if (context.mode === "no-access") {
    return renderNoAccessContext(context.viewerName, context.viewerEmail);
  }

  const canSeeAdminControls = hasPermission(context.activeMembership.role, "admin_controls");

  if (!canSeeAdminControls) {
    return (
      <div className="rounded-3xl border border-line/70 bg-white/80 p-6 text-sm text-muted">
        Your current role does not include admin controls access.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel className="bg-white/80">
        <div className="inline-flex rounded-xl border border-accent/20 bg-accent/10 p-2 text-accentStrong">
          <UserCog className="size-4" />
        </div>
        <h4 className="mt-4 font-semibold text-foreground">Role and escalation policy</h4>
        <p className="mt-2 text-sm text-muted">
          Review privileged role assignments, escalation owners, and approval paths before policy updates.
        </p>
      </Panel>

      <Panel className="bg-white/80">
        <div className="inline-flex rounded-xl border border-accent/20 bg-accent/10 p-2 text-accentStrong">
          <ShieldCheck className="size-4" />
        </div>
        <h4 className="mt-4 font-semibold text-foreground">Security guardrails</h4>
        <p className="mt-2 text-sm text-muted">
          Track access posture, session hygiene, and audit-readiness controls for hospital operations.
        </p>
      </Panel>

      <IntegrationSettingsPanel
        hospitalSlug={hospitalSlug}
        settings={context.data.integrationSettings}
        canMutate={canSeeAdminControls}
      />
    </div>
  );
}
