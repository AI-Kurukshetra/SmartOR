import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function Panel({
  eyebrow,
  title,
  description,
  action,
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <div className={cn("surface-panel p-5 md:p-6", className)} {...props}>
      {(eyebrow || title || description || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            {eyebrow ? (
              <p className="text-[0.63rem] font-semibold uppercase tracking-[0.24em] text-muted/90">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h3 className="font-display text-[1.34rem] leading-tight text-foreground">{title}</h3> : null}
            {description ? <p className="max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
