import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import {
  getEnterpriseSnapshot as getDemoEnterpriseSnapshot,
  getHospitalDashboardData as getDemoHospitalDashboardData,
  getHospitals as getDemoHospitals,
} from "@/lib/smartor/mock-data";
import { hasSupabaseBrowserEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AppRoleSchema,
  type AppRole,
  BlockTimeSchema,
  type Hospital,
  type HospitalDashboardData,
  HospitalSchema,
  type OperatingRoom,
  OperatingRoomSchema,
  SurgeonSchema,
  StaffMemberSchema,
  EquipmentSchema,
  SurgeryCaseSchema,
  NotificationSchema,
  ConflictSchema,
  WaitlistEntrySchema,
  PreferenceCardSchema,
  DocumentRecordSchema,
  CostCenterSchema,
  MessageThreadSchema,
  OverviewMetricSchema,
  IntegrationSettingSchema,
} from "@/lib/validations/smartor";

export type ViewerMembership = {
  hospitalId: string;
  hospitalSlug: string;
  hospitalName: string;
  role: AppRole;
  isDefault: boolean;
};

export type ViewerContext = {
  id: string;
  email: string | null;
  fullName: string | null;
  defaultHospitalId: string | null;
  memberships: ViewerMembership[];
};

type OverviewData =
  | {
      mode: "demo";
      hospitals: Hospital[];
      snapshot: ReturnType<typeof getDemoEnterpriseSnapshot>;
      activeMembership: ViewerMembership;
    }
  | {
      mode: "auth-required";
    }
  | {
      mode: "no-access";
      viewer: ViewerContext;
    }
  | {
      mode: "supabase";
      viewer: ViewerContext;
      hospitals: Hospital[];
      snapshot: ReturnType<typeof getDemoEnterpriseSnapshot>;
      activeMembership: ViewerMembership;
    };

type HospitalRouteData =
  | {
      mode: "demo";
      data: HospitalDashboardData;
      hospitals: Hospital[];
      activeMembership: ViewerMembership;
    }
  | {
      mode: "auth-required";
    }
  | {
      mode: "not-found";
    }
  | {
      mode: "no-access";
      viewer: ViewerContext;
    }
  | {
      mode: "supabase";
      viewer: ViewerContext;
      data: HospitalDashboardData;
      hospitals: Hospital[];
      activeMembership: ViewerMembership;
    };

type HospitalRecord = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  network_name: string;
  beds: number;
  or_count: number;
  occupancy_rate: number | string;
  on_time_starts: number | string;
  turnover_minutes: number;
  alerts_open: number;
  ehr_status: "Connected" | "Sandbox" | "Pending";
  adoption_score: number | string;
};

type RoomRecord = {
  id: string;
  hospital_id: string;
  name: string;
  service_line: string;
  status: OperatingRoom["status"];
  active_case_id: string | null;
  next_case_id: string | null;
  utilization_rate: number | string;
  turnover_minutes: number;
  staffed_by: string[] | null;
};

type SurgeonRecord = {
  id: string;
  hospital_id: string;
  name: string;
  specialty: string;
  block_preference: string;
  availability: unknown;
};

type StaffRecord = {
  id: string;
  hospital_id: string;
  name: string;
  role: string;
  shift: string;
  assigned_room_id: string | null;
  availability_label: string;
};

type EquipmentRecord = {
  id: string;
  hospital_id: string;
  name: string;
  type: string;
  status: "Ready" | "Reserved" | "In Use" | "Sterilizing" | "Maintenance";
  assigned_case_id: string | null;
  last_sterilized_at: string;
};

type SurgeryCaseRecord = {
  id: string;
  hospital_id: string;
  patient_name: string;
  procedure_name: string;
  surgeon_id: string;
  operating_room_id: string | null;
  scheduled_start: string;
  estimated_minutes: number;
  predicted_minutes: number;
  actual_minutes: number | null;
  status:
    | "Scheduled"
    | "Pre-op"
    | "Ready"
    | "In Surgery"
    | "Turnover"
    | "Delayed"
    | "Waitlist";
  urgency: "Elective" | "Urgent" | "Emergent";
  insurance_status: "Authorized" | "Pending" | "Missing";
  documentation_status: "Complete" | "In Review" | "Missing";
  delay_reason: string | null;
  staff_ids: string[] | null;
  equipment_ids: string[] | null;
  pre_op_checklist: unknown;
};

type NotificationRecord = {
  id: string;
  hospital_id: string;
  level: "Info" | "Watch" | "Critical";
  title: string;
  detail: string;
  timestamp: string;
};

