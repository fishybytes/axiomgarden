// Deterministic plant generation from "The Algorithmic Beauty of Plants"
// Each plant template corresponds to a figure from the book.
// A seeded PRNG selects and parameterises a template so the same plant
// always renders identically from its ID.

import type { LSystem } from "./lsystem";

interface PlantTemplate {
  name: string;
  lsystem: LSystem;
  maxDepth: number; // depth at full maturity
}

// Classic bracketed OL-systems from Chapter 1, Figures 1.24 a–f
const TEMPLATES: PlantTemplate[] = [
  {
    name: "Field Grass",
    lsystem: { axiom: "F", rules: { F: "F[+F]F[-F]F" }, angle: 25.7 },
    maxDepth: 5,
  },
  {
    name: "Meadow Sprig",
    lsystem: { axiom: "F", rules: { F: "F[+F]F[-F][F]" }, angle: 20 },
    maxDepth: 5,
  },
  {
    name: "River Reed",
    lsystem: { axiom: "F", rules: { F: "FF-[-F+F+F]+[+F-F-F]" }, angle: 22.5 },
    maxDepth: 4,
  },
  {
    name: "Climbing Vine",
    lsystem: { axiom: "X", rules: { X: "F[+X]F[-X]+X", F: "FF" }, angle: 20 },
    maxDepth: 7,
  },
  {
    name: "Willow Branch",
    lsystem: { axiom: "X", rules: { X: "F[+X][-X]FX", F: "FF" }, angle: 25.7 },
    maxDepth: 7,
  },
  {
    name: "Spiral Fern",
    lsystem: { axiom: "X", rules: { X: "F-[[X]+X]+F[+FX]-X", F: "FF" }, angle: 22.5 },
    maxDepth: 5,
  },
  // Additional variants with slight angle mutations for visual variety
  {
    name: "Windswept Sapling",
    lsystem: { axiom: "X", rules: { X: "F+[[X]-X]-F[-FX]+X", F: "FF" }, angle: 25 },
    maxDepth: 5,
  },
  {
    name: "Bushy Shrub",
    lsystem: { axiom: "F", rules: { F: "F[+F][-F]F[+F][-F]F" }, angle: 30 },
    maxDepth: 4,
  },
];

const COLORS = [
  "#4ade80", // green-400
  "#86efac", // green-300
  "#bbf7d0", // green-200
  "#34d399", // emerald-400
  "#6ee7b7", // emerald-300
  "#a7f3d0", // emerald-200
  "#5eead4", // teal-300
  "#99f6e4", // teal-200
  "#67e8f9", // cyan-300
];

// Mulberry32 — fast seedable PRNG
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert a UUID string to a 32-bit integer seed
function uuidToSeed(id: string): number {
  const hex = id.replace(/-/g, "").slice(0, 8);
  return parseInt(hex, 16) || 1;
}

export interface PlantGenome {
  templateIndex: number;
  angleVariation: number; // ±degrees added to base angle
  color: string;
  name: string;
}

export function generateGenome(plantId: string): PlantGenome {
  const rand = mulberry32(uuidToSeed(plantId));
  const templateIndex = Math.floor(rand() * TEMPLATES.length);
  const angleVariation = (rand() - 0.5) * 8; // ±4 degrees
  const color = COLORS[Math.floor(rand() * COLORS.length)];
  return { templateIndex, angleVariation, color, name: TEMPLATES[templateIndex].name };
}

export function getLSystem(genome: PlantGenome): LSystem {
  const template = TEMPLATES[genome.templateIndex];
  return {
    ...template.lsystem,
    angle: template.lsystem.angle + genome.angleVariation,
  };
}

// Age → derivation depth. Plants reach full maturity at 14 check-ins.
export function depthForAge(genome: PlantGenome, ageDays: number): number {
  const max = TEMPLATES[genome.templateIndex].maxDepth;
  // Logarithmic growth: reaches max depth at ~14 days
  const depth = Math.floor(Math.log2(ageDays + 1) * (max / Math.log2(15)));
  return Math.min(depth, max);
}
