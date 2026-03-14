import { z } from "zod";

const roomStatuses = [
  "Available",
  "Pre-op",
  "In Surgery",
  "Turnover",
  "Delayed",
] as const;

const caseStatuses = [
  "Scheduled",
  "Pre-op",
  "Ready",
  "In Surgery",
  "Turnover",
  "Delayed",
  "Waitlist",
] as const;

const insuranceStatuses = ["Authorized", "Pending", "Missing"] as const;
const documentationStatuses = ["Complete", "In Review", "Missing"] as const;
const urgencyLevels = ["Elective", "Urgent", "Emergent"] as const;
const equipmentStatuses = [
  "Ready",
  "Reserved",
  "In Use",
  "Sterilizing",
  "Maintenance",
] as const;
const notificationLevels = ["Info", "Watch", "Critical"] as const;
const ehrStatuses = ["Connected", "Sandbox", "Pending"] as const;
const conflictSeverities = ["Low", "Medium", "High"] as const;
const metricUnits = ["count", "percent", "currency", "minutes"] as const;
const metricTrends = ["up", "down", "stable"] as const;
const integrationStatuses = ["Connected", "Sandbox", "Pending", "Disconnected"] as const;
const appRoles = [
  "hospital_admin",
  "or_director",
  "scheduler",
  "surgeon",
  "staff",
] as const;

const TimeBlockSchema = z.object({
  day: z.string(),
  start: z.string(),
  end: z.string(),
  note: z.string().optional(),
});

const ChecklistItemSchema = z.object({
  label: z.string(),
  complete: z.boolean(),
});

export const HospitalSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  city: z.string(),
  state: z.string(),
  networkName: z.string(),
  beds: z.number().int().positive(),
  orCount: z.number().int().positive(),
  occupancyRate: z.number().min(0).max(100),
  onTimeStarts: z.number().min(0).max(100),
  turnoverMinutes: z.number().int().nonnegative(),
  alertsOpen: z.number().int().nonnegative(),
  ehrStatus: z.enum(ehrStatuses),
  adoptionScore: z.number().min(0).max(100),
});

export const OperatingRoomSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  name: z.string(),
  serviceLine: z.string(),
  status: z.enum(roomStatuses),
  activeCaseId: z.string().optional(),
  nextCaseId: z.string().optional(),
  utilizationRate: z.number().min(0).max(100),
  turnoverMinutes: z.number().int().nonnegative(),
  staffedBy: z.array(z.string()),
});

export const SurgeonSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  name: z.string(),
  specialty: z.string(),
  blockPreference: z.string(),
  availability: z.array(TimeBlockSchema),
});

export const StaffMemberSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  name: z.string(),
  role: z.string(),
  shift: z.string(),
  assignedRoomId: z.string().nullable(),
  availabilityLabel: z.string(),
});

export const EquipmentSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.enum(equipmentStatuses),
  assignedCaseId: z.string().nullable(),
  lastSterilizedAt: z.string(),
});

export const SurgeryCaseSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  patientName: z.string(),
  procedureName: z.string(),
  surgeonId: z.string(),
  operatingRoomId: z.string().nullable(),
  scheduledStart: z.string(),
  estimatedMinutes: z.number().int().positive(),
  predictedMinutes: z.number().int().positive(),
  actualMinutes: z.number().int().positive().nullable(),
  status: z.enum(caseStatuses),
  urgency: z.enum(urgencyLevels),
  insuranceStatus: z.enum(insuranceStatuses),
  documentationStatus: z.enum(documentationStatuses),
  delayReason: z.string().nullable(),
  staffIds: z.array(z.string()),
  equipmentIds: z.array(z.string()),
  preOpChecklist: z.array(ChecklistItemSchema),
});

export const NotificationSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  level: z.enum(notificationLevels),
  title: z.string(),
  detail: z.string(),
  timestamp: z.string(),
});

export const ConflictSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  severity: z.enum(conflictSeverities),
  title: z.string(),
  detail: z.string(),
  recommendation: z.string(),
});

export const BlockTimeSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  serviceLine: z.string(),
  day: z.string(),
  owner: z.string(),
  allocatedHours: z.number().positive(),
  usedHours: z.number().nonnegative(),
});

export const WaitlistEntrySchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  patientName: z.string(),
  procedureName: z.string(),
  priority: z.enum(urgencyLevels),
  requestedWindow: z.string(),
  reason: z.string(),
});

export const PreferenceCardSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  surgeonId: z.string(),
  setupNotes: z.string(),
  preferredDevices: z.array(z.string()),
});

export const DocumentRecordSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  caseId: z.string(),
  title: z.string(),
  type: z.string(),
  owner: z.string(),
  updatedAt: z.string(),
});

export const CostCenterSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  department: z.string(),
  utilizationRate: z.number().min(0).max(100),
  costPerProcedure: z.number().positive(),
  revenuePerOrDay: z.number().positive(),
});

export const MessageThreadSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  topic: z.string(),
  roomLabel: z.string(),
  participants: z.array(z.string()),
  lastMessage: z.string(),
  unreadCount: z.number().int().nonnegative(),
});

export const OverviewMetricSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  metricKey: z.string(),
  metricLabel: z.string(),
  metricValue: z.number(),
  unit: z.enum(metricUnits),
  targetValue: z.number().nullable(),
  trend: z.enum(metricTrends),
  owner: z.string(),
  note: z.string().nullable(),
});

export const IntegrationSettingSchema = z.object({
  id: z.string(),
  hospitalSlug: z.string(),
  integrationKey: z.string(),
  integrationLabel: z.string(),
  vendorName: z.string(),
  status: z.enum(integrationStatuses),
  baseUrl: z.string().nullable(),
  lastSyncAt: z.string().nullable(),
  notes: z.string().nullable(),
});

export const AppRoleSchema = z.enum(appRoles);

export type Hospital = z.infer<typeof HospitalSchema>;
export type OperatingRoom = z.infer<typeof OperatingRoomSchema>;
export type Surgeon = z.infer<typeof SurgeonSchema>;
export type StaffMember = z.infer<typeof StaffMemberSchema>;
export type Equipment = z.infer<typeof EquipmentSchema>;
export type SurgeryCase = z.infer<typeof SurgeryCaseSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type Conflict = z.infer<typeof ConflictSchema>;
export type BlockTime = z.infer<typeof BlockTimeSchema>;
export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;
export type PreferenceCard = z.infer<typeof PreferenceCardSchema>;
export type DocumentRecord = z.infer<typeof DocumentRecordSchema>;
export type CostCenter = z.infer<typeof CostCenterSchema>;
export type MessageThread = z.infer<typeof MessageThreadSchema>;
export type OverviewMetric = z.infer<typeof OverviewMetricSchema>;
export type IntegrationSetting = z.infer<typeof IntegrationSettingSchema>;
export type AppRole = z.infer<typeof AppRoleSchema>;

export type HospitalDashboardData = {
  hospital: Hospital;
  rooms: OperatingRoom[];
  surgeons: Surgeon[];
  staff: StaffMember[];
  equipment: Equipment[];
  cases: SurgeryCase[];
  notifications: Notification[];
  conflicts: Conflict[];
  blockTimes: BlockTime[];
  waitlist: WaitlistEntry[];
  preferenceCards: PreferenceCard[];
  documents: DocumentRecord[];
  costCenters: CostCenter[];
  threads: MessageThread[];
  overviewMetrics: OverviewMetric[];
  integrationSettings: IntegrationSetting[];
};