type ConflictRecord = {
  id: string;
  hospital_id: string;
  severity: "Low" | "Medium" | "High";
  title: string;
  detail: string;
  recommendation: string;
};

type BlockTimeRecord = {
  id: string;
  hospital_id: string;
  service_line: string;
  day: string;
  owner: string;
  allocated_hours: number | string;
  used_hours: number | string;
};

type WaitlistRecord = {
  id: string;
  hospital_id: string;
  patient_name: string;
  procedure_name: string;
  priority: "Elective" | "Urgent" | "Emergent";
  requested_window: string;
  reason: string;
};

type PreferenceCardRecord = {
  id: string;
  hospital_id: string;
  surgeon_id: string;
  setup_notes: string;
  preferred_devices: string[] | null;
};

type DocumentRecord = {
  id: string;
  hospital_id: string;
  case_id: string | null;
  title: string;
  type: string;
  owner: string;
  updated_at: string;
};

type CostCenterRecord = {
  id: string;
  hospital_id: string;
  department: string;
  utilization_rate: number | string;
  cost_per_procedure: number | string;
  revenue_per_or_day: number | string;
};

type MessageThreadRecord = {
  id: string;
  hospital_id: string;
  topic: string;
  room_label: string;
  participants: string[] | null;
  last_message: string;
  unread_count: number;
};

type OverviewMetricRecord = {
  id: string;
  hospital_id: string;
  metric_key: string;
  metric_label: string;
  metric_value: number | string;
  unit: "count" | "percent" | "currency" | "minutes";
  target_value: number | string | null;
  trend: "up" | "down" | "stable";
  owner: string;
  note: string | null;
};

type IntegrationSettingRecord = {
  id: string;
  hospital_id: string;
  integration_key: string;
  integration_label: string;
  vendor_name: string;
  status: "Connected" | "Sandbox" | "Pending" | "Disconnected";
  base_url: string | null;
  last_sync_at: string | null;
  notes: string | null;
};

export async function getOverviewData(): Promise<OverviewData> {
  noStore();

  if (!hasSupabaseBrowserEnv()) {
    const demoHospitals = getDemoHospitals();

    return {
      mode: "demo",
      hospitals: demoHospitals,
      snapshot: getDemoEnterpriseSnapshot(),
      activeMembership: {
        hospitalId: demoHospitals[0]?.id ?? "",
        hospitalSlug: demoHospitals[0]?.slug ?? "",
        hospitalName: demoHospitals[0]?.name ?? "Demo Hospital",
        role: "hospital_admin",
        isDefault: true,
      },
    };
  }

  const auth = await getViewerContext();

  if (auth.mode !== "supabase") {
    return auth;
  }

  const casesResult = await auth.supabase
    .from("surgery_cases")
    .select("status, urgency")
    .in(
      "hospital_id",
      auth.hospitals.map((hospital) => hospital.id),
    );

  const caseRows = (casesResult.data ?? []) as Array<{
    status: SurgeryCaseRecord["status"];
    urgency: SurgeryCaseRecord["urgency"];
  }>;
  const activeMembership = getPreferredMembership(
    auth.viewer.memberships,
    auth.viewer.defaultHospitalId,
  );

  if (!activeMembership) {
    return {
      mode: "no-access",
      viewer: auth.viewer,
    };
  }

  return {
    mode: "supabase",
    viewer: auth.viewer,
    hospitals: auth.hospitals,
    activeMembership,
    snapshot: {
      hospitals: auth.hospitals,
      totalOperatingRooms: auth.hospitals.reduce(
        (total, hospital) => total + hospital.orCount,
        0,
      ),
      networkUtilization: average(auth.hospitals.map((hospital) => hospital.occupancyRate)),
      firstCaseStarts: average(auth.hospitals.map((hospital) => hospital.onTimeStarts)),
      openAlerts: auth.hospitals.reduce((total, hospital) => total + hospital.alertsOpen, 0),
      activeCases: caseRows.filter((caseItem) => caseItem.status !== "Waitlist").length,
      emergentCases: caseRows.filter((caseItem) => caseItem.urgency === "Emergent").length,
      connectedHospitals: auth.hospitals.filter(
        (hospital) => hospital.ehrStatus === "Connected",
      ).length,
    },
  };
}

