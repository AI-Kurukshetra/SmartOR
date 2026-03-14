import { createClient } from "@supabase/supabase-js";

// Run with:
//   pnpm seed:demo
// Optional:
//   SMARTOR_DEMO_PASSWORD="..." pnpm seed:demo
const DEMO_PASSWORD = process.env.SMARTOR_DEMO_PASSWORD ?? "SmartOR-Demo-2026!";

const hospitals = [
  {
    id: "hospital-north-harbor",
    slug: "north-harbor",
    name: "North Harbor Medical Center",
    city: "Seattle",
    state: "WA",
    networkName: "Cascade Surgical Alliance",
    beds: 264,
    orCount: 5,
    occupancyRate: 91,
    onTimeStarts: 88,
    turnoverMinutes: 34,
    alertsOpen: 3,
    ehrStatus: "Connected",
    adoptionScore: 93,
  },
  {
    id: "hospital-st-catherine-west",
    slug: "st-catherine-west",
    name: "St. Catherine West Pavilion",
    city: "Austin",
    state: "TX",
    networkName: "Cascade Surgical Alliance",
    beds: 188,
    orCount: 5,
    occupancyRate: 86,
    onTimeStarts: 82,
    turnoverMinutes: 38,
    alertsOpen: 5,
    ehrStatus: "Sandbox",
    adoptionScore: 89,
  },
];

const surgeons = [
  {
    id: "surgeon-nh-asha-raman",
    hospitalSlug: "north-harbor",
    name: "Dr. Asha Raman",
    specialty: "Orthopedic Reconstruction",
    blockPreference: "Mon / Thu morning block",
    availability: [
      { day: "Today", start: "07:00", end: "15:30", note: "Robotics backup at 14:00" },
      { day: "Tomorrow", start: "08:00", end: "13:00" },
    ],
  },
  {
    id: "surgeon-nh-miguel-alvarez",
    hospitalSlug: "north-harbor",
    name: "Dr. Miguel Alvarez",
    specialty: "Cardiac Surgery",
    blockPreference: "Tue / Fri all-day block",
    availability: [
      { day: "Today", start: "07:30", end: "17:00", note: "Perfusion review at 12:15" },
      { day: "Tomorrow", start: "09:00", end: "14:00" },
    ],
  },
  {
    id: "surgeon-nh-priya-desai",
    hospitalSlug: "north-harbor",
    name: "Dr. Priya Desai",
    specialty: "General & Endocrine Surgery",
    blockPreference: "Wed afternoon block",
    availability: [
      { day: "Today", start: "09:30", end: "18:00", note: "Clinic handoff at 16:30" },
      { day: "Tomorrow", start: "07:00", end: "11:30" },
    ],
  },
  {
    id: "surgeon-sc-julia-bennett",
    hospitalSlug: "st-catherine-west",
    name: "Dr. Julia Bennett",
    specialty: "Neurosurgery",
    blockPreference: "Mon / Wed cranial block",
    availability: [
      { day: "Today", start: "06:45", end: "14:00", note: "Tumor board at 15:00" },
      { day: "Tomorrow", start: "08:00", end: "16:00" },
    ],
  },
  {
    id: "surgeon-sc-omar-farouk",
    hospitalSlug: "st-catherine-west",
    name: "Dr. Omar Farouk",
    specialty: "General Surgery",
    blockPreference: "Tue / Thu acute care block",
    availability: [
      { day: "Today", start: "07:00", end: "19:00", note: "On emergency call" },
      { day: "Tomorrow", start: "08:30", end: "15:00" },
    ],
  },
  {
    id: "surgeon-sc-elena-novak",
    hospitalSlug: "st-catherine-west",
    name: "Dr. Elena Novak",
    specialty: "Gynecologic Surgery",
    blockPreference: "Fri women's health block",
    availability: [
      { day: "Today", start: "08:00", end: "17:30", note: "Two urgent consults pending" },
      { day: "Tomorrow", start: "10:00", end: "16:30" },
    ],
  },
];

const staff = [
  {
    id: "staff-nh-ava-clark",
    hospitalSlug: "north-harbor",
    name: "Ava Clark",
    role: "Charge RN",
    shift: "07:00 - 19:00",
    assignedRoomId: "room-nh-or-1",
    availabilityLabel: "Locked to OR 1 coverage",
  },
  {
    id: "staff-nh-liam-brooks",
    hospitalSlug: "north-harbor",
    name: "Liam Brooks",
    role: "Anesthesiologist",
    shift: "07:00 - 17:00",
    assignedRoomId: "room-nh-or-2",
    availabilityLabel: "Perfusion consult overlap at 11:30",
  },
  {
    id: "staff-nh-sofia-nash",
    hospitalSlug: "north-harbor",
    name: "Sofia Nash",
    role: "Scrub Tech",
    shift: "08:00 - 16:00",
    assignedRoomId: "room-nh-or-4",
    availabilityLabel: "Available after turnover",
  },
  {
    id: "staff-nh-daniel-yu",
    hospitalSlug: "north-harbor",
    name: "Daniel Yu",
    role: "Sterile Processing Lead",
    shift: "06:30 - 15:30",
    assignedRoomId: null,
    availabilityLabel: "Covering implant tray rush order",
  },
  {
    id: "staff-sc-zoe-hart",
    hospitalSlug: "st-catherine-west",
    name: "Zoe Hart",
    role: "Charge RN",
    shift: "07:00 - 19:00",
    assignedRoomId: "room-sc-or-1",
    availabilityLabel: "Neuro room escalation point",
  },
  {
    id: "staff-sc-noah-wells",
    hospitalSlug: "st-catherine-west",
    name: "Noah Wells",
    role: "Anesthesiologist",
    shift: "07:00 - 17:00",
    assignedRoomId: "room-sc-or-2",
    availabilityLabel: "Float backup after 13:00",
  },
  {
    id: "staff-sc-kira-mills",
    hospitalSlug: "st-catherine-west",
    name: "Kira Mills",
    role: "OR Scheduler",
    shift: "06:00 - 14:00",
    assignedRoomId: null,
    availabilityLabel: "Monitoring emergency inserts",
  },
  {
    id: "staff-sc-isaac-porter",
    hospitalSlug: "st-catherine-west",
    name: "Isaac Porter",
    role: "Circulating RN",
    shift: "09:00 - 21:00",
    assignedRoomId: "room-sc-or-4",
    availabilityLabel: "Room turnover support at 12:15",
  },
];

