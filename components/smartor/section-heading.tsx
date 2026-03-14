import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-line/50 pb-4">
      <div className="max-w-3xl space-y-2">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-muted/90">{eyebrow}</p>
        <h2 className="font-display text-[2rem] leading-tight text-foreground">{title}</h2>
        <p className="text-sm leading-7 text-muted md:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}