export async function getHospitalRouteData(
  hospitalSlug: string,
): Promise<HospitalRouteData> {
  noStore();

  if (!hasSupabaseBrowserEnv()) {
    const data = getDemoHospitalDashboardData(hospitalSlug);

    if (!data) {
      return {
        mode: "not-found",
      };
    }

    const demoHospitals = getDemoHospitals();

    return {
      mode: "demo",
      data,
      hospitals: demoHospitals,
      activeMembership: {
        hospitalId: data.hospital.id,
        hospitalSlug: data.hospital.slug,
        hospitalName: data.hospital.name,
        role: "hospital_admin",
        isDefault: true,
      },
    };
  }

  const auth = await getViewerContext();

  if (auth.mode !== "supabase") {
    return auth;
  }

  const hospital = auth.hospitals.find((item) => item.slug === hospitalSlug);

  if (!hospital) {
    return {
      mode: "not-found",
    };
  }
  const activeMembership = auth.viewer.memberships.find(
    (membership) => membership.hospitalId === hospital.id,
  );

  if (!activeMembership) {
    return {
      mode: "no-access",
      viewer: auth.viewer,
    };
  }

  const [
    roomsResult,
    surgeonsResult,
    staffResult,
    equipmentResult,
    casesResult,
    notificationsResult,
    conflictsResult,
    blockTimesResult,
    waitlistResult,
    preferenceCardsResult,
    documentsResult,
    costCentersResult,
    threadsResult,
    overviewMetricsResult,
    integrationSettingsResult,
  ] = await Promise.all([
    auth.supabase.from("operating_rooms").select("*").eq("hospital_id", hospital.id).order("name"),
    auth.supabase.from("surgeons").select("*").eq("hospital_id", hospital.id).order("name"),
    auth.supabase.from("staff_members").select("*").eq("hospital_id", hospital.id).order("name"),
    auth.supabase.from("equipment").select("*").eq("hospital_id", hospital.id).order("name"),
    auth.supabase
      .from("surgery_cases")
      .select("*")
      .eq("hospital_id", hospital.id)
      .order("scheduled_start"),
    auth.supabase
      .from("notifications")
      .select("*")
      .eq("hospital_id", hospital.id)
      .order("timestamp"),
    auth.supabase.from("conflicts").select("*").eq("hospital_id", hospital.id),
    auth.supabase
      .from("block_time_allocations")
      .select("*")
      .eq("hospital_id", hospital.id)
      .order("service_line"),
    auth.supabase
      .from("waitlist_entries")
      .select("*")
      .eq("hospital_id", hospital.id)
      .order("priority"),
    auth.supabase
      .from("preference_cards")
      .select("*")
      .eq("hospital_id", hospital.id)
      .order("id"),
    auth.supabase
      .from("document_records")
      .select("*")
      .eq("hospital_id", hospital.id)
      .order("updated_at"),
    auth.supabase
      .from("cost_centers")
      .select("*")
      .eq("hospital_id", hospital.id)
      .order("department"),
    auth.supabase
      .from("message_threads")
      .select("*")
      .eq("hospital_id", hospital.id)
      .order("id"),
    auth.supabase
      .from("overview_metrics")
      .select("*")
      .eq("hospital_id", hospital.id)
      .order("metric_label"),
    auth.supabase
      .from("hospital_integrations")
      .select("*")
      .eq("hospital_id", hospital.id)
      .order("integration_label"),
  ]);

  const data: HospitalDashboardData = {
    hospital,
    rooms: OperatingRoomSchema.array().parse(
      ((roomsResult.data ?? []) as RoomRecord[]).map(mapRoomRecord),
    ),
    surgeons: SurgeonSchema.array().parse(
      ((surgeonsResult.data ?? []) as SurgeonRecord[]).map(mapSurgeonRecord),
    ),
    staff: StaffMemberSchema.array().parse(
      ((staffResult.data ?? []) as StaffRecord[]).map(mapStaffRecord),
    ),
    equipment: EquipmentSchema.array().parse(
      ((equipmentResult.data ?? []) as EquipmentRecord[]).map(mapEquipmentRecord),
    ),
    cases: SurgeryCaseSchema.array().parse(
      ((casesResult.data ?? []) as SurgeryCaseRecord[]).map(mapSurgeryCaseRecord),
    ),
    notifications: NotificationSchema.array().parse(
      ((notificationsResult.data ?? []) as NotificationRecord[]).map(
        mapNotificationRecord,
      ),
    ),
    conflicts: ConflictSchema.array().parse(
      ((conflictsResult.data ?? []) as ConflictRecord[]).map(mapConflictRecord),
    ),
    blockTimes: BlockTimeSchema.array().parse(
      ((blockTimesResult.data ?? []) as BlockTimeRecord[]).map(mapBlockTimeRecord),
    ),
    waitlist: WaitlistEntrySchema.array().parse(
      ((waitlistResult.data ?? []) as WaitlistRecord[]).map(mapWaitlistRecord),
    ),
    preferenceCards: PreferenceCardSchema.array().parse(
      ((preferenceCardsResult.data ?? []) as PreferenceCardRecord[]).map(
        mapPreferenceCardRecord,
      ),
    ),
    documents: DocumentRecordSchema.array().parse(
      ((documentsResult.data ?? []) as DocumentRecord[]).map(mapDocumentRecord),
    ),
    costCenters: CostCenterSchema.array().parse(
      ((costCentersResult.data ?? []) as CostCenterRecord[]).map(mapCostCenterRecord),
    ),
    threads: MessageThreadSchema.array().parse(
      ((threadsResult.data ?? []) as MessageThreadRecord[]).map(mapThreadRecord),
    ),
    overviewMetrics: OverviewMetricSchema.array().parse(
      ((overviewMetricsResult.error ? [] : (overviewMetricsResult.data ?? [])) as OverviewMetricRecord[]).map(
        mapOverviewMetricRecord,
      ),
    ),
    integrationSettings: IntegrationSettingSchema.array().parse(
      ((integrationSettingsResult.error
        ? []
        : (integrationSettingsResult.data ?? [])) as IntegrationSettingRecord[]).map(
        mapIntegrationSettingRecord,
      ),
    ),
  };

  return {
    mode: "supabase",
    viewer: auth.viewer,
    data,
    hospitals: auth.hospitals,
    activeMembership,
  };
}

