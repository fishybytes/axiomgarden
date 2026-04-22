// L-system engine based on "The Algorithmic Beauty of Plants"
// Prusinkiewicz & Lindenmayer, 1990

export interface LSystem {
  axiom: string;
  rules: Record<string, string>;
  angle: number; // degrees
}

export interface DrawCommand {
  type: "line" | "move";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number; // stack depth at time of draw — used for line width / opacity
}

interface TurtleState {
  x: number;
  y: number;
  angle: number; // radians, 0 = right, positive = counter-clockwise
  depth: number;
}

// Apply production rules n times to the axiom
export function derive(lsystem: LSystem, iterations: number): string {
  let sentence = lsystem.axiom;
  for (let i = 0; i < iterations; i++) {
    let next = "";
    for (const ch of sentence) {
      next += lsystem.rules[ch] ?? ch;
    }
    sentence = next;
    // Safety cap — prevents browser hang on deep derivations
    if (sentence.length > 80_000) break;
  }
  return sentence;
}

// Convert a derived sentence into draw commands using turtle graphics.
// Origin (0,0) is at the base of the plant; Y increases upward.
export function interpret(
  sentence: string,
  stepLength: number,
  lsystemAngle: number,
): DrawCommand[] {
  const commands: DrawCommand[] = [];
  const stack: TurtleState[] = [];

  // Start pointing straight up (−π/2 in standard canvas coords, but we flip Y)
  let state: TurtleState = { x: 0, y: 0, angle: Math.PI / 2, depth: 0 };
  const rad = (lsystemAngle * Math.PI) / 180;

  for (const ch of sentence) {
    switch (ch) {
      case "F": {
        const nx = state.x + stepLength * Math.cos(state.angle);
        const ny = state.y + stepLength * Math.sin(state.angle);
        commands.push({ type: "line", x1: state.x, y1: state.y, x2: nx, y2: ny, depth: state.depth });
        state = { ...state, x: nx, y: ny };
        break;
      }
      case "f": {
        const nx = state.x + stepLength * Math.cos(state.angle);
        const ny = state.y + stepLength * Math.sin(state.angle);
        commands.push({ type: "move", x1: state.x, y1: state.y, x2: nx, y2: ny, depth: state.depth });
        state = { ...state, x: nx, y: ny };
        break;
      }
      case "+":
        state = { ...state, angle: state.angle + rad };
        break;
      case "-":
        state = { ...state, angle: state.angle - rad };
        break;
      case "[":
        stack.push({ ...state });
        state = { ...state, depth: state.depth + 1 };
        break;
      case "]":
        state = stack.pop() ?? state;
        break;
      case "|":
        state = { ...state, angle: state.angle + Math.PI };
        break;
    }
    // All other symbols (X, Y, Z, A, B…) are variables — no drawing
  }

  return commands;
}

// Compute tight bounding box of all draw commands
export function bounds(commands: DrawCommand[]): {
  minX: number; minY: number; maxX: number; maxY: number;
} {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const cmd of commands) {
    minX = Math.min(minX, cmd.x1, cmd.x2);
    minY = Math.min(minY, cmd.y1, cmd.y2);
    maxX = Math.max(maxX, cmd.x1, cmd.x2);
    maxY = Math.max(maxY, cmd.y1, cmd.y2);
  }
  return { minX, minY, maxX, maxY };
}

// Render draw commands to a Canvas 2D context.
// Plants are auto-scaled and centered in the canvas with the base at the bottom.
export function render(
  ctx: CanvasRenderingContext2D,
  commands: DrawCommand[],
  color: string,
  width: number,
  height: number,
) {
  if (commands.length === 0) return;

  const { minX, minY, maxX, maxY } = bounds(commands);
  const plantW = maxX - minX || 1;
  const plantH = maxY - minY || 1;

  const padding = 16;
  const scale = Math.min(
    (width - padding * 2) / plantW,
    (height - padding * 2) / plantH,
  );

  // Center horizontally; anchor base to bottom with padding
  const offsetX = (width - plantW * scale) / 2 - minX * scale;
  const offsetY = height - padding + minY * scale;

  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const maxDepth = Math.max(...commands.map((c) => c.depth), 1);

  for (const cmd of commands) {
    if (cmd.type !== "line") continue;

    // Branches get thinner and slightly more transparent as stack depth increases
    const t = cmd.depth / maxDepth;
    ctx.lineWidth = Math.max(0.5, (1 - t * 0.7) * 2.5 * scale);
    ctx.globalAlpha = 1 - t * 0.3;
    ctx.strokeStyle = color;

    ctx.beginPath();
    // Flip Y axis so plant grows upward
    ctx.moveTo(cmd.x1 * scale + offsetX, offsetY - cmd.y1 * scale);
    ctx.lineTo(cmd.x2 * scale + offsetX, offsetY - cmd.y2 * scale);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}
