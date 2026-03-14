import { Panel } from "@/components/smartor/panel";
import { getRoleProfile } from "@/lib/smartor/permissions";
import type { AppRole } from "@/lib/validations/smartor";

type RoleFocusPanelProps = {
  role: AppRole;
};

export function RoleFocusPanel({ role }: RoleFocusPanelProps) {
  const profile = getRoleProfile(role);

  return (
    <Panel
      eyebrow="Role dashboard"
      title={profile.label}
      description="This dashboard layout prioritizes the workflows assigned to your role."
      className="bg-gradient-to-br from-white via-surface to-background/90"
    >
      <ul className="grid gap-2">
        {profile.focusAreas.map((focusArea) => (
          <li
            key={focusArea}
            className="rounded-2xl border border-line/65 bg-white/84 px-3 py-2 text-sm text-foreground"
          >
            {focusArea}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
