"use server";

import { v4 as uuidv4 } from "uuid";
import { eq, and, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { generateGenome } from "@/lib/plant-gen";
import { getToday } from "@/lib/dev-time";
import { revalidatePath } from "next/cache";

export async function checkin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const today = await getToday();

  const existing = db
    .select({ plantId: schema.checkins.plantId })
    .from(schema.checkins)
    .where(and(eq(schema.checkins.userId, userId), eq(schema.checkins.date, today)))
    .get();

  if (existing) return;

  const [{ plantCount }] = db
    .select({ plantCount: count() })
    .from(schema.plants)
    .where(eq(schema.plants.userId, userId))
    .all();

  const plantId = uuidv4();
  const genome = generateGenome(plantId);

  db.insert(schema.plants).values({
    id: plantId,
    userId,
    name: genome.name,
    templateIndex: genome.templateIndex,
    angleVariation: genome.angleVariation,
    color: genome.color,
    position: plantCount,
  }).run();

  db.insert(schema.checkins).values({
    id: uuidv4(),
    userId,
    date: today,
    plantId,
  }).run();

  revalidatePath("/dashboard");
}
