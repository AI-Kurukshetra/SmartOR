import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 md:px-8">
      <div className="rounded-[32px] border border-line/70 bg-surface/90 p-8 shadow-panel">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-muted">
          SmartOR
        </p>
        <h1 className="mt-4 font-display text-5xl text-foreground">
          Command center not found
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          The requested hospital route is not available in this implementation
          pass. Return to the network overview and select another location.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:bg-accentStrong"
        >
          Return to overview
        </Link>
      </div>
    </main>
  );
}
