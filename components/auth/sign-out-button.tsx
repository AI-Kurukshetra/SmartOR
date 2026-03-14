import { signOutAction } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-full border border-foreground/10 bg-white/75 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent/25 hover:bg-white"
      >
        Sign out
      </button>
    </form>
  );
}
