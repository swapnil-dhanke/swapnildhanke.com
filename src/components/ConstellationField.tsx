"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loadTwinkleUpdater } from "@tsparticles/updater-twinkle";
import type { ISourceOptions } from "@tsparticles/engine";
import { constellations, type Constellation } from "@/lib/constellations";

const AMBIENT_STAR_COUNT = 175;
const HOVER_RADIUS = 120;
const REVEAL_OPACITY = 0.8;
const FADE_DURATION_MS = 350;

// Tune the ambient population here (kept within a 5-7 range per design).
const ACTIVE_CONSTELLATION_COUNT = 6;
// Very slow drift, in pixels/second — should read as ambient, not obviously moving.
const DRIFT_SPEED_MIN = 3;
const DRIFT_SPEED_MAX = 7;
// How far a spawned instance's velocity angle can deviate from "straight into the screen".
const EDGE_ANGLE_JITTER = Math.PI / 4;
// How many px of a freshly spawned shape peek into the viewport immediately,
// so it isn't instantly re-flagged as fully offscreen before it can drift in.
const SPAWN_MARGIN = 6;

interface ConstellationFade {
  current: number;
  target: number;
  fromValue: number;
  startTime: number;
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
  fade: ConstellationFade;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createFade(): ConstellationFade {
  return { current: 0, target: 0, fromValue: 0, startTime: 0 };
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

function pickPoolIndex(excludeIndex: number | null): number {
  if (constellations.length <= 1) return 0;
  let index = Math.floor(Math.random() * constellations.length);
  while (index === excludeIndex) {
    index = Math.floor(Math.random() * constellations.length);
  }
  return index;
}

function spawnRandomInView(width: number, height: number): ConstellationInstance {
  const poolIndex = pickPoolIndex(null);
  const bounds = CONSTELLATION_BOUNDS[poolIndex];

  const minCenterX = -bounds.minX;
  const maxCenterX = width - bounds.maxX;
  const minCenterY = -bounds.minY;
  const maxCenterY = height - bounds.maxY;

  const centerX = randomRange(Math.min(minCenterX, maxCenterX), Math.max(minCenterX, maxCenterX));
  const centerY = randomRange(Math.min(minCenterY, maxCenterY), Math.max(minCenterY, maxCenterY));

  const angle = randomRange(0, Math.PI * 2);
  const speed = randomRange(DRIFT_SPEED_MIN, DRIFT_SPEED_MAX);

  return {
    poolIndex,
    centerX,
    centerY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    fade: createFade(),
  };
}

function spawnFromEdge(excludeIndex: number, width: number, height: number): ConstellationInstance {
  const poolIndex = pickPoolIndex(excludeIndex);
  const bounds = CONSTELLATION_BOUNDS[poolIndex];

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

  const angle = baseAngle + randomRange(-EDGE_ANGLE_JITTER, EDGE_ANGLE_JITTER);
  const speed = randomRange(DRIFT_SPEED_MIN, DRIFT_SPEED_MAX);

  return {
    poolIndex,
    centerX,
    centerY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    fade: createFade(),
  };
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

    if (activeRef.current.length === 0) {
      const { width, height } = sizeRef.current;
      activeRef.current = Array.from({ length: ACTIVE_CONSTELLATION_COUNT }, () =>
        spawnRandomInView(width, height),
      );
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

      for (let i = active.length - 1; i >= 0; i--) {
        const instance = active[i];
        instance.centerX += instance.vx * dt;
        instance.centerY += instance.vy * dt;

        if (isFullyOffscreen(instance, width, height)) {
          active.splice(i, 1);
          active.push(spawnFromEdge(instance.poolIndex, width, height));
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

        const fade = instance.fade;
        const nextTarget = isHovered ? REVEAL_OPACITY : 0;
        if (fade.target !== nextTarget) {
          fade.fromValue = fade.current;
          fade.target = nextTarget;
          fade.startTime = now;
        }

        const progress = Math.min((now - fade.startTime) / FADE_DURATION_MS, 1);
        fade.current = fade.fromValue + (fade.target - fade.fromValue) * easeInOutCubic(progress);

        if (fade.current > 0.001) {
          ctx.strokeStyle = `rgba(168, 133, 247, ${fade.current})`;
          ctx.lineWidth = 1;
          for (const [a, b] of constellation.edges) {
            const pointA = points[a];
            const pointB = points[b];
            if (!pointA || !pointB) continue;

            ctx.beginPath();
            ctx.moveTo(pointA.x, pointA.y);
            ctx.lineTo(pointB.x, pointB.y);
            ctx.stroke();
          }
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
