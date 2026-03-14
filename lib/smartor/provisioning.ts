import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { slugify } from "@/lib/utils";

type ProvisionHospitalInput = {
  userId: string;
  email: string;
  fullName: string;
  hospitalName: string;
  city: string;
  state: string;
};

export async function provisionHospitalForUser({
  userId,
  email,
  fullName,
  hospitalName,
  city,
  state,
}: ProvisionHospitalInput) {
  const supabase = createSupabaseServiceRoleClient();
  const suffix = userId.replace(/-/g, "").slice(0, 6);
  const hospitalSlugBase = slugify(hospitalName);
  const hospitalSlug = `${hospitalSlugBase}-${suffix}`;
  const hospitalId = `hospital-${hospitalSlug}`;

  const roomIds = Array.from({ length: 5 }).map(
    (_, index) => `room-${hospitalSlug}-or-${index + 1}`,
  );
  const surgeonIds = [
    `surgeon-${hospitalSlug}-coleman`,
    `surgeon-${hospitalSlug}-ramirez`,
    `surgeon-${hospitalSlug}-singh`,
  ];
  const staffIds = [
    `staff-${hospitalSlug}-charge-rn`,
    `staff-${hospitalSlug}-anesthesia`,
    `staff-${hospitalSlug}-scrub-tech`,
    `staff-${hospitalSlug}-scheduler`,
  ];
  const equipmentIds = [
    `equipment-${hospitalSlug}-robotics`,
    `equipment-${hospitalSlug}-imaging`,
    `equipment-${hospitalSlug}-lap`,
  ];
  const caseIds = [
    `case-${hospitalSlug}-1`,
    `case-${hospitalSlug}-2`,
    `case-${hospitalSlug}-3`,
    `case-${hospitalSlug}-4`,
  ];

  const { error: hospitalError } = await supabase.from("hospitals").insert({
    id: hospitalId,
    slug: hospitalSlug,
    name: hospitalName,
    city,
    state,
    network_name: "SmartOR Network",
    beds: 150,
    or_count: 5,
    occupancy_rate: 82,
    on_time_starts: 79,
    turnover_minutes: 36,
    alerts_open: 2,
    ehr_status: "Pending",
    adoption_score: 61,
  });

  if (hospitalError) {
    throw hospitalError;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name: fullName,
    default_hospital_id: hospitalId,
  });

  if (profileError) {
    throw profileError;
  }

  const { error: membershipError } = await supabase
    .from("hospital_memberships")
    .insert({
      hospital_id: hospitalId,
      user_id: userId,
      role: "hospital_admin",
      is_default: true,
    });

  if (membershipError) {
    throw membershipError;
  }

  const { error: roomError } = await supabase.from("operating_rooms").insert([
    {
      id: roomIds[0],
      hospital_id: hospitalId,
      name: "OR 1",
      service_line: "Orthopedics",
      status: "In Surgery",
      active_case_id: caseIds[0],
      next_case_id: caseIds[2],
      utilization_rate: 91,
      turnover_minutes: 28,
      staffed_by: [staffIds[0]],
    },
    {
      id: roomIds[1],
      hospital_id: hospitalId,
      name: "OR 2",
      service_line: "General Surgery",
      status: "Pre-op",
      active_case_id: caseIds[1],
      utilization_rate: 84,
      turnover_minutes: 37,
      staffed_by: [staffIds[1]],
    },
    {
      id: roomIds[2],
      hospital_id: hospitalId,
      name: "OR 3",
      service_line: "Add-on / Flex",
      status: "Available",
      next_case_id: caseIds[3],
      utilization_rate: 73,
      turnover_minutes: 33,
      staffed_by: [],
    },
    {
      id: roomIds[3],
      hospital_id: hospitalId,
      name: "OR 4",
      service_line: "Women’s Health",
      status: "Turnover",
      utilization_rate: 68,
      turnover_minutes: 42,
      staffed_by: [staffIds[2]],
    },
    {
      id: roomIds[4],
      hospital_id: hospitalId,
      name: "OR 5",
      service_line: "Emergency Hold",
      status: "Delayed",
      utilization_rate: 49,
      turnover_minutes: 46,
      staffed_by: [staffIds[3]],
    },
  ]);

  if (roomError) {
    throw roomError;
  }

  const { error: surgeonError } = await supabase.from("surgeons").insert([
    {
      id: surgeonIds[0],
      hospital_id: hospitalId,
      name: "Dr. Meredith Coleman",
      specialty: "Orthopedic Reconstruction",
      block_preference: "Mon / Thu morning block",
      availability: [
        { day: "Today", start: "07:00", end: "15:00", note: "Robot support at noon" },
        { day: "Tomorrow", start: "08:00", end: "13:00" },
      ],
    },
    {
      id: surgeonIds[1],
      hospital_id: hospitalId,
      name: "Dr. Elias Ramirez",
      specialty: "General Surgery",
      block_preference: "Tue / Fri acute care block",
      availability: [
        { day: "Today", start: "07:30", end: "17:00", note: "Clinic handoff at 14:30" },
        { day: "Tomorrow", start: "09:00", end: "15:00" },
      ],
    },
    {
      id: surgeonIds[2],
      hospital_id: hospitalId,
      name: "Dr. Kavya Singh",
      specialty: "Gynecologic Surgery",
      block_preference: "Wed women’s health block",
      availability: [
        { day: "Today", start: "08:00", end: "16:30", note: "Urgent add-on watch" },
        { day: "Tomorrow", start: "09:30", end: "15:30" },
      ],
    },
  ]);

  if (surgeonError) {
    throw surgeonError;
  }

  const { error: staffError } = await supabase.from("staff_members").insert([
    {
      id: staffIds[0],
      hospital_id: hospitalId,
      name: "Jordan Blake",
      role: "Charge RN",
      shift: "07:00 - 19:00",
      assigned_room_id: roomIds[0],
      availability_label: "Primary command-room escalation point",
    },
    {
      id: staffIds[1],
      hospital_id: hospitalId,
      name: "Taylor Nguyen",
      role: "Anesthesiologist",
      shift: "07:00 - 17:00",
      assigned_room_id: roomIds[1],
      availability_label: "Available to float after 13:00",
    },
    {
      id: staffIds[2],
      hospital_id: hospitalId,
      name: "Casey Brooks",
      role: "Scrub Tech",
      shift: "08:00 - 16:00",
      assigned_room_id: roomIds[3],
      availability_label: "Turnover support after current room clears",
    },
    {
      id: staffIds[3],
      hospital_id: hospitalId,
      name: fullName,
      role: "Operations Admin",
      shift: "07:00 - 17:00",
      assigned_room_id: null,
      availability_label: "Default hospital administrator account",
    },
  ]);

  if (staffError) {
    throw staffError;
  }

  const { error: equipmentError } = await supabase.from("equipment").insert([
    {
      id: equipmentIds[0],
      hospital_id: hospitalId,
      name: "Robotic Console A",
      type: "Robotics",
      status: "In Use",
      assigned_case_id: caseIds[0],
      last_sterilized_at: "06:30",
    },
    {
      id: equipmentIds[1],
      hospital_id: hospitalId,
      name: "Mobile Imaging C-Arm",
      type: "Imaging",
      status: "Reserved",
      assigned_case_id: caseIds[1],
      last_sterilized_at: "07:10",
    },
    {
      id: equipmentIds[2],
      hospital_id: hospitalId,
      name: "Laparoscopy Tower",
      type: "Endoscopy",
      status: "Ready",
      assigned_case_id: caseIds[3],
      last_sterilized_at: "07:42",
    },
  ]);

  if (equipmentError) {
    throw equipmentError;
  }

  const { error: caseError } = await supabase.from("surgery_cases").insert([
    {
      id: caseIds[0],
      hospital_id: hospitalId,
      patient_name: "Morgan Ellis",
      procedure_name: "Total Knee Arthroplasty",
      surgeon_id: surgeonIds[0],
      operating_room_id: roomIds[0],
      scheduled_start: "07:15",
      estimated_minutes: 130,
      predicted_minutes: 142,
      actual_minutes: null,
      status: "In Surgery",
      urgency: "Elective",
      insurance_status: "Authorized",
      documentation_status: "Complete",
      delay_reason: null,
      staff_ids: [staffIds[0]],
      equipment_ids: [equipmentIds[0]],
      pre_op_checklist: [
        { label: "Consent signed", complete: true },
        { label: "Implant tray verified", complete: true },
        { label: "Antibiotics released", complete: true },
      ],
    },
    {
      id: caseIds[1],
      hospital_id: hospitalId,
      patient_name: "Avery Parker",
      procedure_name: "Laparoscopic Cholecystectomy",
      surgeon_id: surgeonIds[1],
      operating_room_id: roomIds[1],
      scheduled_start: "08:20",
      estimated_minutes: 95,
      predicted_minutes: 101,
      actual_minutes: null,
      status: "Pre-op",
      urgency: "Urgent",
      insurance_status: "Pending",
      documentation_status: "In Review",
      delay_reason: "Awaiting bed confirmation",
      staff_ids: [staffIds[1]],
      equipment_ids: [equipmentIds[1]],
      pre_op_checklist: [
        { label: "Consent signed", complete: true },
        { label: "Labs complete", complete: true },
        { label: "Post-op bed confirmed", complete: false },
      ],
    },
    {
      id: caseIds[2],
      hospital_id: hospitalId,
      patient_name: "Riley Cooper",
      procedure_name: "Revision Hip Arthroplasty",
      surgeon_id: surgeonIds[0],
      operating_room_id: roomIds[0],
      scheduled_start: "12:40",
      estimated_minutes: 185,
      predicted_minutes: 197,
      actual_minutes: null,
      status: "Scheduled",
      urgency: "Elective",
      insurance_status: "Authorized",
      documentation_status: "In Review",
      delay_reason: null,
      staff_ids: [staffIds[0], staffIds[2]],
      equipment_ids: [equipmentIds[0]],
      pre_op_checklist: [
        { label: "Blood products ready", complete: true },
        { label: "Implant consignment checked in", complete: false },
        { label: "Positioning note posted", complete: true },
      ],
    },
    {
      id: caseIds[3],
      hospital_id: hospitalId,
      patient_name: "Cameron Hayes",
      procedure_name: "Emergency Appendectomy",
      surgeon_id: surgeonIds[1],
      operating_room_id: null,
      scheduled_start: "10:50",
      estimated_minutes: 80,
      predicted_minutes: 88,
      actual_minutes: null,
      status: "Waitlist",
      urgency: "Emergent",
      insurance_status: "Pending",
      documentation_status: "Missing",
      delay_reason: "Waiting for clean-room placement",
      staff_ids: [staffIds[1]],
      equipment_ids: [equipmentIds[2]],
      pre_op_checklist: [
        { label: "CT reviewed", complete: true },
        { label: "Consent on chart", complete: true },
        { label: "Antibiotics started", complete: true },
      ],
    },
  ]);

  if (caseError) {
    throw caseError;
  }

  const { error: notificationError } = await supabase.from("notifications").insert([
    {
      id: `notification-${hospitalSlug}-1`,
      hospital_id: hospitalId,
      level: "Critical",
      title: "Emergency add-on awaiting placement",
      detail: "Appendectomy patient is prepped and ready for first open room.",
      timestamp: "09:12",
    },
    {
      id: `notification-${hospitalSlug}-2`,
      hospital_id: hospitalId,
      level: "Watch",
      title: "Bed management confirmation pending",
      detail: "OR 2 will slip if inpatient bed assignment is not confirmed by 09:40.",
      timestamp: "08:58",
    },
    {
      id: `notification-${hospitalSlug}-3`,
      hospital_id: hospitalId,
      level: "Info",
      title: "Turnover running ahead",
      detail: "OR 4 is eight minutes ahead of expected clean/setup target.",
      timestamp: "08:37",
    },
  ]);

  if (notificationError) {
    throw notificationError;
  }

  const { error: conflictError } = await supabase.from("conflicts").insert([
    {
      id: `conflict-${hospitalSlug}-1`,
      hospital_id: hospitalId,
      severity: "High",
      title: "Emergency appendectomy lacks room assignment",
      detail: "The current room plan cannot absorb the add-on without moving one elective case.",
      recommendation: "Shift the revision hip case to OR 3 and place the appendectomy into OR 1 turnover slot.",
    },
    {
      id: `conflict-${hospitalSlug}-2`,
      hospital_id: hospitalId,
      severity: "Medium",
      title: "Late bed confirmation risk",
      detail: "Post-op bed confirmation remains incomplete for the laparoscopic cholecystectomy.",
      recommendation: "Escalate to bed management before anesthesia start to avoid a downstream hold.",
    },
  ]);

  if (conflictError) {
    throw conflictError;
  }

  const { error: blockTimeError } = await supabase
    .from("block_time_allocations")
    .insert([
      {
        id: `block-${hospitalSlug}-ortho`,
        hospital_id: hospitalId,
        service_line: "Orthopedics",
        day: "Thursday",
        owner: "Dr. Meredith Coleman",
        allocated_hours: 8,
        used_hours: 6.6,
      },
      {
        id: `block-${hospitalSlug}-general`,
        hospital_id: hospitalId,
        service_line: "General Surgery",
        day: "Thursday",
        owner: "Dr. Elias Ramirez",
        allocated_hours: 9,
        used_hours: 5.8,
      },
    ]);

  if (blockTimeError) {
    throw blockTimeError;
  }

  const { error: waitlistError } = await supabase.from("waitlist_entries").insert([
    {
      id: `wait-${hospitalSlug}-1`,
      hospital_id: hospitalId,
      patient_name: "Cameron Hayes",
      procedure_name: "Emergency Appendectomy",
      priority: "Emergent",
      requested_window: "Immediate",
      reason: "ED escalation",
    },
    {
      id: `wait-${hospitalSlug}-2`,
      hospital_id: hospitalId,
      patient_name: "Jordan Bell",
      procedure_name: "Port Revision",
      priority: "Urgent",
      requested_window: "14:00 - 16:00",
      reason: "Device failure",
    },
  ]);

  if (waitlistError) {
    throw waitlistError;
  }

  const { error: preferenceError } = await supabase.from("preference_cards").insert([
    {
      id: `preference-${hospitalSlug}-1`,
      hospital_id: hospitalId,
      surgeon_id: surgeonIds[0],
      setup_notes: "Robot dock on surgeon’s left with implant table opened after timeout.",
      preferred_devices: ["Robotic Console A"],
    },
    {
      id: `preference-${hospitalSlug}-2`,
      hospital_id: hospitalId,
      surgeon_id: surgeonIds[1],
      setup_notes: "Imaging cart in room before patient enters to reduce turnover waste.",
      preferred_devices: ["Mobile Imaging C-Arm", "Laparoscopy Tower"],
    },
  ]);

  if (preferenceError) {
    throw preferenceError;
  }

  const { error: documentError } = await supabase.from("document_records").insert([
    {
      id: `document-${hospitalSlug}-1`,
      hospital_id: hospitalId,
      case_id: caseIds[0],
      title: "Implant alignment plan",
      type: "Image Set",
      owner: "Orthopedics",
      updated_at: "06:54",
    },
    {
      id: `document-${hospitalSlug}-2`,
      hospital_id: hospitalId,
      case_id: caseIds[1],
      title: "Pre-op readiness checklist",
      type: "Checklist",
      owner: "General Surgery",
      updated_at: "08:05",
    },
  ]);

  if (documentError) {
    throw documentError;
  }

  const { error: costCenterError } = await supabase.from("cost_centers").insert([
    {
      id: `cost-${hospitalSlug}-1`,
      hospital_id: hospitalId,
      department: "Orthopedics",
      utilization_rate: 91,
      cost_per_procedure: 6200,
      revenue_per_or_day: 41200,
    },
    {
      id: `cost-${hospitalSlug}-2`,
      hospital_id: hospitalId,
      department: "General Surgery",
      utilization_rate: 84,
      cost_per_procedure: 5100,
      revenue_per_or_day: 33700,
    },
  ]);

  if (costCenterError) {
    throw costCenterError;
  }

  const { error: threadError } = await supabase.from("message_threads").insert([
    {
      id: `thread-${hospitalSlug}-1`,
      hospital_id: hospitalId,
      topic: "Emergency insertion planning",
      room_label: "Command Desk",
      participants: ["Charge RN", "OR Scheduler", "Dr. Elias Ramirez"],
      last_message: "Hold OR 3 for flex placement if turnover lands before 11:15.",
      unread_count: 3,
    },
    {
      id: `thread-${hospitalSlug}-2`,
      hospital_id: hospitalId,
      topic: "Revision hip readiness",
      room_label: "OR 1",
      participants: ["Charge RN", "Sterile Core", "Dr. Meredith Coleman"],
      last_message: "Implant tray pickup is confirmed and en route back to the suite.",
      unread_count: 1,
    },
  ]);

  if (threadError) {
    throw threadError;
  }

  return {
    hospitalId,
    hospitalSlug,
  };
}
