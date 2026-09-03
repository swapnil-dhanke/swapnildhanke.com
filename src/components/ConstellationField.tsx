"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loadTwinkleUpdater } from "@tsparticles/updater-twinkle";
import type { ISourceOptions } from "@tsparticles/engine";
import { constellations, type Constellation } from "@/lib/constellations";

const AMBIENT_STAR_COUNT = 175;
const HOVER_RADIUS = 120;
const REVEAL_OPACITY = 0.9;
const LINE_WIDTH = 1;
// Each edge's own fade is fast/snappy...
const EDGE_FADE_MS = 140;
// ...but each successive BFS ring starts this many ms after the previous one,
// so the reveal visibly ripples outward from the star nearest the cursor.
const RING_STAGGER_MS = 70;

// Guaranteed floor, checked every frame — not just replaced 1-for-1 on despawn.
const MIN_ACTIVE_CONSTELLATIONS = 7;
// Ambient self-reveal "flash", independent of hover: a single coordinated
// sweep crosses the canvas left-to-right every 10-15s, taking 2-3s, and each
// active constellation flashes at the moment the sweep reaches its x-position
// — so the light visibly travels left-to-right across the screen, in order.
const SWEEP_MIN_INTERVAL_MS = 10000;
const SWEEP_MAX_INTERVAL_MS = 15000;
const SWEEP_DURATION_MIN_MS = 2000;
const SWEEP_DURATION_MAX_MS = 3000;
const FLASH_HOLD_MIN_MS = 300;
const FLASH_HOLD_MAX_MS = 500;
// Faster than EDGE_FADE_MS so it reads as a sudden flash, not a gradual reveal.
const FLASH_FADE_MS = 90;
// Very slow drift, in pixels/second — should read as ambient, not obviously moving.
const DRIFT_SPEED_MIN = 3;
const DRIFT_SPEED_MAX = 7;
// How far a spawned instance's velocity angle can deviate from "straight into the screen".
const EDGE_ANGLE_JITTER = Math.PI / 4;
// How many px of a freshly spawned shape peek into the viewport immediately,
// so it isn't instantly re-flagged as fully offscreen before it can drift in.
const SPAWN_MARGIN = 6;
// How many candidate positions/edges to try before giving up on a spawn this
// frame (it'll just retry on the next frame instead of overlapping).
const MAX_SPAWN_ATTEMPTS = 15;

interface EdgeFade {
  current: number;
  target: number;
  fromValue: number;
  // When this edge's own tween is allowed to begin (absolute rAF timestamp).
  scheduledStart: number;
  // When the tween actually started; null until `now >= scheduledStart`.
  tweenStart: number | null;
  // How long this particular tween takes — hover-cascade and the ambient
  // flash use different speeds, set by whichever mechanism scheduled it.
  durationMs: number;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface ConstellationInstance {
  poolIndex: number;
  centerX: number;
  centerY: number;
  vx: number;
  vy: number;
  edgeFades: EdgeFade[];
  wasHovered: boolean;
  // BFS distances from the last reveal's origin star, reused when reversing
  // the cascade so it unwinds back through the same origin.
  lastDist: number[] | null;
  // Ambient self-reveal flash, triggered by the global left-to-right sweep.
  flashHolding: boolean;
  flashHoldUntil: number;
  // Which sweep pass last triggered this instance — a fresh spawn is seeded
  // with the sweep id active at spawn time, so a shape that appears mid-sweep
  // just waits for the next cycle instead of retroactively triggering.
  lastSweepId: number;
}

interface SweepState {
  active: boolean;
  startTime: number;
  durationMs: number;
  nextSweepTime: number;
  sweepId: number;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createEdgeFade(): EdgeFade {
  return {
    current: 0,
    target: 0,
    fromValue: 0,
    scheduledStart: 0,
    tweenStart: null,
    durationMs: EDGE_FADE_MS,
  };
}

function getBounds(constellation: Constellation): Bounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const star of constellation.stars) {
    minX = Math.min(minX, star.x);
    maxX = Math.max(maxX, star.x);
    minY = Math.min(minY, star.y);
    maxY = Math.max(maxY, star.y);
  }

  return { minX, maxX, minY, maxY };
}

const CONSTELLATION_BOUNDS: Bounds[] = constellations.map(getBounds);

