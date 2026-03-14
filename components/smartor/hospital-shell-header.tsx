import { BellRing, Building2, ClipboardCheck, LogOut } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";

type HospitalShellHeaderProps = {
  hospitalName: string;
  city: string;
  state: string;
  ehrStatus: string;
  activeCases: number;
  openAlerts: number;
};

export function HospitalShellHeader({
  hospitalName,
  city,
  state,
  ehrStatus,
  activeCases,
  openAlerts,
}: HospitalShellHeaderProps) {
  return (
    <header className="command-sidebar-shell sticky top-0 z-40 border border-white/20 p-3 text-white shadow-[0_12px_30px_rgba(4,12,30,0.3)] backdrop-blur lg:rounded-none lg:border-x-0 lg:border-t-0 lg:rounded-b-[14px] lg:px-5 lg:py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex rounded-xl border border-white/20 bg-white/10 p-2">
            <Building2 className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{hospitalName}</p>
            <p className="text-xs text-white/75">
              {city}, {state} · EHR {ehrStatus}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-1">
            <ClipboardCheck className="size-3.5" />
            {activeCases} active
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-1">
            <BellRing className="size-3.5" />
            {openAlerts} alerts
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/18"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
