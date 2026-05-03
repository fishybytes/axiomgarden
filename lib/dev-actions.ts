"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function advanceDay() {
  if (process.env.APP_ENV === "prod") return;
  const store = await cookies();
  const current = parseInt(store.get("dev_day_offset")?.value ?? "0", 10);
  store.set("dev_day_offset", String(current + 1), { path: "/" });
  revalidatePath("/dashboard");
}

export async function resetDays() {
  if (process.env.APP_ENV === "prod") return;
  const store = await cookies();
  store.delete("dev_day_offset");
  revalidatePath("/dashboard");
}
