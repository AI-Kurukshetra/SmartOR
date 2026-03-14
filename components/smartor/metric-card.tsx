import type { LucideIcon } from "lucide-react";

import { Panel } from "@/components/smartor/panel";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ icon: Icon, label, value, detail }: MetricCardProps) {
  return (
    <Panel className="h-full bg-white/88">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-muted/90">{label}</p>
          <div className="space-y-1.5">
            <p className="font-display text-4xl leading-none text-foreground">{value}</p>
            <p className="text-sm leading-6 text-muted">{detail}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-accent/20 bg-accent/10 p-3 text-accentStrong">
          <Icon className="size-5" />
        </div>
      </div>
    </Panel>
  );
}
