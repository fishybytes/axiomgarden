import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-green-200">
          Axiom Garden
        </h1>
        <p className="max-w-xs text-sm text-green-500">
          A living garden of algorithmic plants. Check in daily to grow your collection
          and share it with the world.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/signup"
          className="rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-500 transition-colors"
        >
          Start your garden
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-green-800 px-6 py-3 text-sm font-semibold text-green-300 hover:bg-green-950 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
