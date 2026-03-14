import { Suspense, type ReactNode } from "react";

import { DashboardSidebar } from "@/components/smartor/dashboard-sidebar";
import { HospitalShellHeader } from "@/components/smartor/hospital-shell-header";

import {
  renderNoAccessContext,
  resolveHospitalPageContext,
} from "./context";
import HospitalRouteLoading from "./loading";

type HospitalLayoutProps = {
  children: ReactNode;
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function HospitalLayout({ children, params }: HospitalLayoutProps) {
  const { hospitalSlug } = await params;
  const context = await resolveHospitalPageContext(hospitalSlug);

  if (context.mode === "no-access") {
    return renderNoAccessContext(context.viewerName, context.viewerEmail);
  }

  const activeCases = context.data.cases.filter((caseItem) => caseItem.status !== "Waitlist").length;

  return (
    <main className="flex min-h-screen w-full flex-col gap-4 px-3 py-4 md:px-4 lg:gap-0 lg:px-0 lg:py-0">
      <div className="px-1 lg:px-6 lg:pt-4">{context.banner}</div>
      <HospitalShellHeader
        hospitalName={context.data.hospital.name}
        city={context.data.hospital.city}
        state={context.data.hospital.state}
        ehrStatus={context.data.hospital.ehrStatus}
        activeCases={activeCases}
        openAlerts={context.data.hospital.alertsOpen}
      />
      <div className="dashboard-stage flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
        <DashboardSidebar
          hospitals={context.hospitals}
          activeMembership={context.activeMembership}
          currentHospitalSlug={context.data.hospital.slug}
          viewerName={context.viewerName}
          viewerEmail={context.viewerEmail}
          insights={{
            rooms: context.data.rooms.length,
            surgeons: context.data.surgeons.length,
            staff: context.data.staff.length,
            hospitals: context.hospitals.length,
            users: context.data.surgeons.length + context.data.staff.length,
            overviewMetrics: context.data.overviewMetrics.length,
          }}
        />

        <div className="content-canvas relative z-[1] min-w-0 flex-1 space-y-8 rounded-[20px] border border-white/80 p-4 shadow-[0_14px_36px_rgba(10,34,60,0.1)] md:p-7 lg:mb-4 lg:ml-4 lg:mr-4 lg:mt-4">
          <section>
            <Suspense fallback={<HospitalRouteLoading />}>{children}</Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