const rooms = [
  {
    id: "room-nh-or-1",
    hospitalSlug: "north-harbor",
    name: "OR 1",
    serviceLine: "Orthopedics",
    status: "In Surgery",
    activeCaseId: "case-nh-1",
    nextCaseId: "case-nh-4",
    utilizationRate: 94,
    turnoverMinutes: 29,
    staffedBy: ["staff-nh-ava-clark"],
  },
  {
    id: "room-nh-or-2",
    hospitalSlug: "north-harbor",
    name: "OR 2",
    serviceLine: "Cardiac",
    status: "Pre-op",
    activeCaseId: "case-nh-2",
    utilizationRate: 88,
    turnoverMinutes: 41,
    staffedBy: ["staff-nh-liam-brooks"],
  },
  {
    id: "room-nh-or-3",
    hospitalSlug: "north-harbor",
    name: "OR 3",
    serviceLine: "General Surgery",
    status: "Available",
    nextCaseId: "case-nh-5",
    utilizationRate: 76,
    turnoverMinutes: 32,
    staffedBy: [],
  },
  {
    id: "room-nh-or-4",
    hospitalSlug: "north-harbor",
    name: "OR 4",
    serviceLine: "General Surgery",
    status: "Turnover",
    activeCaseId: "case-nh-3",
    utilizationRate: 85,
    turnoverMinutes: 44,
    staffedBy: ["staff-nh-sofia-nash"],
  },
  {
    id: "room-nh-or-5",
    hospitalSlug: "north-harbor",
    name: "OR 5",
    serviceLine: "Flex / Add-on",
    status: "Delayed",
    utilizationRate: 51,
    turnoverMinutes: 47,
    staffedBy: [],
  },
  {
    id: "room-sc-or-1",
    hospitalSlug: "st-catherine-west",
    name: "OR 1",
    serviceLine: "Neurosurgery",
    status: "In Surgery",
    activeCaseId: "case-sc-1",
    nextCaseId: "case-sc-6",
    utilizationRate: 92,
    turnoverMinutes: 36,
    staffedBy: ["staff-sc-zoe-hart"],
  },
  {
    id: "room-sc-or-2",
    hospitalSlug: "st-catherine-west",
    name: "OR 2",
    serviceLine: "Acute Care",
    status: "Pre-op",
    activeCaseId: "case-sc-2",
    utilizationRate: 83,
    turnoverMinutes: 39,
    staffedBy: ["staff-sc-noah-wells"],
  },
  {
    id: "room-sc-or-3",
    hospitalSlug: "st-catherine-west",
    name: "OR 3",
    serviceLine: "Women's Health",
    status: "Available",
    nextCaseId: "case-sc-3",
    utilizationRate: 78,
    turnoverMinutes: 31,
    staffedBy: [],
  },
  {
    id: "room-sc-or-4",
    hospitalSlug: "st-catherine-west",
    name: "OR 4",
    serviceLine: "Spine",
    status: "Turnover",
    activeCaseId: "case-sc-4",
    utilizationRate: 81,
    turnoverMinutes: 43,
    staffedBy: ["staff-sc-isaac-porter"],
  },
  {
    id: "room-sc-or-5",
    hospitalSlug: "st-catherine-west",
    name: "OR 5",
    serviceLine: "Flex / Add-on",
    status: "Delayed",
    activeCaseId: "case-sc-5",
    utilizationRate: 62,
    turnoverMinutes: 48,
    staffedBy: [],
  },
];

const equipment = [
  {
    id: "equip-nh-robotic-knee",
    hospitalSlug: "north-harbor",
    name: "Robotic Knee Console",
    type: "Robotics",
    status: "In Use",
    assignedCaseId: "case-nh-1",
    lastSterilizedAt: "06:42",
  },
  {
    id: "equip-nh-perfusion-pump",
    hospitalSlug: "north-harbor",
    name: "Perfusion Pump 2",
    type: "Cardiac Support",
    status: "Reserved",
    assignedCaseId: "case-nh-2",
    lastSterilizedAt: "05:58",
  },
  {
    id: "equip-nh-lap-tower",
    hospitalSlug: "north-harbor",
    name: "Laparoscopy Tower A",
    type: "Endoscopy",
    status: "Ready",
    assignedCaseId: "case-nh-5",
    lastSterilizedAt: "07:08",
  },
  {
    id: "equip-nh-implant-tray",
    hospitalSlug: "north-harbor",
    name: "Revision Hip Implant Tray",
    type: "Implants",
    status: "Sterilizing",
    assignedCaseId: "case-nh-4",
    lastSterilizedAt: "08:31",
  },
  {
    id: "equip-sc-neuro-navigation",
    hospitalSlug: "st-catherine-west",
    name: "Neuro Navigation Cart",
    type: "Navigation",
    status: "In Use",
    assignedCaseId: "case-sc-1",
    lastSterilizedAt: "06:25",
  },
  {
    id: "equip-sc-fluoro",
    hospitalSlug: "st-catherine-west",
    name: "Mobile C-Arm",
    type: "Imaging",
    status: "Reserved",
    assignedCaseId: "case-sc-4",
    lastSterilizedAt: "07:12",
  },
  {
    id: "equip-sc-lap-tower",
    hospitalSlug: "st-catherine-west",
    name: "Acute Care Laparoscopy Tower",
    type: "Endoscopy",
    status: "Ready",
    assignedCaseId: "case-sc-2",
    lastSterilizedAt: "07:35",
  },
  {
    id: "equip-sc-fetal-monitor",
    hospitalSlug: "st-catherine-west",
    name: "Fetal Monitoring Hub",
    type: "Women's Health",
    status: "Maintenance",
    assignedCaseId: null,
    lastSterilizedAt: "Yesterday",
  },
];

