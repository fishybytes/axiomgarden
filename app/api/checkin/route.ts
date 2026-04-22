import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { generateGenome } from "@/lib/plant-gen";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Idempotent — return existing check-in if already done today
  const existing = db
    .prepare("SELECT plant_id FROM checkins WHERE user_id = ? AND date = ?")
    .get(userId, today) as { plant_id: string } | undefined;

  if (existing) {
    const plant = db.prepare("SELECT * FROM plants WHERE id = ?").get(existing.plant_id);
    return NextResponse.json({ alreadyDone: true, plant });
  }

  // Determine next display position
  const { cnt } = db
    .prepare("SELECT COUNT(*) as cnt FROM plants WHERE user_id = ?")
    .get(userId) as { cnt: number };

  // Generate a new plant deterministically from its future ID
  const plantId = uuidv4();
  const genome = generateGenome(plantId);

  db.prepare(
    `INSERT INTO plants (id, user_id, name, template_index, angle_variation, color, position)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(plantId, userId, genome.name, genome.templateIndex, genome.angleVariation, genome.color, cnt);

  const checkinId = uuidv4();
  db.prepare(
    "INSERT INTO checkins (id, user_id, date, plant_id) VALUES (?, ?, ?, ?)",
  ).run(checkinId, userId, today, plantId);

  const plant = db.prepare("SELECT * FROM plants WHERE id = ?").get(plantId);
  return NextResponse.json({ alreadyDone: false, plant }, { status: 201 });
}
