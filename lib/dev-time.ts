import { cookies } from "next/headers";

export async function getToday(): Promise<string> {
  const d = new Date();
  if (process.env.APP_ENV !== "prod") {
    const store = await cookies();
    const offset = parseInt(store.get("dev_day_offset")?.value ?? "0", 10);
    if (offset) d.setDate(d.getDate() + offset);
  }
  return d.toISOString().slice(0, 10);
}
