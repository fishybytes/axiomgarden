import { notFound } from "next/navigation";
import db from "@/lib/db";
import GardenGrid from "@/components/GardenGrid";
import type { Plant, Checkin, User } from "@/types";

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
    .prepare("SELECT id, username, created_at FROM users WHERE username = ?")
    .get(username.toLowerCase()) as Pick<User, "id" | "username" | "created_at"> | undefined;

  if (!user) notFound();

  const plants = db
    .prepare("SELECT * FROM plants WHERE user_id = ? ORDER BY position ASC")
    .all(user.id) as Plant[];

  const checkins = db
    .prepare("SELECT date FROM checkins WHERE user_id = ? ORDER BY date ASC")
    .all(user.id) as Pick<Checkin, "date">[];

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
