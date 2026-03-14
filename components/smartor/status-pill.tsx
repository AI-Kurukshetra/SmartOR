import { cn } from "@/lib/utils";

type StatusPillProps = {
  label: string;
};

export function StatusPill({ label }: StatusPillProps) {
  const tone = getToneClasses(label);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em]",
        tone,
      )}
    >
      {label}
    </span>
  );
}

function getToneClasses(label: string) {
  if (["Connected", "Available", "Ready", "Authorized", "Complete", "Info"].includes(label)) {
    return "border-accent/25 bg-accent/10 text-accentStrong";
  }

  if (
    ["In Surgery", "Urgent", "Reserved", "Pre-op", "Turnover", "Watch", "Pending"].includes(
      label,
    )
  ) {
    return "border-amber/30 bg-amber/12 text-amber";
  }

  if (
    ["Delayed", "Emergent", "Critical", "Missing", "Maintenance", "Sandbox"].includes(label)
  ) {
    return "border-danger/30 bg-danger/12 text-danger";
  }

  return "border-line/80 bg-white/78 text-muted";
}
