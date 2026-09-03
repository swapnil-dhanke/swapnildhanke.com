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
      { x: 0.1, y: 0.58 },
      { x: 0.22, y: 0.55 },
      { x: 0.19, y: 0.68 },
      { x: 0.16, y: 0.7 },
      { x: 0.13, y: 0.72 },
      { x: 0.11, y: 0.88 },
      { x: 0.2, y: 0.85 },
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
      { x: 0.62, y: 0.12 },
      { x: 0.6, y: 0.2 },
      { x: 0.68, y: 0.22 },
      { x: 0.7, y: 0.14 },
      { x: 0.78, y: 0.11 },
      { x: 0.85, y: 0.07 },
      { x: 0.92, y: 0.04 },
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
      { x: 0.38, y: 0.08 },
      { x: 0.44, y: 0.03 },
      { x: 0.5, y: 0.09 },
      { x: 0.56, y: 0.02 },
      { x: 0.62, y: 0.07 },
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
      { x: 0.8, y: 0.35 },
      { x: 0.8, y: 0.48 },
      { x: 0.8, y: 0.65 },
      { x: 0.72, y: 0.46 },
      { x: 0.89, y: 0.5 },
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
      { x: 0.14, y: 0.15 },
      { x: 0.09, y: 0.22 },
      { x: 0.11, y: 0.3 },
      { x: 0.18, y: 0.32 },
      { x: 0.2, y: 0.23 },
    ],
    edges: [
      [0, 1],
      [0, 4],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
];
