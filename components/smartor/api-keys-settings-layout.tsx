import { Copy, Eye, MoreVertical, Plus, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";

type KeyRow = {
  name: string;
  key: string;
  note: string;
};

const settingsGroups = [
  {
    title: "Configuration",
    items: ["General", "Compute and Disk", "Infrastructure", "Integrations", "API Keys", "JWT Keys", "Log Drains", "Add Ons"],
  },
  {
    title: "Integrations",
    items: ["Data API", "Vault"],
  },
  {
    title: "Billing",
    items: ["Subscription", "Usage"],
  },
] as const;

const publishableKeys: KeyRow[] = [
  {
    name: "default",
    key: "sb_publishable_o-JZcGzssjbmWjzqAyp_tA_kGdEC...",
    note: "Publishable keys can be safely shared publicly",
  },
];

const secretKeys: KeyRow[] = [
  {
    name: "default",
    key: "sb_secret_oyqq-***************",
    note: "Use secret keys only on trusted backend services",
  },
];

export function ApiKeysSettingsLayout() {
  return (
    <div className="overflow-hidden rounded-3xl border border-line/70 bg-white/90 shadow-[0_18px_50px_rgba(10,35,62,0.12)]">
      <div className="grid min-h-[680px] lg:grid-cols-[250px_1fr]">
        <aside className="border-b border-line/70 bg-background/60 p-5 lg:border-b-0 lg:border-r">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accentStrong">
            <Settings2 className="size-3.5" />
            Settings
          </div>

          <div className="space-y-5">
            {settingsGroups.map((group) => (
              <div key={group.title}>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted">{group.title}</p>
                <div className="mt-2 grid gap-1.5">
                  {group.items.map((item) => {
                    const isActive = item === "API Keys";
                    return (
                      <button
                        key={item}
                        type="button"
                        className={cn(
                          "rounded-xl px-3 py-2 text-left text-sm transition",
                          isActive
                            ? "border border-accent/20 bg-accent/10 font-semibold text-accentStrong"
                            : "text-foreground/80 hover:bg-white hover:text-foreground",
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="space-y-6 p-5 md:p-7">
          <header>
            <h2 className="font-display text-3xl text-foreground">API Keys</h2>
            <p className="mt-1 text-sm text-muted">
              Configure API keys to securely control access to your project.
            </p>

            <div className="mt-4 inline-flex rounded-xl border border-line/70 bg-background/70 p-1 text-sm">
              <button type="button" className="rounded-lg border border-accent/20 bg-white px-3 py-1.5 font-semibold text-accentStrong">
                Publishable and secret API keys
              </button>
              <button type="button" className="rounded-lg px-3 py-1.5 text-muted transition hover:text-foreground">
                Legacy anon, service_role API keys
              </button>
            </div>
          </header>

          <div className="rounded-2xl border border-line/70 bg-background/55 p-4 text-sm text-muted">
            <p className="font-semibold text-foreground">Your new API keys are here</p>
            <p className="mt-1">We updated API keys to improve security and delivery posture for production workloads.</p>
          </div>

          <KeyTable
            title="Publishable key"
            description="This key is safe to use in a browser when Row Level Security policies are enabled."
            actionLabel="New publishable key"
            rows={publishableKeys}
            includeReveal={false}
          />

          <KeyTable
            title="Secret keys"
            description="Secret keys allow privileged API access. Use only in servers, workers, or secure backend services."
            actionLabel="New secret key"
            rows={secretKeys}
            includeReveal
          />
        </section>
      </div>
    </div>
  );
}

type KeyTableProps = {
  title: string;
  description: string;
  actionLabel: string;
  rows: KeyRow[];
  includeReveal: boolean;
};

function KeyTable({ title, description, actionLabel, rows, includeReveal }: KeyTableProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-line/70 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>

        <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-line/80 bg-background/75 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-accent/25 hover:bg-white">
          <Plus className="size-3.5" />
          {actionLabel}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-line/70">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-background/65 text-left text-xs uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">API key</th>
              <th className="px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-line/60">
                <td className="px-3 py-3">
                  <p className="font-semibold text-foreground">{row.name}</p>
                  <p className="text-xs text-muted">No description</p>
                </td>
                <td className="px-3 py-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-background/70 px-3 py-1 text-xs text-muted">
                    <span className="font-semibold text-foreground/85">{row.key}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{row.note}</p>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {includeReveal ? (
                      <button type="button" className="rounded-lg border border-line/70 p-1.5 text-muted transition hover:text-foreground" aria-label="Reveal key">
                        <Eye className="size-4" />
                      </button>
                    ) : null}
                    <button type="button" className="rounded-lg border border-line/70 p-1.5 text-muted transition hover:text-foreground" aria-label="Copy key">
                      <Copy className="size-4" />
                    </button>
                    <button type="button" className="rounded-lg border border-line/70 p-1.5 text-muted transition hover:text-foreground" aria-label="More options">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