const surgeryCases = [
  {
    id: "case-nh-1",
    hospitalSlug: "north-harbor",
    patientName: "Maria Chen",
    procedureName: "Total Knee Arthroplasty",
    surgeonId: "surgeon-nh-asha-raman",
    operatingRoomId: "room-nh-or-1",
    scheduledStart: "07:15",
    estimatedMinutes: 135,
    predictedMinutes: 142,
    actualMinutes: null,
    status: "In Surgery",
    urgency: "Elective",
    insuranceStatus: "Authorized",
    documentationStatus: "Complete",
    delayReason: null,
    staffIds: ["staff-nh-ava-clark"],
    equipmentIds: ["equip-nh-robotic-knee"],
    preOpChecklist: [
      { label: "Consent signed", complete: true },
      { label: "Labs verified", complete: true },
      { label: "Antibiotics released", complete: true },
      { label: "Implant tray in room", complete: true },
    ],
  },
  {
    id: "case-nh-2",
    hospitalSlug: "north-harbor",
    patientName: "Samuel Ortiz",
    procedureName: "CABG x3",
    surgeonId: "surgeon-nh-miguel-alvarez",
    operatingRoomId: "room-nh-or-2",
    scheduledStart: "08:00",
    estimatedMinutes: 210,
    predictedMinutes: 225,
    actualMinutes: null,
    status: "Pre-op",
    urgency: "Urgent",
    insuranceStatus: "Authorized",
    documentationStatus: "In Review",
    delayReason: "Perfusion staffing handoff",
    staffIds: ["staff-nh-liam-brooks"],
    equipmentIds: ["equip-nh-perfusion-pump"],
    preOpChecklist: [
      { label: "Anesthesia clearance", complete: true },
      { label: "Blood products released", complete: true },
      { label: "ICU bed confirmed", complete: false },
      { label: "Family consent re-verified", complete: true },
    ],
  },
  {
    id: "case-nh-3",
    hospitalSlug: "north-harbor",
    patientName: "Lila Brooks",
    procedureName: "Laparoscopic Colectomy",
    surgeonId: "surgeon-nh-priya-desai",
    operatingRoomId: "room-nh-or-4",
    scheduledStart: "07:40",
    estimatedMinutes: 150,
    predictedMinutes: 165,
    actualMinutes: 173,
    status: "Turnover",
    urgency: "Urgent",
    insuranceStatus: "Pending",
    documentationStatus: "Complete",
    delayReason: "Unexpected adhesions increased case time",
    staffIds: ["staff-nh-sofia-nash"],
    equipmentIds: [],
    preOpChecklist: [
      { label: "Lab panel received", complete: true },
      { label: "Bowel prep complete", complete: true },
      { label: "Pathology pickup arranged", complete: true },
      { label: "PACU alert sent", complete: true },
    ],
  },
  {
    id: "case-nh-4",
    hospitalSlug: "north-harbor",
    patientName: "Owen Patel",
    procedureName: "Revision Hip Arthroplasty",
    surgeonId: "surgeon-nh-asha-raman",
    operatingRoomId: "room-nh-or-1",
    scheduledStart: "12:30",
    estimatedMinutes: 180,
    predictedMinutes: 194,
    actualMinutes: null,
    status: "Scheduled",
    urgency: "Elective",
    insuranceStatus: "Authorized",
    documentationStatus: "In Review",
    delayReason: null,
    staffIds: ["staff-nh-ava-clark", "staff-nh-daniel-yu"],
    equipmentIds: ["equip-nh-implant-tray"],
    preOpChecklist: [
      { label: "Implant consignment received", complete: false },
      { label: "Type & screen confirmed", complete: true },
      { label: "Special positioning posted", complete: true },
    ],
  },
  {
    id: "case-nh-5",
    hospitalSlug: "north-harbor",
    patientName: "Amelia Stone",
    procedureName: "Thyroid Lobectomy",
    surgeonId: "surgeon-nh-priya-desai",
    operatingRoomId: "room-nh-or-3",
    scheduledStart: "11:10",
    estimatedMinutes: 95,
    predictedMinutes: 103,
    actualMinutes: null,
    status: "Scheduled",
    urgency: "Elective",
    insuranceStatus: "Pending",
    documentationStatus: "Missing",
    delayReason: null,
    staffIds: ["staff-nh-sofia-nash"],
    equipmentIds: ["equip-nh-lap-tower"],
    preOpChecklist: [
      { label: "Ultrasound uploaded", complete: true },
      { label: "Nerve monitoring ready", complete: true },
      { label: "Pathology labels printed", complete: false },
    ],
  },
  {
    id: "case-nh-6",
    hospitalSlug: "north-harbor",
    patientName: "Noah Fisher",
    procedureName: "Emergency Appendectomy",
    surgeonId: "surgeon-nh-priya-desai",
    operatingRoomId: null,
    scheduledStart: "10:45",
    estimatedMinutes: 80,
    predictedMinutes: 88,
    actualMinutes: null,
    status: "Waitlist",
    urgency: "Emergent",
    insuranceStatus: "Pending",
    documentationStatus: "Missing",
    delayReason: "Awaiting room assignment",
    staffIds: ["staff-nh-liam-brooks"],
    equipmentIds: [],
    preOpChecklist: [
      { label: "CT reviewed", complete: true },
      { label: "Consent on chart", complete: true },
      { label: "Antibiotics started", complete: true },
    ],
  },
  {
    id: "case-sc-1",
    hospitalSlug: "st-catherine-west",
    patientName: "Harper Lee",
    procedureName: "Craniotomy for Tumor Resection",
    surgeonId: "surgeon-sc-julia-bennett",
    operatingRoomId: "room-sc-or-1",
    scheduledStart: "06:45",
    estimatedMinutes: 240,
    predictedMinutes: 258,
    actualMinutes: null,
    status: "In Surgery",
    urgency: "Urgent",
    insuranceStatus: "Authorized",
    documentationStatus: "Complete",
    delayReason: null,
    staffIds: ["staff-sc-zoe-hart"],
    equipmentIds: ["equip-sc-neuro-navigation"],
    preOpChecklist: [
      { label: "MRI registered", complete: true },
      { label: "Blood products available", complete: true },
      { label: "Neuronavigation calibrated", complete: true },
      { label: "ICU handoff ready", complete: true },
    ],
  },
  {
    id: "case-sc-2",
    hospitalSlug: "st-catherine-west",
    patientName: "Benicio Cruz",
    procedureName: "Laparoscopic Cholecystectomy",
    surgeonId: "surgeon-sc-omar-farouk",
    operatingRoomId: "room-sc-or-2",
    scheduledStart: "08:10",
    estimatedMinutes: 90,
    predictedMinutes: 96,
    actualMinutes: null,
    status: "Pre-op",
    urgency: "Urgent",
    insuranceStatus: "Authorized",
    documentationStatus: "Complete",
    delayReason: null,
    staffIds: ["staff-sc-noah-wells"],
    equipmentIds: ["equip-sc-lap-tower"],
    preOpChecklist: [
      { label: "Ultrasound confirmed", complete: true },
      { label: "Bloodwork complete", complete: true },
      { label: "Antibiotics started", complete: true },
      { label: "Post-op bed held", complete: false },
    ],
  },
  {
    id: "case-sc-3",
    hospitalSlug: "st-catherine-west",
    patientName: "Aaliyah King",
    procedureName: "Robotic Hysterectomy",
    surgeonId: "surgeon-sc-elena-novak",
    operatingRoomId: "room-sc-or-3",
    scheduledStart: "11:00",
    estimatedMinutes: 140,
    predictedMinutes: 150,
    actualMinutes: null,
    status: "Scheduled",
    urgency: "Elective",
    insuranceStatus: "Pending",
    documentationStatus: "In Review",
    delayReason: null,
    staffIds: ["staff-sc-isaac-porter"],
    equipmentIds: [],
    preOpChecklist: [
      { label: "Blood products not needed", complete: true },
      { label: "Robotic tray reserved", complete: true },
      { label: "Insurance auth finalized", complete: false },
    ],
  },
  {
    id: "case-sc-4",
    hospitalSlug: "st-catherine-west",
    patientName: "Ravi Shah",
    procedureName: "Lumbar Microdiscectomy",
    surgeonId: "surgeon-sc-julia-bennett",
    operatingRoomId: "room-sc-or-4",
    scheduledStart: "07:30",
    estimatedMinutes: 110,
    predictedMinutes: 122,
    actualMinutes: 129,
    status: "Turnover",
    urgency: "Elective",
    insuranceStatus: "Authorized",
    documentationStatus: "Complete",
    delayReason: "Fluoro downtime added 12 minutes",
    staffIds: ["staff-sc-isaac-porter"],
    equipmentIds: ["equip-sc-fluoro"],
    preOpChecklist: [
      { label: "Imaging uploaded", complete: true },
      { label: "Positioning pillows ready", complete: true },
      { label: "Pain service notified", complete: true },
    ],
  },
  {
    id: "case-sc-5",
    hospitalSlug: "st-catherine-west",
    patientName: "Fiona Morgan",
    procedureName: "Emergency Cesarean Section",
    surgeonId: "surgeon-sc-elena-novak",
    operatingRoomId: "room-sc-or-5",
    scheduledStart: "09:50",
    estimatedMinutes: 65,
    predictedMinutes: 72,
    actualMinutes: null,
    status: "Delayed",
    urgency: "Emergent",
    insuranceStatus: "Pending",
    documentationStatus: "Missing",
    delayReason: "Fetal monitoring hub still in maintenance",
    staffIds: ["staff-sc-noah-wells"],
    equipmentIds: [],
    preOpChecklist: [
      { label: "Blood bank notified", complete: true },
      { label: "NICU team on standby", complete: true },
      { label: "Monitoring hub verified", complete: false },
    ],
  },
  {
    id: "case-sc-6",
    hospitalSlug: "st-catherine-west",
    patientName: "David Kim",
    procedureName: "VP Shunt Revision",
    surgeonId: "surgeon-sc-julia-bennett",
    operatingRoomId: null,
    scheduledStart: "12:20",
    estimatedMinutes: 85,
    predictedMinutes: 94,
    actualMinutes: null,
    status: "Waitlist",
    urgency: "Urgent",
    insuranceStatus: "Authorized",
    documentationStatus: "In Review",
    delayReason: "Queued behind emergent OB add-on",
    staffIds: ["staff-sc-zoe-hart"],
    equipmentIds: [],
    preOpChecklist: [
      { label: "CT verified", complete: true },
      { label: "Pediatrics consult signed", complete: true },
      { label: "OR insert tray ready", complete: false },
    ],
  },
];

