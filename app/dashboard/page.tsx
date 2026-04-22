import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import GardenGrid from "@/components/GardenGrid";
import { checkin } from "@/lib/actions";
import type { Plant, Checkin } from "@/types";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const username = session.user.name!;

  const plants = db
    .select()
    .from(schema.plants)
    .where(eq(schema.plants.userId, userId))
    .orderBy(asc(schema.plants.position))
    .all() as Plant[];

  const checkins = db
    .select({ date: schema.checkins.date })
    .from(schema.checkins)
    .where(eq(schema.checkins.userId, userId))
    .orderBy(asc(schema.checkins.date))
    .all() as Pick<Checkin, "date">[];

  const checkinDates = checkins.map((c) => c.date);
  const today = new Date().toISOString().slice(0, 10);
  const checkedInToday = checkinDates.includes(today);

  return (
    <main className="min-h-dvh px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-green-200">{username}&apos;s garden</h1>
          <p className="text-xs text-green-600">
            {plants.length} plant{plants.length !== 1 ? "s" : ""}
            {" · "}
            {checkinDates.length} day{checkinDates.length !== 1 ? "s" : ""} grown
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/garden/${username}`} className="text-xs text-green-500 underline">
            Share
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="text-xs text-green-700 hover:text-green-500">Sign out</button>
          </form>
        </div>
      </header>

      {checkedInToday ? (
        <div className="mb-6 rounded-xl border border-green-900/40 bg-green-950/20 px-4 py-3 text-sm text-green-500">
          ✓ Checked in today. Come back tomorrow for a new plant.
        </div>
      ) : (
        <form action={checkin} className="mb-6">
          <button
            type="submit"
            className="w-full rounded-xl bg-green-700 px-6 py-4 text-sm font-semibold text-green-100 hover:bg-green-600 transition-colors"
          >
            🌱 Check in &amp; plant today&apos;s seed
          </button>
        </form>
      )}

      <GardenGrid plants={plants} checkinDates={checkinDates} />
    </main>
  );
}
