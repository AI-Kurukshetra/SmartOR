import { SignOutButton } from "@/components/auth/sign-out-button";

type NoAccessStateProps = {
  viewerName?: string | null;
  viewerEmail?: string | null;
};

export function NoAccessState({
  viewerName,
  viewerEmail,
}: NoAccessStateProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 md:px-8">
      <div className="rounded-[32px] border border-line/70 bg-surface/90 p-8 shadow-panel">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-muted">
          SmartOR Access
        </p>
        <h1 className="mt-4 font-display text-5xl text-foreground">
          No hospital membership found
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          {viewerName ?? viewerEmail ?? "This account"} is authenticated, but it
          is not linked to any hospital workspace yet. Ask a hospital
          administrator to grant access, or complete onboarding with a seeded
          environment.
        </p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