const notifications = [
  {
    id: "note-nh-1",
    hospitalSlug: "north-harbor",
    level: "Critical",
    title: "Emergency add-on arrived from ED",
    detail: "Appendectomy patient is prepped and awaiting room assignment.",
    timestamp: "09:14",
  },
  {
    id: "note-nh-2",
    hospitalSlug: "north-harbor",
    level: "Watch",
    title: "Perfusion staffing overlap",
    detail: "OR 2 and OR 5 request the same perfusion support window at 11:30.",
    timestamp: "08:57",
  },
  {
    id: "note-nh-3",
    hospitalSlug: "north-harbor",
    level: "Info",
    title: "Room turnover accelerated",
    detail: "OR 4 is six minutes ahead of its expected clean and setup cycle.",
    timestamp: "08:41",
  },
  {
    id: "note-sc-1",
    hospitalSlug: "st-catherine-west",
    level: "Critical",
    title: "OB emergency board activated",
    detail: "OR 5 is holding for fetal monitoring hardware release.",
    timestamp: "09:22",
  },
  {
    id: "note-sc-2",
    hospitalSlug: "st-catherine-west",
    level: "Watch",
    title: "Neuro room overrun risk",
    detail: "Current craniotomy is trending 18 minutes above expected duration.",
    timestamp: "08:53",
  },
  {
    id: "note-sc-3",
    hospitalSlug: "st-catherine-west",
    level: "Info",
    title: "Late-day urgent case queued",
    detail: "VP shunt revision is queued for first available clean room after 12:20.",
    timestamp: "08:36",
  },
];

