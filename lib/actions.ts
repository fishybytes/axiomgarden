"use server";

import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { generateGenome } from "@/lib/plant-gen";
import { revalidatePath } from "next/cache";

export async function checkin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const today = new Date().toISOString().slice(0, 10);

  const existing = db
    .prepare("SELECT plant_id FROM checkins WHERE user_id = ? AND date = ?")
    .get(userId, today);

  if (existing) return; // already done today

  const { cnt } = db
    .prepare("SELECT COUNT(*) as cnt FROM plants WHERE user_id = ?")
    .get(userId) as { cnt: number };

  const plantId = uuidv4();
  const genome = generateGenome(plantId);

  db.prepare(
    `INSERT INTO plants (id, user_id, name, template_index, angle_variation, color, position)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(plantId, userId, genome.name, genome.templateIndex, genome.angleVariation, genome.color, cnt);

  db.prepare(
    "INSERT INTO checkins (id, user_id, date, plant_id) VALUES (?, ?, ?, ?)",
  ).run(uuidv4(), userId, today, plantId);

  revalidatePath("/dashboard");
}
