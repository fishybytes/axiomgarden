"use client";

import PlantCanvas from "./PlantCanvas";
import type { Plant } from "@/types";

interface Props {
  plant: Plant;
  ageDays: number;
}

function formatAge(days: number): string {
  if (days === 0) return "Seedling";
  if (days === 1) return "1 day old";
  if (days < 7) return `${days} days old`;
  if (days < 14) return `${Math.floor(days / 7)} week${days >= 14 ? "s" : ""} old`;
  return `${Math.floor(days / 7)} weeks old`;
}

export default function PlantCard({ plant, ageDays }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-green-900/40 bg-green-950/30 p-4 backdrop-blur-sm">
      <PlantCanvas plant={plant} ageDays={ageDays} width={140} height={180} />
      <div className="text-center">
        <p className="text-sm font-medium text-green-200">{plant.name}</p>
        <p className="text-xs text-green-500">{formatAge(ageDays)}</p>
      </div>
    </div>
  );
}