const conflicts = [
  {
    id: "conflict-nh-1",
    hospitalSlug: "north-harbor",
    severity: "High",
    title: "Emergency appendectomy lacks clean room",
    detail: "Current room plan cannot accommodate the add-on without displacing the thyroid case.",
    recommendation:
      "Move thyroid lobectomy to OR 5 once sterilization completes, then insert appendectomy into OR 3.",
  },
  {
    id: "conflict-nh-2",
    hospitalSlug: "north-harbor",
    severity: "Medium",
    title: "Implant tray turnaround may delay revision hip",
    detail: "Sterile processing forecasts readiness 12 minutes after scheduled incision.",
    recommendation: "Advance sterile processing courier pickup or push incision to 12:42.",
  },
  {
    id: "conflict-sc-1",
    hospitalSlug: "st-catherine-west",
    severity: "High",
    title: "Fetal monitoring hardware under maintenance",
    detail: "Emergency cesarean section is delayed while biomedical engineering swaps the monitoring hub.",
    recommendation:
      "Reroute backup monitor from labor and delivery and keep OR 5 on priority clean.",
  },
  {
    id: "conflict-sc-2",
    hospitalSlug: "st-catherine-west",
    severity: "Medium",
    title: "Neuro overrun compresses afternoon add-on capacity",
    detail: "Room 1's active case is trending longer than predicted, jeopardizing the VP shunt revision.",
    recommendation:
      "Shift VP shunt revision to OR 4 after turnover if spine room clears before 12:15.",
  },
];

const blockTimes = [
  {
    id: "block-nh-ortho",
    hospitalSlug: "north-harbor",
    serviceLine: "Orthopedics",
    day: "Thursday",
    owner: "Dr. Asha Raman",
    allocatedHours: 8,
    usedHours: 6.8,
  },
  {
    id: "block-nh-cardiac",
    hospitalSlug: "north-harbor",
    serviceLine: "Cardiac",
    day: "Thursday",
    owner: "Dr. Miguel Alvarez",
    allocatedHours: 10,
    usedHours: 7.4,
  },
  {
    id: "block-sc-neuro",
    hospitalSlug: "st-catherine-west",
    serviceLine: "Neurosurgery",
    day: "Thursday",
    owner: "Dr. Julia Bennett",
    allocatedHours: 9,
    usedHours: 8.2,
  },
  {
    id: "block-sc-womens-health",
    hospitalSlug: "st-catherine-west",
    serviceLine: "Women's Health",
    day: "Thursday",
    owner: "Dr. Elena Novak",
    allocatedHours: 7,
    usedHours: 5.1,
  },
];

const waitlistEntries = [
  {
    id: "wait-nh-1",
    hospitalSlug: "north-harbor",
    patientName: "Noah Fisher",
    procedureName: "Emergency Appendectomy",
    priority: "Emergent",
    requestedWindow: "ASAP",
    reason: "ED escalation",
  },
  {
    id: "wait-nh-2",
    hospitalSlug: "north-harbor",
    patientName: "Claire Mendoza",
    procedureName: "Port Revision",
    priority: "Urgent",
    requestedWindow: "14:00 - 16:00",
    reason: "Device failure",
  },
  {
    id: "wait-sc-1",
    hospitalSlug: "st-catherine-west",
    patientName: "David Kim",
    procedureName: "VP Shunt Revision",
    priority: "Urgent",
    requestedWindow: "12:20 - 15:00",
    reason: "Neurosurgery add-on",
  },
  {
    id: "wait-sc-2",
    hospitalSlug: "st-catherine-west",
    patientName: "Fiona Morgan",
    procedureName: "Emergency Cesarean Section",
    priority: "Emergent",
    requestedWindow: "Immediate",
    reason: "Maternal / fetal escalation",
  },
];

const preferenceCards = [
  {
    id: "pref-nh-asha",
    hospitalSlug: "north-harbor",
    surgeonId: "surgeon-nh-asha-raman",
    setupNotes: "Wide implant table on surgeon's left, robotics drape before anesthesia timeout.",
    preferredDevices: ["Robotic Knee Console", "Revision Hip Implant Tray"],
  },
  {
    id: "pref-nh-priya",
    hospitalSlug: "north-harbor",
    surgeonId: "surgeon-nh-priya-desai",
    setupNotes:
      "Headlight, nerve monitor, and pathology labels pre-positioned before patient enters room.",
    preferredDevices: ["Laparoscopy Tower A"],
  },
  {
    id: "pref-sc-julia",
    hospitalSlug: "st-catherine-west",
    surgeonId: "surgeon-sc-julia-bennett",
    setupNotes: "Navigation cart opposite scrub table; microscope line check before incision.",
    preferredDevices: ["Neuro Navigation Cart", "Mobile C-Arm"],
  },
  {
    id: "pref-sc-elena",
    hospitalSlug: "st-catherine-west",
    surgeonId: "surgeon-sc-elena-novak",
    setupNotes:
      "Women's health tray opened after anesthesia sign-in to reduce exposure time.",
    preferredDevices: ["Fetal Monitoring Hub"],
  },
];

const documents = [
  {
    id: "doc-nh-1",
    hospitalSlug: "north-harbor",
    caseId: "case-nh-1",
    title: "Implant positioning plan",
    type: "Image Set",
    owner: "Orthopedics",
    updatedAt: "06:55",
  },
  {
    id: "doc-nh-2",
    hospitalSlug: "north-harbor",
    caseId: "case-nh-2",
    title: "Perfusion readiness checklist",
    type: "Checklist",
    owner: "Cardiac Service",
    updatedAt: "08:18",
  },
  {
    id: "doc-sc-1",
    hospitalSlug: "st-catherine-west",
    caseId: "case-sc-1",
    title: "Tumor navigation capture",
    type: "Video Snapshot",
    owner: "Neurosurgery",
    updatedAt: "08:27",
  },
  {
    id: "doc-sc-2",
    hospitalSlug: "st-catherine-west",
    caseId: "case-sc-5",
    title: "OB emergency escalation packet",
    type: "Packet",
    owner: "Women's Health",
    updatedAt: "09:20",
  },
];

