/**
 * Star coordinates are small pixel offsets from a constellation instance's
 * runtime-assigned center (0,0 = center), not canvas-normalized positions.
 * Each shape is a compact, self-contained cluster so it can be freely
 * positioned and drifted around the canvas by the renderer.
 */
export interface ConstellationStar {
  x: number;
  y: number;
}

export interface Constellation {
  name: string;
  stars: ConstellationStar[];
  edges: [number, number][];
}

export const constellations: Constellation[] = [
  {
    name: "Orion",
    stars: [
      { x: -35, y: -45 },
      { x: 30, y: -50 },
      { x: 5, y: -8 },
      { x: -8, y: 0 },
      { x: -18, y: 8 },
      { x: -28, y: 52 },
      { x: 22, y: 45 },
    ],
    edges: [
      [0, 2],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [2, 6],
    ],
  },
  {
    name: "Ursa Major",
    stars: [
      { x: -55, y: -40 },
      { x: -58, y: 5 },
      { x: -15, y: 12 },
      { x: -8, y: -30 },
      { x: 20, y: -45 },
      { x: 50, y: -58 },
      { x: 70, y: -70 },
    ],
    edges: [
      [0, 3],
      [3, 2],
      [2, 1],
      [1, 0],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  },
  {
    name: "Cassiopeia",
    stars: [
      { x: -50, y: 10 },
      { x: -25, y: -45 },
      { x: 0, y: 15 },
      { x: 25, y: -48 },
      { x: 50, y: 5 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    name: "Cygnus",
    stars: [
      { x: 0, y: -45 },
      { x: 0, y: 0 },
      { x: 0, y: 45 },
      { x: -38, y: -7 },
      { x: 40, y: 10 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ],
  },
  {
    name: "Lyra",
    stars: [
      { x: 0, y: -35 },
      { x: -22, y: -5 },
      { x: -16, y: 25 },
      { x: 18, y: 30 },
      { x: 24, y: -3 },
    ],
    edges: [
      [0, 1],
      [0, 4],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    name: "Ursa Minor",
    stars: [
      { x: 45, y: -50 },
      { x: 15, y: -30 },
      { x: -8, y: -10 },
      { x: -42, y: 10 },
      { x: -48, y: 42 },
      { x: -18, y: 50 },
      { x: -2, y: 5 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 2],
    ],
  },
  {
    name: "Scorpius",
    stars: [
      { x: -50, y: -45 },
      { x: -28, y: -25 },
      { x: -5, y: 0 },
      { x: 18, y: 25 },
      { x: 32, y: 50 },
      { x: 18, y: 72 },
      { x: -2, y: 65 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  },
  {
    name: "Leo",
    stars: [
      { x: -45, y: -30 },
      { x: -55, y: 0 },
      { x: -45, y: 25 },
      { x: -5, y: 10 },
      { x: 35, y: -15 },
      { x: 65, y: -40 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },
  {
    name: "Gemini",
    stars: [
      { x: -15, y: -45 },
      { x: 18, y: -50 },
      { x: -20, y: 5 },
      { x: 22, y: 0 },
      { x: -25, y: 45 },
      { x: 28, y: 50 },
    ],
    edges: [
      [0, 2],
      [2, 4],
      [1, 3],
      [3, 5],
      [2, 3],
    ],
  },
  {
    name: "Aquila",
    stars: [
      { x: 0, y: -42 },
      { x: 0, y: 3 },
      { x: 0, y: 48 },
      { x: -40, y: -2 },
      { x: 42, y: 8 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ],
  },
  {
    name: "Perseus",
    stars: [
      { x: -45, y: -15 },
      { x: -15, y: -42 },
      { x: 10, y: -8 },
      { x: 35, y: -22 },
      { x: 48, y: 15 },
      { x: 5, y: 35 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
    ],
  },
  {
    name: "Andromeda",
    stars: [
      { x: -48, y: 5 },
      { x: -15, y: -12 },
      { x: 12, y: 3 },
      { x: 35, y: -15 },
      { x: 48, y: 10 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    name: "Pegasus",
    stars: [
      { x: -45, y: -40 },
      { x: 45, y: -45 },
      { x: 50, y: 42 },
      { x: -48, y: 48 },
      { x: -55, y: -8 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 4],
    ],
  },
  {
    name: "Sagittarius",
    stars: [
      { x: 0, y: -50 },
      { x: -30, y: -25 },
      { x: -50, y: 5 },
      { x: -20, y: 10 },
      { x: 20, y: 10 },
      { x: 40, y: -20 },
      { x: 0, y: 35 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [3, 6],
      [4, 6],
    ],
  },
  {
    name: "Triangulum",
    stars: [
      { x: 0, y: -30 },
      { x: -28, y: 25 },
      { x: 28, y: 20 },
      { x: 0, y: 8 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 0],
      [0, 3],
    ],
  },
];
