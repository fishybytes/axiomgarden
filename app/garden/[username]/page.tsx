import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import GardenGrid from "@/components/GardenGrid";
import type { Plant, Checkin } from "@/types";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return {
    title: `${username}'s garden — Axiom Garden`,
    description: `${username} has been growing algorithmic plants on Axiom Garden.`,
  };
}

export default async function PublicGardenPage({ params }: Props) {
  const { username } = await params;

  const user = db
    .select({ id: schema.users.id, username: schema.users.username })
    .from(schema.users)
    .where(eq(schema.users.username, username.toLowerCase()))
    .get();

  if (!user) notFound();

  const plants = db
    .select()
    .from(schema.plants)
    .where(eq(schema.plants.userId, user.id))
    .orderBy(asc(schema.plants.position))
    .all() as Plant[];

  const checkins = db
    .select({ date: schema.checkins.date })
    .from(schema.checkins)
    .where(eq(schema.checkins.userId, user.id))
    .orderBy(asc(schema.checkins.date))
    .all() as Pick<Checkin, "date">[];

  const checkinDates = checkins.map((c) => c.date);

  return (
    <main className="min-h-dvh px-4 py-6">
      <header className="mb-6">
        <h1 className="text-lg font-semibold text-green-200">{user.username}&apos;s garden</h1>
        <p className="text-xs text-green-600">
          {plants.length} plant{plants.length !== 1 ? "s" : ""}
          {" · "}
          {checkinDates.length} day{checkinDates.length !== 1 ? "s" : ""} grown
        </p>
      </header>

      <GardenGrid plants={plants} checkinDates={checkinDates} />
    </main>
  );
}