const costCenters = [
  {
    id: "cost-nh-ortho",
    hospitalSlug: "north-harbor",
    department: "Orthopedics",
    utilizationRate: 94,
    costPerProcedure: 6120,
    revenuePerOrDay: 43800,
  },
  {
    id: "cost-nh-cardiac",
    hospitalSlug: "north-harbor",
    department: "Cardiac",
    utilizationRate: 88,
    costPerProcedure: 11800,
    revenuePerOrDay: 52100,
  },
  {
    id: "cost-sc-neuro",
    hospitalSlug: "st-catherine-west",
    department: "Neurosurgery",
    utilizationRate: 92,
    costPerProcedure: 10400,
    revenuePerOrDay: 49700,
  },
  {
    id: "cost-sc-womens-health",
    hospitalSlug: "st-catherine-west",
    department: "Women's Health",
    utilizationRate: 78,
    costPerProcedure: 4860,
    revenuePerOrDay: 28900,
  },
];

const threads = [
  {
    id: "thread-nh-1",
    hospitalSlug: "north-harbor",
    topic: "OR 3 emergency insertion",
    roomLabel: "Coordination Hub",
    participants: ["Charge RN", "Scheduler", "Dr. Priya Desai"],
    lastMessage:
      "Sterile processing confirms OR 5 can absorb the thyroid case at 11:35.",
    unreadCount: 4,
  },
  {
    id: "thread-nh-2",
    hospitalSlug: "north-harbor",
    topic: "Revision hip implant timing",
    roomLabel: "OR 1",
    participants: ["Sterile Processing", "Ava Clark", "Dr. Asha Raman"],
    lastMessage: "Courier has the implant tray and is en route to sterile core.",
    unreadCount: 1,
  },
  {
    id: "thread-sc-1",
    hospitalSlug: "st-catherine-west",
    topic: "OB emergency routing",
    roomLabel: "OR 5",
    participants: ["OB Lead", "Biomed", "Charge RN"],
    lastMessage: "Backup fetal monitoring hub is leaving L&D now.",
    unreadCount: 5,
  },
  {
    id: "thread-sc-2",
    hospitalSlug: "st-catherine-west",
    topic: "Neuro add-on placement",
    roomLabel: "Command Desk",
    participants: ["Scheduler", "Dr. Julia Bennett", "Isaac Porter"],
    lastMessage:
      "Tentatively holding OR 4 after turnover for the shunt revision.",
    unreadCount: 2,
  },
];

const overviewMetrics = hospitals.flatMap((hospital) => [
  {
    id: `metric-${hospital.slug}-hospital-utilization`,
    hospitalSlug: hospital.slug,
    metricKey: "hospital_utilization",
    metricLabel: "Hospital utilization",
    metricValue: hospital.occupancyRate,
    unit: "percent",
    targetValue: 85,
    trend: "stable",
    owner: "OR Command",
    note: "Baseline utilization metric seeded from hospital profile",
  },
  {
    id: `metric-${hospital.slug}-on-time-starts`,
    hospitalSlug: hospital.slug,
    metricKey: "on_time_starts",
    metricLabel: "On-time starts",
    metricValue: hospital.onTimeStarts,
    unit: "percent",
    targetValue: 90,
    trend: "stable",
    owner: "Scheduling",
    note: "Baseline on-time start metric seeded from hospital profile",
  },
  {
    id: `metric-${hospital.slug}-open-alerts`,
    hospitalSlug: hospital.slug,
    metricKey: "open_alerts",
    metricLabel: "Open alerts",
    metricValue: hospital.alertsOpen,
    unit: "count",
    targetValue: 2,
    trend: "stable",
    owner: "Coordination Desk",
    note: "Baseline alert-load metric seeded from hospital profile",
  },
]);

const demoAccounts = [
  {
    email: "olivia.reed@smartor.demo",
    fullName: "Olivia Reed",
    jobTitle: "Network Operations Director",
    defaultHospitalSlug: "north-harbor",
    memberships: [
      { hospitalSlug: "north-harbor", role: "hospital_admin", isDefault: true },
      { hospitalSlug: "st-catherine-west", role: "hospital_admin", isDefault: false },
    ],
  },
  {
    email: "jasmine.park@smartor.demo",
    fullName: "Jasmine Park",
    jobTitle: "North Harbor OR Director",
    defaultHospitalSlug: "north-harbor",
    memberships: [{ hospitalSlug: "north-harbor", role: "or_director", isDefault: true }],
  },
  {
    email: "nina.shah@smartor.demo",
    fullName: "Nina Shah",
    jobTitle: "North Harbor Scheduler",
    defaultHospitalSlug: "north-harbor",
    memberships: [{ hospitalSlug: "north-harbor", role: "scheduler", isDefault: true }],
  },
  {
    email: "asha.raman@smartor.demo",
    fullName: "Dr. Asha Raman",
    jobTitle: "North Harbor Surgeon",
    defaultHospitalSlug: "north-harbor",
    memberships: [{ hospitalSlug: "north-harbor", role: "surgeon", isDefault: true }],
  },
  {
    email: "ava.clark@smartor.demo",
    fullName: "Ava Clark",
    jobTitle: "North Harbor Charge RN",
    defaultHospitalSlug: "north-harbor",
    memberships: [{ hospitalSlug: "north-harbor", role: "staff", isDefault: true }],
  },
  {
    email: "ethan.cross@smartor.demo",
    fullName: "Ethan Cross",
    jobTitle: "St. Catherine West Hospital Admin",
    defaultHospitalSlug: "st-catherine-west",
    memberships: [{ hospitalSlug: "st-catherine-west", role: "hospital_admin", isDefault: true }],
  },
  {
    email: "elena.ruiz@smartor.demo",
    fullName: "Elena Ruiz",
    jobTitle: "St. Catherine West OR Director",
    defaultHospitalSlug: "st-catherine-west",
    memberships: [{ hospitalSlug: "st-catherine-west", role: "or_director", isDefault: true }],
  },
  {
    email: "marcus.ellis@smartor.demo",
    fullName: "Marcus Ellis",
    jobTitle: "St. Catherine West OR Scheduler",
    defaultHospitalSlug: "st-catherine-west",
    memberships: [{ hospitalSlug: "st-catherine-west", role: "scheduler", isDefault: true }],
  },
  {
    email: "julia.bennett@smartor.demo",
    fullName: "Dr. Julia Bennett",
    jobTitle: "St. Catherine West Neurosurgeon",
    defaultHospitalSlug: "st-catherine-west",
    memberships: [{ hospitalSlug: "st-catherine-west", role: "surgeon", isDefault: true }],
  },
  {
    email: "zoe.hart@smartor.demo",
    fullName: "Zoe Hart",
    jobTitle: "St. Catherine West Charge RN",
    defaultHospitalSlug: "st-catherine-west",
    memberships: [{ hospitalSlug: "st-catherine-west", role: "staff", isDefault: true }],
  },
];

