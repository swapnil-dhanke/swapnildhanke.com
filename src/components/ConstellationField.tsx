"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loadTwinkleUpdater } from "@tsparticles/updater-twinkle";
import type { ISourceOptions } from "@tsparticles/engine";
import { constellations } from "@/lib/constellations";

const AMBIENT_STAR_COUNT = 175;

export function ConstellationField() {
  const [engineReady, setEngineReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const lineOpacityRef = useRef(0);
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

    const draw = () => {
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);

      const lineOpacity = lineOpacityRef.current;

      for (const constellation of constellations) {
        const points = constellation.stars.map((star) => ({
          x: star.x * width,
          y: star.y * height,
        }));

        if (lineOpacity > 0) {
          ctx.strokeStyle = `rgba(168, 133, 247, ${lineOpacity})`;
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