async function getViewerContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      mode: "auth-required" as const,
    };
  }

  const [profileResult, membershipsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, default_hospital_id")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("hospital_memberships")
      .select("hospital_id, role, is_default")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true }),
  ]);

  const membershipRows = (membershipsResult.data ?? []) as Array<{
    hospital_id: string;
    role: AppRole;
    is_default: boolean;
  }>;

  if (!membershipRows.length) {
    const profile = profileResult.data as
      | { email: string | null; full_name: string | null; default_hospital_id: string | null }
      | null;

    return {
      mode: "no-access" as const,
      viewer: {
        id: user.id,
        email: profile?.email ?? user.email ?? null,
        fullName: profile?.full_name ?? null,
        defaultHospitalId: profile?.default_hospital_id ?? null,
        memberships: [],
      },
    };
  }

  const hospitalIds = membershipRows.map((row) => row.hospital_id);
  const hospitalsResult = await supabase
    .from("hospitals")
    .select("*")
    .in("id", hospitalIds)
    .order("name");

  const hospitals = HospitalSchema.array().parse(
    ((hospitalsResult.data ?? []) as HospitalRecord[]).map(mapHospitalRecord),
  );
  const hospitalMap = Object.fromEntries(hospitals.map((hospital) => [hospital.id, hospital]));
  const profile = profileResult.data as
    | { email: string | null; full_name: string | null; default_hospital_id: string | null }
    | null;

  const viewer: ViewerContext = {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    fullName: profile?.full_name ?? null,
    defaultHospitalId: profile?.default_hospital_id ?? null,
    memberships: membershipRows
      .map((membership) => {
        const hospital = hospitalMap[membership.hospital_id];

        if (!hospital) {
          return null;
        }

        return {
          hospitalId: hospital.id,
          hospitalSlug: hospital.slug,
          hospitalName: hospital.name,
          role: AppRoleSchema.parse(membership.role),
          isDefault: membership.is_default,
        };
      })
      .filter((membership): membership is ViewerMembership => membership !== null),
  };

  return {
    mode: "supabase" as const,
    viewer,
    hospitals,
    supabase,
  };
}

function getPreferredMembership(
  memberships: ViewerMembership[],
  defaultHospitalId: string | null,
) {
  if (!memberships.length) {
    return null;
  }

  return (
    memberships.find((membership) => membership.isDefault) ??
    (defaultHospitalId
      ? memberships.find((membership) => membership.hospitalId === defaultHospitalId)
      : null) ??
    memberships[0]
  );
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function mapHospitalRecord(record: HospitalRecord) {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    city: record.city,
    state: record.state,
    networkName: record.network_name,
    beds: record.beds,
    orCount: record.or_count,
    occupancyRate: Number(record.occupancy_rate),
    onTimeStarts: Number(record.on_time_starts),
    turnoverMinutes: record.turnover_minutes,
    alertsOpen: record.alerts_open,
    ehrStatus: record.ehr_status,
    adoptionScore: Number(record.adoption_score),
  };
}