const demoUsers = demoAccounts.map(
  ({ email, fullName, jobTitle, defaultHospitalSlug }) => ({
    email,
    fullName,
    jobTitle,
    defaultHospitalSlug,
  }),
);

const demoMemberships = demoAccounts.flatMap(({ email, memberships }) =>
  memberships.map((membership) => ({
    email,
    hospitalSlug: membership.hospitalSlug,
    role: membership.role,
    isDefault: membership.isDefault,
  })),
);

const hospitalIdBySlug = new Map(hospitals.map((hospital) => [hospital.slug, hospital.id]));

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getHospitalId(hospitalSlug) {
  const hospitalId = hospitalIdBySlug.get(hospitalSlug);
  if (!hospitalId) {
    throw new Error(`Unknown hospital slug: ${hospitalSlug}`);
  }
  return hospitalId;
}

function createAdminClient() {
  return createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

async function assertSchemaReady(client) {
  const { error } = await client.from("hospitals").select("id").limit(1);

  if (!error) {
    return;
  }

  if (error.code === "PGRST205") {
    throw new Error(
      "The SmartOR schema is not present in this Supabase project yet. Apply supabase/migrations/20260314095347_init_smartor_core.sql before running this seed.",
    );
  }

  throw new Error(`Schema readiness check failed: ${error.message}`);
}

async function upsertRows(client, table, rows, onConflict = "id") {
  if (rows.length === 0) {
    return;
  }

  const { error } = await client.from(table).upsert(rows, { onConflict });

  if (error) {
    throw new Error(`Failed seeding ${table}: ${error.message}`);
  }
}

async function getExistingUserIdByEmail(client, email) {
  const { data, error } = await client
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed looking up ${email}: ${error.message}`);
  }

  return data?.id ?? null;
}

async function listAuthUserByEmail(client, email) {
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    throw new Error(`Failed listing auth users for ${email}: ${error.message}`);
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function ensureDemoUsers(client) {
  const userIdsByEmail = new Map();

  for (const user of demoUsers) {
    let userId = await getExistingUserIdByEmail(client, user.email);

    if (!userId) {
      const { data, error } = await client.auth.admin.createUser({
        email: user.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
        },
      });

      if (error && !error.message.toLowerCase().includes("already")) {
        throw new Error(`Failed creating auth user ${user.email}: ${error.message}`);
      }

      userId = data.user?.id ?? null;

      if (!userId) {
        const existingAuthUser = await listAuthUserByEmail(client, user.email);
        userId = existingAuthUser?.id ?? null;
      }
    }

    if (!userId) {
      throw new Error(`Could not resolve an auth user id for ${user.email}`);
    }

    const { error: updateError } = await client.auth.admin.updateUserById(userId, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName,
      },
    });

    if (updateError) {
      throw new Error(`Failed updating auth user ${user.email}: ${updateError.message}`);
    }

    userIdsByEmail.set(user.email, userId);
  }

  const profileRows = demoUsers.map((user) => ({
    id: userIdsByEmail.get(user.email),
    email: user.email,
    full_name: user.fullName,
    job_title: user.jobTitle,
    default_hospital_id: getHospitalId(user.defaultHospitalSlug),
  }));

  await upsertRows(client, "profiles", profileRows);

  return userIdsByEmail;
}

async function main() {
  const client = createAdminClient();

  await assertSchemaReady(client);

  await upsertRows(
    client,
    "hospitals",
    hospitals.map((hospital) => ({
      id: hospital.id,
      slug: hospital.slug,
      name: hospital.name,
      city: hospital.city,
      state: hospital.state,
      network_name: hospital.networkName,
      beds: hospital.beds,
      or_count: hospital.orCount,
      occupancy_rate: hospital.occupancyRate,
      on_time_starts: hospital.onTimeStarts,
      turnover_minutes: hospital.turnoverMinutes,
      alerts_open: hospital.alertsOpen,
      ehr_status: hospital.ehrStatus,
      adoption_score: hospital.adoptionScore,
    })),
  );

  const userIdsByEmail = await ensureDemoUsers(client);

  await upsertRows(
    client,
    "hospital_memberships",
    demoMemberships.map((membership) => ({
      hospital_id: getHospitalId(membership.hospitalSlug),
      user_id: userIdsByEmail.get(membership.email),
      role: membership.role,
      is_default: membership.isDefault,
    })),
    "hospital_id,user_id",
  );

  await upsertRows(
    client,
    "surgeons",
    surgeons.map((surgeon) => ({
      id: surgeon.id,
      hospital_id: getHospitalId(surgeon.hospitalSlug),
      name: surgeon.name,
      specialty: surgeon.specialty,
      block_preference: surgeon.blockPreference,
      availability: surgeon.availability,
    })),
  );

  await upsertRows(
    client,
    "operating_rooms",
    rooms.map((room) => ({
      id: room.id,
      hospital_id: getHospitalId(room.hospitalSlug),
      name: room.name,
      service_line: room.serviceLine,
      status: room.status,
      active_case_id: room.activeCaseId ?? null,
      next_case_id: room.nextCaseId ?? null,
      utilization_rate: room.utilizationRate,
      turnover_minutes: room.turnoverMinutes,
      staffed_by: room.staffedBy,
    })),
  );

  await upsertRows(
    client,
    "staff_members",
    staff.map((member) => ({
      id: member.id,
      hospital_id: getHospitalId(member.hospitalSlug),
      name: member.name,
      role: member.role,
      shift: member.shift,
      assigned_room_id: member.assignedRoomId,
      availability_label: member.availabilityLabel,
    })),
  );

  await upsertRows(
    client,
    "equipment",
    equipment.map((item) => ({
      id: item.id,
      hospital_id: getHospitalId(item.hospitalSlug),
      name: item.name,
      type: item.type,
      status: item.status,
      assigned_case_id: item.assignedCaseId,
      last_sterilized_at: item.lastSterilizedAt,
    })),
  );

  await upsertRows(
    client,
    "surgery_cases",
    surgeryCases.map((record) => ({
      id: record.id,
      hospital_id: getHospitalId(record.hospitalSlug),
      patient_name: record.patientName,
      procedure_name: record.procedureName,
      surgeon_id: record.surgeonId,
      operating_room_id: record.operatingRoomId,
      scheduled_start: record.scheduledStart,
      estimated_minutes: record.estimatedMinutes,
      predicted_minutes: record.predictedMinutes,
      actual_minutes: record.actualMinutes,
      status: record.status,
      urgency: record.urgency,
      insurance_status: record.insuranceStatus,
      documentation_status: record.documentationStatus,
      delay_reason: record.delayReason,
      staff_ids: record.staffIds,
      equipment_ids: record.equipmentIds,
      pre_op_checklist: record.preOpChecklist,
    })),
  );

  await upsertRows(
    client,
    "notifications",
    notifications.map((notification) => ({
      id: notification.id,
      hospital_id: getHospitalId(notification.hospitalSlug),
      level: notification.level,
      title: notification.title,
      detail: notification.detail,
      timestamp: notification.timestamp,
    })),
  );

  await upsertRows(
    client,
    "conflicts",
    conflicts.map((conflict) => ({
      id: conflict.id,
      hospital_id: getHospitalId(conflict.hospitalSlug),
      severity: conflict.severity,
      title: conflict.title,
      detail: conflict.detail,
      recommendation: conflict.recommendation,
    })),
  );

  await upsertRows(
    client,
    "block_time_allocations",
    blockTimes.map((block) => ({
      id: block.id,
      hospital_id: getHospitalId(block.hospitalSlug),
      service_line: block.serviceLine,
      day: block.day,
      owner: block.owner,
      allocated_hours: block.allocatedHours,
      used_hours: block.usedHours,
    })),
  );

  await upsertRows(
    client,
    "waitlist_entries",
    waitlistEntries.map((entry) => ({
      id: entry.id,
      hospital_id: getHospitalId(entry.hospitalSlug),
      patient_name: entry.patientName,
      procedure_name: entry.procedureName,
      priority: entry.priority,
      requested_window: entry.requestedWindow,
      reason: entry.reason,
    })),
  );

  await upsertRows(
    client,
    "preference_cards",
    preferenceCards.map((card) => ({
      id: card.id,
      hospital_id: getHospitalId(card.hospitalSlug),
      surgeon_id: card.surgeonId,
      setup_notes: card.setupNotes,
      preferred_devices: card.preferredDevices,
    })),
  );

  await upsertRows(
    client,
    "document_records",
    documents.map((document) => ({
      id: document.id,
      hospital_id: getHospitalId(document.hospitalSlug),
      case_id: document.caseId,
      title: document.title,
      type: document.type,
      owner: document.owner,
      updated_at: document.updatedAt,
    })),
  );

  await upsertRows(
    client,
    "cost_centers",
    costCenters.map((costCenter) => ({
      id: costCenter.id,
      hospital_id: getHospitalId(costCenter.hospitalSlug),
      department: costCenter.department,
      utilization_rate: costCenter.utilizationRate,
      cost_per_procedure: costCenter.costPerProcedure,
      revenue_per_or_day: costCenter.revenuePerOrDay,
    })),
  );

  await upsertRows(
    client,
    "message_threads",
    threads.map((thread) => ({
      id: thread.id,
      hospital_id: getHospitalId(thread.hospitalSlug),
      topic: thread.topic,
      room_label: thread.roomLabel,
      participants: thread.participants,
      last_message: thread.lastMessage,
      unread_count: thread.unreadCount,
    })),
  );

  await upsertRows(
    client,
    "overview_metrics",
    overviewMetrics.map((metric) => ({
      id: metric.id,
      hospital_id: getHospitalId(metric.hospitalSlug),
      metric_key: metric.metricKey,
      metric_label: metric.metricLabel,
      metric_value: metric.metricValue,
      unit: metric.unit,
      target_value: metric.targetValue,
      trend: metric.trend,
      owner: metric.owner,
      note: metric.note,
    })),
    "hospital_id,metric_key",
  );

  console.log("SmartOR demo seed completed.");
  console.log(
    JSON.stringify(
      {
        hospitals: hospitals.length,
        surgeons: surgeons.length,
        staff: staff.length,
        rooms: rooms.length,
        equipment: equipment.length,
        surgeryCases: surgeryCases.length,
        notifications: notifications.length,
        conflicts: conflicts.length,
        blockTimes: blockTimes.length,
        waitlistEntries: waitlistEntries.length,
        preferenceCards: preferenceCards.length,
        documents: documents.length,
        costCenters: costCenters.length,
        threads: threads.length,
        overviewMetrics: overviewMetrics.length,
        demoAccounts: demoAccounts.map((account) => ({
          email: account.email,
          fullName: account.fullName,
          defaultHospitalSlug: account.defaultHospitalSlug,
          memberships: account.memberships.map((membership) => ({
            hospitalSlug: membership.hospitalSlug,
            role: membership.role,
            isDefault: membership.isDefault,
          })),
        })),
        demoPassword: DEMO_PASSWORD,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
