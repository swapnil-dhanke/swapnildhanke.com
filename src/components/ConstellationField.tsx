"use client";

import { useEffect, useRef } from "react";
import { constellations } from "@/lib/constellations";

const AMBIENT_STAR_COUNT = 175;
const BACKGROUND_COLOR = "#05050f";

interface AmbientStar {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  phase: number;
  speed: number;
}

function createAmbientStars(count: number): AmbientStar[] {
  const stars: AmbientStar[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      radius: 0.5 + Math.random() * 1,
      baseOpacity: 0.25 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
    });
  }
  return stars;
}

export function ConstellationField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ambientStarsRef = useRef<AmbientStar[]>([]);
  const sizeRef = useRef({ width: 0, height: 0 });
  const lineOpacityRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ambientStarsRef.current = createAmbientStars(AMBIENT_STAR_COUNT);

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

    const startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const { width, height } = sizeRef.current;

      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, width, height);

      for (const star of ambientStarsRef.current) {
        const twinkle = 0.5 + 0.5 * Math.sin(elapsed * star.speed + star.phase);
        const opacity = star.baseOpacity * (0.4 + 0.6 * twinkle);

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity.toFixed(3)})`;
        ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

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

  return <canvas ref={canvasRef} className="fixed inset-0" aria-hidden="true" />;
}
