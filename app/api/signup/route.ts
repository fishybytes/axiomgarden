import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import db from "@/lib/db";

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, numbers, _ and -"),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { username, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);
  const id = uuidv4();

  try {
    db.prepare(
      "INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)",
    ).run(id, username.toLowerCase(), email.toLowerCase(), passwordHash);
  } catch {
    return NextResponse.json({ error: "Username or email already taken" }, { status: 409 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
