"use client";

import { useEffect, useRef } from "react";
import { derive, interpret, render } from "@/lib/lsystem";
import { generateGenome, getLSystem, depthForAge } from "@/lib/plant-gen";
import type { Plant } from "@/types";

interface Props {
  plant: Plant;
  ageDays: number;
  width?: number;
  height?: number;
  className?: string;
}

export default function PlantCanvas({
  plant,
  ageDays,
  width = 160,
  height = 200,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const genome = generateGenome(plant.id);
    const lsystem = getLSystem(genome);
    const depth = depthForAge(genome, ageDays);

    if (depth === 0) {
      // Seedling — just draw a small dot
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.arc(width / 2, height - 12, 3, 0, Math.PI * 2);
      ctx.fillStyle = plant.color;
      ctx.fill();
      return;
    }

    const sentence = derive(lsystem, depth);
    const commands = interpret(sentence, 6, lsystem.angle);
    render(ctx, commands, plant.color, width, height);
  }, [plant, ageDays, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
