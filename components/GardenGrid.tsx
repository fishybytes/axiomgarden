"use client";

import PlantCard from "./PlantCard";
import type { Plant } from "@/types";

interface Props {
  plants: Plant[];
  checkinDates: string[]; // YYYY-MM-DD strings in order
}

function plantAge(plant: Plant, checkinDates: string[]): number {
  // Age = number of check-ins since the plant was planted
  const plantedDate = new Date(plant.plantedAt * 1000).toISOString().slice(0, 10);
  const idx = checkinDates.indexOf(plantedDate);
  if (idx === -1) return 0;
  return checkinDates.length - idx - 1;
}

export default function GardenGrid({ plants, checkinDates }: Props) {
  if (plants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-4xl">🌱</p>
        <p className="text-green-400">Your garden is empty.</p>
        <p className="text-sm text-green-600">Check in to plant your first seed.</p>
      </div>
    );
  }

  const sorted = [...plants].sort((a, b) => a.position - b.position);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {sorted.map((plant) => (
        <PlantCard key={plant.id} plant={plant} ageDays={plantAge(plant, checkinDates)} />
      ))}
    </div>
  );
}