function mapRoomRecord(record: RoomRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    name: record.name,
    serviceLine: record.service_line,
    status: record.status,
    activeCaseId: record.active_case_id ?? undefined,
    nextCaseId: record.next_case_id ?? undefined,
    utilizationRate: Number(record.utilization_rate),
    turnoverMinutes: record.turnover_minutes,
    staffedBy: record.staffed_by ?? [],
  };
}

function mapSurgeonRecord(record: SurgeonRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    name: record.name,
    specialty: record.specialty,
    blockPreference: record.block_preference,
    availability: Array.isArray(record.availability) ? record.availability : [],
  };
}

function mapStaffRecord(record: StaffRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    name: record.name,
    role: record.role,
    shift: record.shift,
    assignedRoomId: record.assigned_room_id,
    availabilityLabel: record.availability_label,
  };
}

function mapEquipmentRecord(record: EquipmentRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    name: record.name,
    type: record.type,
    status: record.status,
    assignedCaseId: record.assigned_case_id,
    lastSterilizedAt: record.last_sterilized_at,
  };
}

function mapSurgeryCaseRecord(record: SurgeryCaseRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    patientName: record.patient_name,
    procedureName: record.procedure_name,
    surgeonId: record.surgeon_id,
    operatingRoomId: record.operating_room_id,
    scheduledStart: record.scheduled_start,
    estimatedMinutes: record.estimated_minutes,
    predictedMinutes: record.predicted_minutes,
    actualMinutes: record.actual_minutes,
    status: record.status,
    urgency: record.urgency,
    insuranceStatus: record.insurance_status,
    documentationStatus: record.documentation_status,
    delayReason: record.delay_reason,
    staffIds: record.staff_ids ?? [],
    equipmentIds: record.equipment_ids ?? [],
    preOpChecklist: Array.isArray(record.pre_op_checklist)
      ? record.pre_op_checklist
      : [],
  };
}

function mapNotificationRecord(record: NotificationRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    level: record.level,
    title: record.title,
    detail: record.detail,
    timestamp: record.timestamp,
  };
}

function mapConflictRecord(record: ConflictRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    severity: record.severity,
    title: record.title,
    detail: record.detail,
    recommendation: record.recommendation,
  };
}

function mapBlockTimeRecord(record: BlockTimeRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    serviceLine: record.service_line,
    day: record.day,
    owner: record.owner,
    allocatedHours: Number(record.allocated_hours),
    usedHours: Number(record.used_hours),
  };
}

function mapWaitlistRecord(record: WaitlistRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    patientName: record.patient_name,
    procedureName: record.procedure_name,
    priority: record.priority,
    requestedWindow: record.requested_window,
    reason: record.reason,
  };
}

function mapPreferenceCardRecord(record: PreferenceCardRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    surgeonId: record.surgeon_id,
    setupNotes: record.setup_notes,
    preferredDevices: record.preferred_devices ?? [],
  };
}

function mapDocumentRecord(record: DocumentRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    caseId: record.case_id ?? "",
    title: record.title,
    type: record.type,
    owner: record.owner,
    updatedAt: record.updated_at,
  };
}

function mapCostCenterRecord(record: CostCenterRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    department: record.department,
    utilizationRate: Number(record.utilization_rate),
    costPerProcedure: Number(record.cost_per_procedure),
    revenuePerOrDay: Number(record.revenue_per_or_day),
  };
}

function mapThreadRecord(record: MessageThreadRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    topic: record.topic,
    roomLabel: record.room_label,
    participants: record.participants ?? [],
    lastMessage: record.last_message,
    unreadCount: record.unread_count,
  };
}

function mapOverviewMetricRecord(record: OverviewMetricRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    metricKey: record.metric_key,
    metricLabel: record.metric_label,
    metricValue: Number(record.metric_value),
    unit: record.unit,
    targetValue: record.target_value === null ? null : Number(record.target_value),
    trend: record.trend,
    owner: record.owner,
    note: record.note,
  };
}

function mapIntegrationSettingRecord(record: IntegrationSettingRecord) {
  return {
    id: record.id,
    hospitalSlug: record.hospital_id,
    integrationKey: record.integration_key,
    integrationLabel: record.integration_label,
    vendorName: record.vendor_name,
    status: record.status,
    baseUrl: record.base_url,
    lastSyncAt: record.last_sync_at,
    notes: record.notes,
  };
}
