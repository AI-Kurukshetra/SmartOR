"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilLine, Save, X } from "lucide-react";

import { updateCaseReadinessAction } from "@/app/actions/case-readiness";
import { Panel } from "@/components/smartor/panel";
import { StatusPill } from "@/components/smartor/status-pill";
import type { SurgeryCase } from "@/lib/validations/smartor";

type CaseReadinessCrudPanelProps = {
  hospitalSlug: string;
  cases: SurgeryCase[];
  canMutate: boolean;
};

const statusOptions: SurgeryCase["status"][] = [
  "Scheduled",
  "Pre-op",
  "Ready",
  "In Surgery",
  "Turnover",
  "Delayed",
  "Waitlist",
];

const insuranceOptions: SurgeryCase["insuranceStatus"][] = ["Authorized", "Pending", "Missing"];
const documentationOptions: SurgeryCase["documentationStatus"][] = [
  "Complete",
  "In Review",
  "Missing",
];

export function CaseReadinessCrudPanel({
  hospitalSlug,
  cases,
  canMutate,
}: CaseReadinessCrudPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);

  const sortedCases = useMemo(
    () => [...cases].sort((left, right) => left.scheduledStart.localeCompare(right.scheduledStart)),
    [cases],
  );

  const editingCase = useMemo(
    () => sortedCases.find((caseItem) => caseItem.id === editingCaseId) ?? null,
    [editingCaseId, sortedCases],
  );

  async function handleUpdate(formData: FormData) {
    if (!canMutate) {
      setMessage("You do not have permission to update readiness.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const result = await updateCaseReadinessAction({
      hospitalSlug,
      caseId: String(formData.get("caseId") ?? ""),
      status: String(formData.get("status") ?? "Scheduled") as SurgeryCase["status"],
      insuranceStatus: String(formData.get("insuranceStatus") ?? "Pending") as SurgeryCase["insuranceStatus"],
      documentationStatus: String(formData.get("documentationStatus") ?? "Missing") as SurgeryCase["documentationStatus"],
      delayReason: normalizeNullableString(formData.get("delayReason")),
    });

    setIsSaving(false);
    setMessage(result.ok ? "Readiness updated." : result.error ?? "Unable to update readiness.");

    if (result.ok) {
      setEditingCaseId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <Panel
        eyebrow="MVP scope"
        title="Case readiness manager"
        description="Role-based updates for insurance authorization, documentation status, and case readiness progression."
      >
        <div className="overflow-x-auto rounded-2xl border border-line/70 bg-white/85">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background/70 text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-3">Case</th>
                <th className="px-3 py-3">Start</th>
                <th className="px-3 py-3">Readiness</th>
                <th className="px-3 py-3">Insurance</th>
                <th className="px-3 py-3">Documentation</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedCases.map((caseItem) => (
                <tr key={caseItem.id} className="border-t border-line/60 align-top">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-foreground">{caseItem.patientName}</p>
                    <p className="text-xs text-muted">{caseItem.procedureName}</p>
                  </td>
                  <td className="px-3 py-3 text-foreground">{caseItem.scheduledStart}</td>
                  <td className="px-3 py-3">
                    <StatusPill label={caseItem.status} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill label={caseItem.insuranceStatus} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill label={caseItem.documentationStatus} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingCaseId(caseItem.id)}
                        disabled={!canMutate || isSaving}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-line/70 bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:border-accent/25 hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <PencilLine className="size-3.5" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {message ? (
          <p className="mt-3 rounded-xl border border-line/70 bg-background/70 px-3 py-2 text-xs text-muted">{message}</p>
        ) : null}
      </Panel>

      {editingCase ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-4xl rounded-[26px] border border-line/60 bg-white p-5 shadow-[0_24px_48px_rgba(8,27,29,0.2)] md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Update readiness</p>
                <h3 className="text-xl font-semibold text-foreground">{editingCase.patientName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCaseId(null)}
                className="rounded-full border border-line/70 p-2 text-muted transition hover:bg-background"
                aria-label="Close readiness modal"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              action={(formData) => {
                startTransition(() => {
                  void handleUpdate(formData);
                });
              }}
              className="space-y-4"
            >
              <input type="hidden" name="caseId" value={editingCase.id} />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <select name="status" defaultValue={editingCase.status} className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm">
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  name="insuranceStatus"
                  defaultValue={editingCase.insuranceStatus}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                >
                  {insuranceOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  name="documentationStatus"
                  defaultValue={editingCase.documentationStatus}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                >
                  {documentationOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input
                  name="delayReason"
                  defaultValue={editingCase.delayReason ?? ""}
                  placeholder="Delay reason (optional)"
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!canMutate || isSaving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-3 py-2 text-sm font-semibold text-background transition hover:bg-accentStrong disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="size-4" />
                  Save readiness
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function normalizeNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length ? trimmed : null;
}
