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
      { x: -51, y: -65 },
      { x: 44, y: -72 },
      { x: 7, y: -12 },
      { x: -12, y: 0 },
      { x: -26, y: 12 },
      { x: -41, y: 75 },
      { x: 32, y: 65 },
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
      { x: -80, y: -58 },
      { x: -84, y: 7 },
      { x: -22, y: 17 },
      { x: -12, y: -43 },
      { x: 29, y: -65 },
      { x: 73, y: -84 },
      { x: 102, y: -101 },
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
      { x: -72, y: 15 },
      { x: -36, y: -65 },
      { x: 0, y: 22 },
      { x: 36, y: -70 },
      { x: 73, y: 7 },
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
      { x: 0, y: -65 },
      { x: 0, y: 0 },
      { x: 0, y: 65 },
      { x: -55, y: -10 },
      { x: 58, y: 15 },
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
      { x: 0, y: -51 },
      { x: -32, y: -7 },
      { x: -23, y: 36 },
      { x: 26, y: 44 },
      { x: 35, y: -4 },
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
      { x: 65, y: -72 },
      { x: 22, y: -43 },
      { x: -12, y: -14 },
      { x: -61, y: 15 },
      { x: -70, y: 61 },
      { x: -26, y: 73 },
      { x: -3, y: 7 },
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
      { x: -72, y: -65 },
      { x: -41, y: -36 },
      { x: -7, y: 0 },
      { x: 26, y: 36 },
      { x: 46, y: 73 },
      { x: 26, y: 104 },
      { x: -3, y: 94 },
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
      { x: -65, y: -43 },
      { x: -80, y: 0 },
      { x: -65, y: 36 },
      { x: -7, y: 15 },
      { x: 51, y: -22 },
      { x: 94, y: -58 },
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
      { x: -22, y: -65 },
      { x: 26, y: -72 },
      { x: -29, y: 7 },
      { x: 32, y: 0 },
      { x: -36, y: 65 },
      { x: 41, y: 73 },
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
      { x: 0, y: -61 },
      { x: 0, y: 4 },
      { x: 0, y: 70 },
      { x: -58, y: -3 },
      { x: 61, y: 12 },
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
      { x: -65, y: -22 },
      { x: -22, y: -61 },
      { x: 15, y: -12 },
      { x: 51, y: -32 },
      { x: 70, y: 22 },
      { x: 7, y: 51 },
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
      { x: -70, y: 7 },
      { x: -22, y: -17 },
      { x: 17, y: 4 },
      { x: 51, y: -22 },
      { x: 70, y: 15 },
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
      { x: -65, y: -58 },
      { x: 65, y: -65 },
      { x: 73, y: 61 },
      { x: -70, y: 70 },
      { x: -80, y: -12 },
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
      { x: 0, y: -72 },
      { x: -43, y: -36 },
      { x: -72, y: 7 },
      { x: -29, y: 15 },
      { x: 29, y: 15 },
      { x: 58, y: -29 },
      { x: 0, y: 51 },
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
      { x: 0, y: -43 },
      { x: -41, y: 36 },
      { x: 41, y: 29 },
      { x: 0, y: 12 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 0],
      [0, 3],
    ],
  },
  {
    name: "Draco",
    stars: [
      { x: -20, y: -60 },
      { x: 20, y: -65 },
      { x: 30, y: -30 },
      { x: -10, y: -20 },
      { x: 10, y: 20 },
      { x: -15, y: 70 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
      [4, 5],
    ],
  },
  {
    name: "Hercules",
    stars: [
      { x: -50, y: -40 },
      { x: 45, y: -45 },
      { x: 55, y: 35 },
      { x: -45, y: 40 },
      { x: -90, y: -70 },
      { x: 90, y: -80 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 4],
      [1, 5],
    ],
  },
  {
    name: "Corona Borealis",
    stars: [
      { x: -60, y: 10 },
      { x: -35, y: -30 },
      { x: -5, y: -45 },
      { x: 25, y: -40 },
      { x: 50, y: -15 },
      { x: 60, y: 20 },
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
    name: "Auriga",
    stars: [
      { x: 0, y: -70 },
      { x: 55, y: -20 },
      { x: 35, y: 55 },
      { x: -35, y: 55 },
      { x: -55, y: -20 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  },
  {
    name: "Taurus",
    stars: [
      { x: 0, y: 0 },
      { x: -45, y: -55 },
      { x: 45, y: -60 },
      { x: -15, y: 30 },
      { x: 15, y: 35 },
    ],
    edges: [
      [1, 0],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  },
  {
    name: "Canis Major",
    stars: [
      { x: 0, y: -60 },
      { x: -30, y: -10 },
      { x: 30, y: -5 },
      { x: -15, y: 40 },
      { x: 20, y: 50 },
      { x: 0, y: 90 },
    ],
    edges: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 5],
    ],
  },
  {
    name: "Bootes",
    stars: [
      { x: 0, y: -80 },
      { x: -40, y: -20 },
      { x: 40, y: -25 },
      { x: 0, y: 30 },
      { x: -20, y: 80 },
      { x: 20, y: 85 },
    ],
    edges: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [3, 4],
      [3, 5],
    ],
  },
  {
    name: "Cepheus",
    stars: [
      { x: -45, y: 20 },
      { x: 45, y: 20 },
      { x: 45, y: -30 },
      { x: 0, y: -70 },
      { x: -45, y: -30 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  },
];
