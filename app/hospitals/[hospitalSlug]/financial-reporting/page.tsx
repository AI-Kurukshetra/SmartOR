import type { Metadata } from "next";
import { CircleDollarSign, HandCoins, Landmark } from "lucide-react";

import { MetricCard } from "@/components/smartor/metric-card";
import { Panel } from "@/components/smartor/panel";
import { hasPermission } from "@/lib/smartor/permissions";
import { formatCurrency, formatPercent } from "@/lib/utils";

import {
  renderNoAccessContext,
  resolveHospitalPageContext,
} from "../context";

type FinancialReportingPageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: FinancialReportingPageProps): Promise<Metadata> {
  const { hospitalSlug } = await params;

  return {
    title: `${hospitalSlug} Financial Reporting`,
    description:
      "Dedicated financial reporting workspace for utilization, cost per procedure, and revenue monitoring.",
  };
}

export const dynamic = "force-dynamic";

export default async function HospitalFinancialReportingPage({
  params,
}: FinancialReportingPageProps) {
  const { hospitalSlug } = await params;
  const context = await resolveHospitalPageContext(hospitalSlug);

  if (context.mode === "no-access") {
    return renderNoAccessContext(context.viewerName, context.viewerEmail);
  }

  const canSeeFinancialReporting = hasPermission(
    context.activeMembership.role,
    "financial_reporting",
  );

  if (!canSeeFinancialReporting) {
    return (
      <div className="rounded-3xl border border-line/70 bg-white/80 p-6 text-sm text-muted">
        Your current role does not include financial reporting access.
      </div>
    );
  }

  const totalDepartments = context.data.costCenters.length;
  const totalRevenuePerDay = context.data.costCenters.reduce(
    (sum, costCenter) => sum + costCenter.revenuePerOrDay,
    0,
  );
  const averageCostPerProcedure =
    totalDepartments === 0
      ? 0
      :
          context.data.costCenters.reduce(
            (sum, costCenter) => sum + costCenter.costPerProcedure,
            0,
          ) / totalDepartments;
  const averageUtilization =
    totalDepartments === 0
      ? 0
      :
          context.data.costCenters.reduce(
            (sum, costCenter) => sum + costCenter.utilizationRate,
            0,
          ) / totalDepartments;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon={Landmark}
          label="Revenue per OR day"
          value={formatCurrency(totalRevenuePerDay)}
          detail="Aggregate projected revenue across hospital cost centers."
        />
        <MetricCard
          icon={HandCoins}
          label="Average cost per procedure"
          value={formatCurrency(averageCostPerProcedure)}
          detail="Mean procedural cost computed from current departmental allocation."
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Average utilization"
          value={formatPercent(averageUtilization)}
          detail="Financial utilization trend from mapped cost-center performance."
        />
      </section>

      <Panel
        eyebrow="Department financials"
        title="Cost center breakdown"
        description="Review department-level utilization, procedural cost, and per-day revenue output."
      >
        <div className="space-y-3">
          {context.data.costCenters.map((costCenter) => (
            <div
              key={costCenter.id}
              className="grid gap-2 rounded-2xl border border-line/70 bg-white/80 p-3 md:grid-cols-4"
            >
              <p className="font-semibold text-foreground">{costCenter.department}</p>
              <p className="text-sm text-muted">
                Utilization: <span className="font-medium text-foreground">{formatPercent(costCenter.utilizationRate)}</span>
              </p>
              <p className="text-sm text-muted">
                Cost/Procedure: <span className="font-medium text-foreground">{formatCurrency(costCenter.costPerProcedure)}</span>
              </p>
              <p className="text-sm text-muted">
                Revenue/OR Day: <span className="font-medium text-foreground">{formatCurrency(costCenter.revenuePerOrDay)}</span>
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
