type AccessBannerProps = {
  mode: "demo" | "supabase";
  viewerName?: string | null;
  viewerEmail?: string | null;
  membershipSummary?: string;
};

export function AccessBanner({
  mode,
}: AccessBannerProps) {
  if (mode === "demo") {
    return (
      <div className="mx-auto mb-4 flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-6 text-sm md:px-8">
        <div className="rounded-full border border-amber/20 bg-amber/10 px-4 py-2 text-amber">
          Demo mode: configure Supabase credentials to enable auth, live data,
          and hospital-scoped access control.
        </div>
      </div>
    );
  }

  return null;
}