function getWorldBounds(instance: ConstellationInstance): Bounds {
  const bounds = CONSTELLATION_BOUNDS[instance.poolIndex];
  return {
    minX: instance.centerX + bounds.minX,
    maxX: instance.centerX + bounds.maxX,
    minY: instance.centerY + bounds.minY,
    maxY: instance.centerY + bounds.maxY,
  };
}

function boundsOverlap(a: Bounds, b: Bounds): boolean {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

function buildAdjacency(constellation: Constellation): number[][] {
  const adjacency: number[][] = constellation.stars.map(() => []);
  for (const [a, b] of constellation.edges) {
    adjacency[a].push(b);
    adjacency[b].push(a);
  }
  return adjacency;
}

const CONSTELLATION_ADJACENCY: number[][][] = constellations.map(buildAdjacency);

function bfsDistances(adjacency: number[][], origin: number): number[] {
  const dist = new Array(adjacency.length).fill(Infinity);
  dist[origin] = 0;
  const queue = [origin];

  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    for (const neighbor of adjacency[current]) {
      if (dist[neighbor] === Infinity) {
        dist[neighbor] = dist[current] + 1;
        queue.push(neighbor);
      }
    }
  }

  return dist;
}

function nearestStarIndex(points: { x: number; y: number }[], mouse: { x: number; y: number }): number {
  let bestIndex = 0;
  let bestDist = Infinity;

  points.forEach((point, index) => {
    const dx = point.x - mouse.x;
    const dy = point.y - mouse.y;
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function leftmostStarIndex(constellation: Constellation): number {
  let bestIndex = 0;
  let bestX = Infinity;

  constellation.stars.forEach((star, index) => {
    if (star.x < bestX) {
      bestX = star.x;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function computeEdgeRings(edges: [number, number][], dist: number[]): number[] {
  return edges.map(([a, b]) => {
    const ring = Math.min(dist[a], dist[b]);
    return Number.isFinite(ring) ? ring : 0;
  });
}

// The ambient flash always cascades outward from each shape's leftmost star
// (fixed per shape, unlike hover's cursor-dependent origin) — precomputed once.
const CONSTELLATION_FLASH_DIST: number[][] = constellations.map((constellation, i) =>
  bfsDistances(CONSTELLATION_ADJACENCY[i], leftmostStarIndex(constellation)),
);

// Constraint (a): never pick a pool entry that's already active elsewhere on screen.
function pickPoolIndexAvoidingActive(active: ConstellationInstance[]): number {
  const activeSet = new Set(active.map((instance) => instance.poolIndex));
  const available: number[] = [];
  for (let i = 0; i < constellations.length; i++) {
    if (!activeSet.has(i)) available.push(i);
  }
  if (available.length === 0) {
    // Pool exhausted (shouldn't happen with 20+ entries vs. a handful active).
    return Math.floor(Math.random() * constellations.length);
  }
  return available[Math.floor(Math.random() * available.length)];
}

function createInstance(
  poolIndex: number,
  centerX: number,
  centerY: number,
  vx: number,
  vy: number,
  currentSweepId: number,
): ConstellationInstance {
  return {
    poolIndex,
    centerX,
    centerY,
    vx,
    vy,
    edgeFades: constellations[poolIndex].edges.map(() => createEdgeFade()),
    wasHovered: false,
    lastDist: null,
    flashHolding: false,
    flashHoldUntil: 0,
    // Marks it "caught up" to whatever sweep is current/most recent, so it
    // only participates starting from the next new sweep.
    lastSweepId: currentSweepId,
  };
}

// Constraint (b): never spawn into a bounding box that overlaps an
// already-active constellation's current bounding box. Tries several
// candidate positions; returns null if none of them are clear (caller
// retries on a later frame rather than spawning into an overlap).
function trySpawnRandomInView(
  width: number,
  height: number,
  active: ConstellationInstance[],
  currentSweepId: number,
): ConstellationInstance | null {
  const poolIndex = pickPoolIndexAvoidingActive(active);
  const bounds = CONSTELLATION_BOUNDS[poolIndex];

  const minCenterX = -bounds.minX;
  const maxCenterX = width - bounds.maxX;
  const minCenterY = -bounds.minY;
  const maxCenterY = height - bounds.maxY;
  const lowX = Math.min(minCenterX, maxCenterX);
  const highX = Math.max(minCenterX, maxCenterX);
  const lowY = Math.min(minCenterY, maxCenterY);
  const highY = Math.max(minCenterY, maxCenterY);

  for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt++) {
    const centerX = randomRange(lowX, highX);
    const centerY = randomRange(lowY, highY);
    const candidate: Bounds = {
      minX: centerX + bounds.minX,
      maxX: centerX + bounds.maxX,
      minY: centerY + bounds.minY,
      maxY: centerY + bounds.maxY,
    };

    if (!active.some((instance) => boundsOverlap(candidate, getWorldBounds(instance)))) {
      const angle = randomRange(0, Math.PI * 2);
      const speed = randomRange(DRIFT_SPEED_MIN, DRIFT_SPEED_MAX);
      return createInstance(poolIndex, centerX, centerY, Math.cos(angle) * speed, Math.sin(angle) * speed, currentSweepId);
    }
  }

  return null;
}

function trySpawnFromEdge(
  width: number,
  height: number,
  active: ConstellationInstance[],
  currentSweepId: number,
): ConstellationInstance | null {
  const poolIndex = pickPoolIndexAvoidingActive(active);
  const bounds = CONSTELLATION_BOUNDS[poolIndex];

  for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt++) {
    const edge = Math.floor(Math.random() * 4);
    let centerX: number;
    let centerY: number;
    let baseAngle: number;

    // Position so a small sliver (SPAWN_MARGIN px) of the shape already
    // overlaps the viewport — spawning fully outside would immediately
    // satisfy isFullyOffscreen() on the very next frame, before the
    // instance ever gets a chance to drift into view.
    switch (edge) {
      case 0: // left, heading right
        centerX = SPAWN_MARGIN - bounds.maxX;
        centerY = randomRange(0, height);
        baseAngle = 0;
        break;
      case 1: // right, heading left
        centerX = width - SPAWN_MARGIN - bounds.minX;
        centerY = randomRange(0, height);
        baseAngle = Math.PI;
        break;
      case 2: // top, heading down
        centerX = randomRange(0, width);
        centerY = SPAWN_MARGIN - bounds.maxY;
        baseAngle = Math.PI / 2;
        break;
      default: // bottom, heading up
        centerX = randomRange(0, width);
        centerY = height - SPAWN_MARGIN - bounds.minY;
        baseAngle = -Math.PI / 2;
        break;
    }

    const candidate: Bounds = {
      minX: centerX + bounds.minX,
      maxX: centerX + bounds.maxX,
      minY: centerY + bounds.minY,
      maxY: centerY + bounds.maxY,
    };

    if (!active.some((instance) => boundsOverlap(candidate, getWorldBounds(instance)))) {
      const angle = baseAngle + randomRange(-EDGE_ANGLE_JITTER, EDGE_ANGLE_JITTER);
      const speed = randomRange(DRIFT_SPEED_MIN, DRIFT_SPEED_MAX);
      return createInstance(poolIndex, centerX, centerY, Math.cos(angle) * speed, Math.sin(angle) * speed, currentSweepId);
    }
  }

  return null;
}

function isFullyOffscreen(instance: ConstellationInstance, width: number, height: number): boolean {
  const bounds = CONSTELLATION_BOUNDS[instance.poolIndex];
  return (
    instance.centerX + bounds.maxX < 0 ||
    instance.centerX + bounds.minX > width ||
    instance.centerY + bounds.maxY < 0 ||
    instance.centerY + bounds.minY > height
  );
}

export function ConstellationField() {
  const [engineReady, setEngineReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const activeRef = useRef<ConstellationInstance[]>([]);
  const sweepRef = useRef<SweepState>({
    active: false,
    startTime: 0,
    durationMs: 0,
    nextSweepTime: 0,
    sweepId: 0,
  });
  const lastFrameTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      await loadTwinkleUpdater(engine);
    }).then(() => {
      if (!cancelled) setEngineReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const particlesOptions = useMemo<ISourceOptions>(
    () =>
      ({
        fullScreen: { enable: false },
        background: { color: { value: "transparent" } },
        detectRetina: true,
        fpsLimit: 60,
        particles: {
          number: {
            value: AMBIENT_STAR_COUNT,
            density: { enable: false },
          },
          color: { value: "#ffffff" },
          opacity: {
            value: { min: 0.15, max: 0.7 },
            animation: {
              enable: true,
              sync: false,
              mode: "auto",
              startValue: "random",
              speed: 0.5,
            },
          },
          size: {
            value: { min: 0.5, max: 1.4 },
          },
          links: { enable: false },
          move: {
            enable: true,
            speed: 0.05,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "out" },
          },
          // Provided by @tsparticles/updater-twinkle; not part of the core
          // ISourceOptions typings, so it's injected via this cast.
          twinkle: {
            particles: {
              enable: true,
              frequency: 0.03,
              opacity: 1,
            },
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any as ISourceOptions,
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sizeRef.current = { width, height };
    };

    resize();
    window.addEventListener("resize", resize);

    if (sweepRef.current.nextSweepTime === 0) {
      sweepRef.current.nextSweepTime =
        performance.now() + randomRange(SWEEP_MIN_INTERVAL_MS, SWEEP_MAX_INTERVAL_MS);
    }

    if (activeRef.current.length === 0) {
      const { width, height } = sizeRef.current;
      const initial: ConstellationInstance[] = [];
      for (let n = 0; n < MIN_ACTIVE_CONSTELLATIONS; n++) {
        const spawned = trySpawnRandomInView(width, height, initial, sweepRef.current.sweepId);
        if (spawned) initial.push(spawned);
      }
      activeRef.current = initial;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget) mouseRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    const draw = (now: number) => {
      const { width, height } = sizeRef.current;
      const mouse = mouseRef.current;
      const dt = lastFrameTimeRef.current === null ? 0 : (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;

      ctx.clearRect(0, 0, width, height);

      const active = activeRef.current;

      // Global left-to-right sweep: starts a new pass every 10-15s, taking
      // 2-3s to cross the full width. sweepX is null when no sweep is active.
      const sweep = sweepRef.current;
      let sweepX: number | null = null;

      if (!sweep.active && now >= sweep.nextSweepTime) {
        sweep.active = true;
        sweep.startTime = now;
        sweep.durationMs = randomRange(SWEEP_DURATION_MIN_MS, SWEEP_DURATION_MAX_MS);
        sweep.sweepId += 1;
      }

      if (sweep.active) {
        const progress = (now - sweep.startTime) / sweep.durationMs;
        if (progress >= 1) {
          sweep.active = false;
          sweep.nextSweepTime = now + randomRange(SWEEP_MIN_INTERVAL_MS, SWEEP_MAX_INTERVAL_MS);
        } else {
          sweepX = progress * width;
        }
      }

      for (let i = active.length - 1; i >= 0; i--) {
        const instance = active[i];
        instance.centerX += instance.vx * dt;
        instance.centerY += instance.vy * dt;

        if (isFullyOffscreen(instance, width, height)) {
          active.splice(i, 1);
          continue;
        }

        const constellation = constellations[instance.poolIndex];
        const points = constellation.stars.map((star) => ({
          x: instance.centerX + star.x,
          y: instance.centerY + star.y,
        }));

        const isHovered =
          mouse !== null &&
          points.some((point) => {
            const dx = point.x - mouse.x;
            const dy = point.y - mouse.y;
            return dx * dx + dy * dy <= HOVER_RADIUS * HOVER_RADIUS;
          });

        // Ambient self-reveal flash: triggered by the global sweep reaching
        // this instance's x-position (once per sweep pass), independent of
        // hover. Cascades outward from the shape's leftmost star — same
        // ring-stagger mechanism as hover, just fixed origin and a faster
        // per-edge fade. Uses the same edge-fade fields as hover so they
        // never fight — if hover already has the lines revealed (or still
        // wants them revealed), the flash's own transitions are a no-op.
        if (
          !instance.flashHolding &&
          sweepX !== null &&
          instance.lastSweepId !== sweep.sweepId &&
          instance.centerX <= sweepX
        ) {
          instance.lastSweepId = sweep.sweepId;
          instance.flashHolding = true;
          instance.flashHoldUntil = now + randomRange(FLASH_HOLD_MIN_MS, FLASH_HOLD_MAX_MS);

          if (!isHovered) {
            const flashDist = CONSTELLATION_FLASH_DIST[instance.poolIndex];
            const edgeRings = computeEdgeRings(constellation.edges, flashDist);

            instance.edgeFades.forEach((fade, index) => {
              fade.target = REVEAL_OPACITY;
              fade.scheduledStart = now + edgeRings[index] * RING_STAGGER_MS;
              fade.tweenStart = null;
              fade.durationMs = FLASH_FADE_MS;
            });
          }
        } else if (instance.flashHolding && now >= instance.flashHoldUntil) {
          instance.flashHolding = false;

          if (!isHovered) {
            const flashDist = CONSTELLATION_FLASH_DIST[instance.poolIndex];
            const edgeRings = computeEdgeRings(constellation.edges, flashDist);
            const maxRing = edgeRings.length > 0 ? Math.max(...edgeRings) : 0;

            instance.edgeFades.forEach((fade, index) => {
              fade.target = 0;
              fade.scheduledStart = now + (maxRing - edgeRings[index]) * RING_STAGGER_MS;
              fade.tweenStart = null;
              fade.durationMs = FLASH_FADE_MS;
            });
          }
        }

        // On a hover-state transition, (re)schedule every edge's fade with a
        // BFS-ring-based delay so the reveal ripples outward from the star
        // nearest the cursor (or unwinds back into it on fade-out). Skip the
        // fade-OUT specifically if the ambient flash is still holding this
        // constellation revealed — it'll fade out once the flash lets go.
        if (isHovered !== instance.wasHovered) {
          const skipBecauseFlashHolding = !isHovered && instance.flashHolding;

          if (!skipBecauseFlashHolding) {
            let dist = instance.lastDist;

            if (isHovered || dist === null) {
              const origin = mouse !== null ? nearestStarIndex(points, mouse) : 0;
              dist = bfsDistances(CONSTELLATION_ADJACENCY[instance.poolIndex], origin);
              instance.lastDist = dist;
            }

            const edgeRings = computeEdgeRings(constellation.edges, dist!);
            const maxRing = edgeRings.length > 0 ? Math.max(...edgeRings) : 0;
            const target = isHovered ? REVEAL_OPACITY : 0;

            instance.edgeFades.forEach((fade, index) => {
              const ring = edgeRings[index];
              const delay = (isHovered ? ring : maxRing - ring) * RING_STAGGER_MS;
              fade.scheduledStart = now + delay;
              fade.tweenStart = null;
              fade.target = target;
              fade.durationMs = EDGE_FADE_MS;
            });
          }

          instance.wasHovered = isHovered;
        }

        if (instance.edgeFades.length > 0) {
          ctx.lineWidth = LINE_WIDTH;

          constellation.edges.forEach(([a, b], index) => {
            const fade = instance.edgeFades[index];

            if (now >= fade.scheduledStart) {
              if (fade.tweenStart === null) {
                fade.tweenStart = now;
                fade.fromValue = fade.current;
              }
              const progress = Math.min((now - fade.tweenStart) / fade.durationMs, 1);
              fade.current = fade.fromValue + (fade.target - fade.fromValue) * easeInOutCubic(progress);
            }

            if (fade.current > 0.001) {
              const pointA = points[a];
              const pointB = points[b];
              if (!pointA || !pointB) return;

              ctx.strokeStyle = `rgba(168, 133, 247, ${fade.current})`;
              ctx.beginPath();
              ctx.moveTo(pointA.x, pointA.y);
              ctx.lineTo(pointB.x, pointB.y);
              ctx.stroke();
            }
          });
        }

        for (const point of points) {
          ctx.beginPath();
          ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
          ctx.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.arc(point.x, point.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Continuous floor check — not just a 1-for-1 despawn replacement.
      // If a spawn attempt can't find a non-overlapping spot, stop for this
      // frame; it'll simply retry on the next one.
      while (active.length < MIN_ACTIVE_CONSTELLATIONS) {
        const spawned = trySpawnFromEdge(width, height, active, sweep.sweepId);
        if (!spawned) break;
        active.push(spawned);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#05050f]">
      {engineReady && (
        <Particles id="constellation-ambient" className="absolute inset-0" options={particlesOptions} />
      )}
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
    </div>
  );
}
