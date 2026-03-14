import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";

import { AccessBanner } from "@/components/smartor/access-banner";
import { NoAccessState } from "@/components/smartor/no-access-state";
import { getHospitalRouteData, type ViewerMembership } from "@/lib/smartor/data";
import type { Hospital, HospitalDashboardData } from "@/lib/validations/smartor";

type HospitalPageContext =
  | {
      mode: "ok";
      source: "demo" | "supabase";
      data: HospitalDashboardData;
      hospitals: Hospital[];
      activeMembership: ViewerMembership;
      viewerName?: string | null;
      viewerEmail?: string | null;
      banner: ReactNode;
    }
  | {
      mode: "no-access";
      viewerName?: string | null;
      viewerEmail?: string | null;
    };

export async function resolveHospitalPageContext(
  hospitalSlug: string,
): Promise<HospitalPageContext> {
  await simulateHospitalRouteLatency();
  const routeData = await getHospitalRouteData(hospitalSlug);

  if (routeData.mode === "auth-required") {
    redirect("/login");
  }

  if (routeData.mode === "not-found") {
    notFound();
  }

  if (routeData.mode === "no-access") {
    return {
      mode: "no-access",
      viewerName: routeData.viewer.fullName,
      viewerEmail: routeData.viewer.email,
    };
  }

  if (routeData.mode === "demo") {
    return {
      mode: "ok",
      source: "demo",
      data: routeData.data,
      hospitals: routeData.hospitals,
      activeMembership: routeData.activeMembership,
      viewerName: "Demo User",
      viewerEmail: null,
      banner: <AccessBanner mode="demo" />,
    };
  }

  return {
    mode: "ok",
    source: "supabase",
    data: routeData.data,
    hospitals: routeData.hospitals,
    activeMembership: routeData.activeMembership,
    viewerName: routeData.viewer.fullName,
    viewerEmail: routeData.viewer.email,
    banner: (
      <AccessBanner
        mode="supabase"
        viewerName={routeData.viewer.fullName}
        viewerEmail={routeData.viewer.email}
        membershipSummary={routeData.viewer.memberships
          .map((membership) => membership.role)
          .join(", ")}
      />
    ),
  };
}

const HOSPITAL_ROUTE_LOADING_DELAY_MS = 700;

async function simulateHospitalRouteLatency() {
  await new Promise((resolve) => {
    setTimeout(resolve, HOSPITAL_ROUTE_LOADING_DELAY_MS);
  });
}

export function renderNoAccessContext(
  viewerName?: string | null,
  viewerEmail?: string | null,
) {
  return <NoAccessState viewerName={viewerName} viewerEmail={viewerEmail} />;
}
