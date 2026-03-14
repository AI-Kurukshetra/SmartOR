"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilLine, Plus, Save, Trash2, X } from "lucide-react";

import {
  createOverviewMetricAction,
  deleteOverviewMetricAction,
  updateOverviewMetricAction,
} from "@/app/actions/overview-metrics";
import { Panel } from "@/components/smartor/panel";
import type { OverviewMetric } from "@/lib/validations/smartor";

type OverviewMetricsCrudTableProps = {
  hospitalSlug: string;
  metrics: OverviewMetric[];
  canMutate: boolean;
};

const metricUnitOptions: OverviewMetric["unit"][] = ["count", "percent", "currency", "minutes"];
const metricTrendOptions: OverviewMetric["trend"][] = ["up", "down", "stable"];

export function OverviewMetricsCrudTable({
  hospitalSlug,
  metrics,
  canMutate,
}: OverviewMetricsCrudTableProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const sortedMetrics = useMemo(
    () => [...metrics].sort((left, right) => left.metricLabel.localeCompare(right.metricLabel)),
    [metrics],
  );
  const editingMetric = useMemo(
    () => sortedMetrics.find((metric) => metric.id === editingMetricId) ?? null,
    [editingMetricId, sortedMetrics],
  );

  async function handleCreate(formData: FormData) {
    if (!canMutate) {
      setMessage("You do not have permission to create overview metrics.");
      return;
    }

    const metricValue = Number(formData.get("metricValue"));
    const targetValueRaw = Number(formData.get("targetValue"));

    setIsSaving(true);
    setMessage(null);

    const result = await createOverviewMetricAction({
      hospitalSlug,
      metricKey: String(formData.get("metricKey") ?? ""),
      metricLabel: String(formData.get("metricLabel") ?? ""),
      metricValue: Number.isNaN(metricValue) ? 0 : metricValue,
      unit: String(formData.get("unit") ?? "count") as OverviewMetric["unit"],
      targetValue: Number.isNaN(targetValueRaw) ? null : targetValueRaw,
      trend: String(formData.get("trend") ?? "stable") as OverviewMetric["trend"],
      owner: String(formData.get("owner") ?? ""),
      note: normalizeNullableString(formData.get("note")),
    });

    setIsSaving(false);
    setMessage(result.ok ? "Overview metric created." : result.error ?? "Unable to create metric.");

    if (result.ok) {
      setIsCreateModalOpen(false);
      router.refresh();
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!canMutate) {
      setMessage("You do not have permission to update overview metrics.");
      return;
    }

    const metricValue = Number(formData.get("metricValue"));
    const targetValueRaw = Number(formData.get("targetValue"));

    setIsSaving(true);
    setMessage(null);

    const result = await updateOverviewMetricAction({
      hospitalSlug,
      metricId: String(formData.get("metricId") ?? ""),
      metricLabel: String(formData.get("metricLabel") ?? ""),
      metricValue: Number.isNaN(metricValue) ? 0 : metricValue,
      unit: String(formData.get("unit") ?? "count") as OverviewMetric["unit"],
      targetValue: Number.isNaN(targetValueRaw) ? null : targetValueRaw,
      trend: String(formData.get("trend") ?? "stable") as OverviewMetric["trend"],
      owner: String(formData.get("owner") ?? ""),
      note: normalizeNullableString(formData.get("note")),
    });

    setIsSaving(false);
    setMessage(result.ok ? "Overview metric updated." : result.error ?? "Unable to update metric.");

    if (result.ok) {
      setEditingMetricId(null);
      router.refresh();
    }
  }

  async function handleDelete(metricId: string) {
    if (!canMutate) {
      setMessage("You do not have permission to delete overview metrics.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const result = await deleteOverviewMetricAction({ hospitalSlug, metricId });

    setIsSaving(false);
    setMessage(result.ok ? "Overview metric deleted." : result.error ?? "Unable to delete metric.");

    if (result.ok) {
      setEditingMetricId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <Panel
        eyebrow="Overview metrics"
        title="Metrics data table (CRUD)"
        description="Manage the basic overview metrics dataset in table format. Updates are reflected on this overview page."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Rows: <span className="font-semibold text-foreground">{sortedMetrics.length}</span>
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
            Add metric
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-line/70 bg-white/85">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background/70 text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-3">Metric</th>
                <th className="px-3 py-3">Value</th>
                <th className="px-3 py-3">Unit</th>
                <th className="px-3 py-3">Target</th>
                <th className="px-3 py-3">Trend</th>
                <th className="px-3 py-3">Owner</th>
                <th className="px-3 py-3">Note</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedMetrics.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-sm text-muted">
                    No overview metrics yet. Create the first metric row.
                  </td>
                </tr>
              ) : (
                sortedMetrics.map((metric) => (
                  <tr key={metric.id} className="border-t border-line/60 align-top">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-foreground">{metric.metricLabel}</p>
                      <p className="text-xs text-muted">{metric.metricKey}</p>
                    </td>
                    <td className="px-3 py-3 text-foreground">{formatMetricValue(metric.metricValue, metric.unit)}</td>
                    <td className="px-3 py-3">{metric.unit}</td>
                    <td className="px-3 py-3">
                      {metric.targetValue === null
                        ? "-"
                        : formatMetricValue(metric.targetValue, metric.unit)}
                    </td>
                    <td className="px-3 py-3 uppercase">{metric.trend}</td>
                    <td className="px-3 py-3">{metric.owner}</td>
                    <td className="max-w-72 px-3 py-3 text-muted">{metric.note ?? "-"}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMessage(null);
                            setEditingMetricId(metric.id);
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
      </Panel>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-4xl rounded-[26px] border border-line/60 bg-white p-5 shadow-[0_24px_48px_rgba(8,27,29,0.2)] md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Create metric</p>
                <h3 className="text-xl font-semibold text-foreground">New overview metric</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full border border-line/70 p-2 text-muted transition hover:bg-background"
                aria-label="Close create metric modal"
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
              <input required name="metricKey" placeholder="metric_key" className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm" />
              <input required name="metricLabel" placeholder="Metric label" className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm" />
              <input required name="metricValue" type="number" step="0.01" placeholder="Value" className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm" />
              <select name="unit" defaultValue="count" className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm">
                {metricUnitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <input name="targetValue" type="number" step="0.01" placeholder="Target (optional)" className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm" />
              <select name="trend" defaultValue="stable" className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm">
                {metricTrendOptions.map((trend) => (
                  <option key={trend} value={trend}>
                    {trend}
                  </option>
                ))}
              </select>
              <input required name="owner" placeholder="Owner" className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm" />
              <input name="note" placeholder="Note (optional)" className="rounded-2xl border border-line/70 bg-white px-3 py-2 text-sm" />
              <button
                type="submit"
                disabled={!canMutate || isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-3 py-2 text-sm font-semibold text-background transition hover:bg-accentStrong disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="size-4" />
                Add metric
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {editingMetric ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-4xl rounded-[26px] border border-line/60 bg-white p-5 shadow-[0_24px_48px_rgba(8,27,29,0.2)] md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Edit metric</p>
                <h3 className="text-xl font-semibold text-foreground">{editingMetric.metricLabel}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMetricId(null)}
                className="rounded-full border border-line/70 p-2 text-muted transition hover:bg-background"
                aria-label="Close edit metric modal"
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
              <input type="hidden" name="metricId" value={editingMetric.id} />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input
                  required
                  name="metricLabel"
                  defaultValue={editingMetric.metricLabel}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                />
                <input
                  required
                  name="metricValue"
                  type="number"
                  step="0.01"
                  defaultValue={editingMetric.metricValue}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                />
                <select
                  name="unit"
                  defaultValue={editingMetric.unit}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                >
                  {metricUnitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <input
                  name="targetValue"
                  type="number"
                  step="0.01"
                  defaultValue={editingMetric.targetValue ?? ""}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                />
                <select
                  name="trend"
                  defaultValue={editingMetric.trend}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                >
                  {metricTrendOptions.map((trend) => (
                    <option key={trend} value={trend}>
                      {trend}
                    </option>
                  ))}
                </select>
                <input
                  required
                  name="owner"
                  defaultValue={editingMetric.owner}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm"
                />
                <input
                  name="note"
                  defaultValue={editingMetric.note ?? ""}
                  className="rounded-xl border border-line/70 bg-white px-3 py-2 text-sm md:col-span-2"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      void handleDelete(editingMetric.id);
                    });
                  }}
                  disabled={!canMutate || isSaving}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="size-4" />
                  Delete metric
                </button>
                <button
                  type="submit"
                  disabled={!canMutate || isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-foreground px-3 py-2 text-sm font-semibold text-background transition hover:bg-accentStrong disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="size-4" />
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-2xl border border-line/60 bg-white/75 px-3 py-2 text-sm text-muted">{message}</p>
      ) : null}
    </div>
  );
}

function formatMetricValue(value: number, unit: OverviewMetric["unit"]) {
  if (unit === "percent") {
    return `${value.toFixed(1)}%`;
  }

  if (unit === "currency") {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  if (unit === "minutes") {
    return `${value.toFixed(0)} min`;
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function normalizeNullableString(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}
