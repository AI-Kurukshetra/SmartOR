"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, PencilLine, Plus, Save, Trash2, X } from "lucide-react";

import {
  createIntegrationSettingAction,
  deleteIntegrationSettingAction,
  updateIntegrationSettingAction,
} from "@/app/actions/integration-settings";
import { Panel } from "@/components/smartor/panel";
import type { IntegrationSetting } from "@/lib/validations/smartor";

type IntegrationSettingsPanelProps = {
  hospitalSlug: string;
  settings: IntegrationSetting[];
  canMutate: boolean;
};

const integrationStatusOptions: IntegrationSetting["status"][] = [
  "Connected",
  "Sandbox",
  "Pending",
  "Disconnected",
];

export function IntegrationSettingsPanel({
  hospitalSlug,
  settings,
  canMutate,
}: IntegrationSettingsPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingIntegrationId, setEditingIntegrationId] = useState<string | null>(null);

  const sortedSettings = useMemo(
    () => [...settings].sort((left, right) => left.integrationLabel.localeCompare(right.integrationLabel)),
    [settings],
  );

  const editingSetting = useMemo(
    () => sortedSettings.find((setting) => setting.id === editingIntegrationId) ?? null,
    [editingIntegrationId, sortedSettings],
  );

  async function handleCreate(formData: FormData) {
    if (!canMutate) {
      setMessage("You do not have permission to create integration settings.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const result = await createIntegrationSettingAction({
      hospitalSlug,
      integrationKey: String(formData.get("integrationKey") ?? ""),
      integrationLabel: String(formData.get("integrationLabel") ?? ""),
      vendorName: String(formData.get("vendorName") ?? ""),
      status: String(formData.get("status") ?? "Pending") as IntegrationSetting["status"],
      baseUrl: normalizeNullableUrl(formData.get("baseUrl")),
      notes: normalizeNullableString(formData.get("notes")),
    });

    setIsSaving(false);
    setMessage(result.ok ? "Integration setting created." : result.error ?? "Unable to create setting.");

    if (result.ok) {
      setIsCreateModalOpen(false);
      router.refresh();
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!canMutate) {
      setMessage("You do not have permission to update integration settings.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const result = await updateIntegrationSettingAction({
      hospitalSlug,
      integrationId: String(formData.get("integrationId") ?? ""),
      integrationLabel: String(formData.get("integrationLabel") ?? ""),
      vendorName: String(formData.get("vendorName") ?? ""),
      status: String(formData.get("status") ?? "Pending") as IntegrationSetting["status"],
      baseUrl: normalizeNullableUrl(formData.get("baseUrl")),
      notes: normalizeNullableString(formData.get("notes")),
    });

    setIsSaving(false);
    setMessage(result.ok ? "Integration setting updated." : result.error ?? "Unable to update setting.");

    if (result.ok) {
      setEditingIntegrationId(null);
      router.refresh();
    }
  }

  async function handleDelete(integrationId: string) {
    if (!canMutate) {
      setMessage("You do not have permission to delete integration settings.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const result = await deleteIntegrationSettingAction({ hospitalSlug, integrationId });

    setIsSaving(false);
    setMessage(result.ok ? "Integration setting deleted." : result.error ?? "Unable to delete setting.");

    if (result.ok) {
      setEditingIntegrationId(null);
      router.refresh();
    }
  }

  return (
    <Panel
      className="bg-white/80 md:col-span-2"
      eyebrow="Integration boundaries"
      title="Hospital integration settings"
      description="Manage hospital-scoped EHR, messaging, billing, and analytics boundaries with status and endpoint controls."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Boundaries: <span className="font-semibold text-foreground">{sortedSettings.length}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setIsCreateModalOpen(true);
          }}
          disabled={!canMutate || isSaving}
          className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-accentStrong disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="size-4" />
          Add integration
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line/70 bg-white/85">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-background/70 text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-3 py-3">Integration</th>
              <th className="px-3 py-3">Vendor</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Endpoint</th>
              <th className="px-3 py-3">Last sync</th>
              <th className="px-3 py-3">Notes</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSettings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-sm text-muted">
                  No integration boundaries yet.
                </td>
              </tr>
            ) : (
              sortedSettings.map((setting) => (
                <tr key={setting.id} className="border-t border-line/60 align-top">
                  <td className="px-3 py-3">
                    <div className="inline-flex items-center gap-2">
                      <Link2 className="size-3.5 text-accentStrong" />
                      <p className="font-semibold text-foreground">{setting.integrationLabel}</p>
                    </div>
                    <p className="text-xs text-muted">{setting.integrationKey}</p>
                  </td>
                  <td className="px-3 py-3 text-foreground">{setting.vendorName}</td>
                  <td className="px-3 py-3">
                    <span className={statusBadgeClassNames(setting.status)}>{setting.status}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted">{setting.baseUrl ?? "-"}</td>
                  <td className="px-3 py-3 text-xs text-muted">{formatTimestamp(setting.lastSyncAt)}</td>
                  <td className="max-w-80 px-3 py-3 text-xs text-muted">{setting.notes ?? "-"}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMessage(null);
                          setEditingIntegrationId(setting.id);
                        }}
                        disabled={!canMutate || isSaving}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-line/70 bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:border-accent/25 hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <PencilLine className="size-3.5" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {message ? (
        <p className="mt-3 rounded-xl border border-line/70 bg-background/70 px-3 py-2 text-xs text-muted">{message}</p>
      ) : null}

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-4xl rounded-[26px] border border-line/60 bg-white p-5 shadow-[0_24px_48px_rgba(8,27,29,0.2)] md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Create integration</p>
                <h3 className="text-xl font-semibold text-foreground">New integration boundary</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full border border-line/70 p-2 text-muted transition hover:bg-background"
                aria-label="Close create integration modal"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              action={(formData) => {
                startTransition(() => {
                  void handleCreate(formData);
                });
              }}
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
            >
              <input
                required
                name="integrationKey"
                placeholder="integration_key"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm"
              />
              <input
                required
                name="integrationLabel"
                placeholder="Integration label"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm"
              />
              <input
                required
                name="vendorName"
                placeholder="Vendor"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm"
              />
              <select
                name="status"
                defaultValue="Pending"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm"
              >
                {integrationStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                name="baseUrl"
                type="url"
                placeholder="https://endpoint.example"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm md:col-span-2"
              />
              <input
                name="notes"
                placeholder="Notes (optional)"
                className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm md:col-span-2"
              />
              <button
                type="submit"
                disabled={!canMutate || isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-3 py-2 text-sm font-semibold text-background transition hover:bg-accentStrong disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="size-4" />
                Add integration
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {editingSetting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-4xl rounded-[26px] border border-line/60 bg-white p-5 shadow-[0_24px_48px_rgba(8,27,29,0.2)] md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Edit integration</p>
                <h3 className="text-xl font-semibold text-foreground">{editingSetting.integrationLabel}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingIntegrationId(null)}
                className="rounded-full border border-line/70 p-2 text-muted transition hover:bg-background"
                aria-label="Close edit integration modal"
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
              <input type="hidden" name="integrationId" value={editingSetting.id} />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input
                  required
                  name="integrationLabel"
                  defaultValue={editingSetting.integrationLabel}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                />
                <input
                  required
                  name="vendorName"
                  defaultValue={editingSetting.vendorName}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                />
                <select
                  name="status"
                  defaultValue={editingSetting.status}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                >
                  {integrationStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input
                  name="baseUrl"
                  type="url"
                  defaultValue={editingSetting.baseUrl ?? ""}
                  placeholder="https://endpoint.example"
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                />
                <input
                  name="notes"
                  defaultValue={editingSetting.notes ?? ""}
                  placeholder="Notes"
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm md:col-span-2 xl:col-span-3"
                />
              </div>

              <div className="flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void handleDelete(editingSetting.id);
                  }}
                  disabled={!canMutate || isSaving}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="size-4" />
                  Delete integration
                </button>
                <button
                  type="submit"
                  disabled={!canMutate || isSaving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-3 py-2 text-sm font-semibold text-background transition hover:bg-accentStrong disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="size-4" />
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function normalizeNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length ? trimmed : null;
}

function normalizeNullableUrl(value: FormDataEntryValue | null) {
  const normalized = normalizeNullableString(value);

  if (!normalized) {
    return null;
  }

  return normalized;
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function statusBadgeClassNames(status: IntegrationSetting["status"]) {
  if (status === "Connected") {
    return "rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700";
  }

  if (status === "Sandbox") {
    return "rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700";
  }

  if (status === "Pending") {
    return "rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700";
  }

  return "rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700";
}
