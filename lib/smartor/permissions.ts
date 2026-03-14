import type { AppRole } from "@/lib/validations/smartor";

export type PermissionKey =
  | "network_overview"
  | "hospital_switcher"
  | "operations"
  | "scheduling"
  | "coordination"
  | "financial_reporting"
  | "admin_controls"
  | "manager_tabs";

type RoleProfile = {
  label: string;
  summary: string;
  focusAreas: string[];
  permissions: PermissionKey[];
};

const roleProfiles: Record<AppRole, RoleProfile> = {
  hospital_admin: {
    label: "Hospital Admin",
    summary: "Owns performance, policy, and escalation across the hospital OR footprint.",
    focusAreas: [
      "Network posture and alerts",
      "Financial and throughput trends",
      "Cross-team escalations",
    ],
    permissions: [
      "network_overview",
      "hospital_switcher",
      "operations",
      "scheduling",
      "coordination",
      "financial_reporting",
      "admin_controls",
      "manager_tabs",
    ],
  },
  or_director: {
    label: "OR Director",
    summary: "Drives same-day room flow, staffing, and resource readiness.",
    focusAreas: [
      "Utilization and turnover",
      "Staffing and room bottlenecks",
      "Case delays and conflicts",
    ],
    permissions: [
      "network_overview",
      "hospital_switcher",
      "operations",
      "scheduling",
      "coordination",
      "financial_reporting",
      "manager_tabs",
    ],
  },
  scheduler: {
    label: "Scheduler",
    summary: "Manages block time, case sequencing, and waitlist movement.",
    focusAreas: [
      "Case sequencing and reschedules",
      "Block time utilization",
      "Urgent case placement",
    ],
    permissions: [
      "hospital_switcher",
      "operations",
      "scheduling",
      "coordination",
      "financial_reporting",
      "manager_tabs",
    ],
  },
  surgeon: {
    label: "Surgeon",
    summary: "Tracks own cases, readiness checkpoints, and room timing impacts.",
    focusAreas: [
      "Procedure readiness",
      "Case timeline and delays",
      "Documentation and communication",
    ],
    permissions: ["operations", "scheduling", "coordination"],
  },
  staff: {
    label: "Clinical Staff",
    summary: "Executes case readiness, staffing assignments, and turnover coordination.",
    focusAreas: [
      "Room and assignment status",
      "Pre-op checklists",
      "Handoff communication",
    ],
    permissions: ["operations", "coordination"],
  },
};

export function getRoleProfile(role: AppRole) {
  return roleProfiles[role];
}

export function hasPermission(role: AppRole, permission: PermissionKey) {
  return roleProfiles[role].permissions.includes(permission);
}
