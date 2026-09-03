"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconComet, IconRocket, IconTelescope, IconUfo, IconWorld } from "@tabler/icons-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: IconWorld },
  { href: "/about", label: "About", Icon: IconTelescope },
  { href: "/projects", label: "Projects", Icon: IconRocket },
  { href: "/contact", label: "Contact", Icon: IconUfo },
  { href: "/blogs", label: "Blogs", Icon: IconComet },
] as const;

// Matches EDGE_FADE_MS in ConstellationField.tsx — the fast-snap duration
// used for the hover-reveal lines, so the label fade reads consistently.
const LABEL_FADE_MS = 140;

// Bar geometry — a shallow arch rather than a flat pill. The bar's outline
// and each icon's vertical offset are both derived from the same parabolic
// curve (see curveOffset/buildArchPath) so the icons visually sit ON the
// arch — dipping toward the center — rather than just inside a curved shell.
const ITEM_SIZE = 40;
const GAP = 8;
const H_PADDING = 14;
const V_PADDING = 10;
const ARC_DEPTH = 8;

const BAR_WIDTH = H_PADDING * 2 + NAV_ITEMS.length * ITEM_SIZE + (NAV_ITEMS.length - 1) * GAP;
const BAR_HEIGHT = ITEM_SIZE + V_PADDING * 2;
const CAP_RADIUS = BAR_HEIGHT / 2;

// How far below the bar's vertical center a point at horizontal position x
// sits, per the arch — 0 at the capped edges, ARC_DEPTH at the midpoint.
function curveOffset(x: number): number {
  const s = (x - BAR_WIDTH / 2) / (BAR_WIDTH / 2 - CAP_RADIUS);
  return ARC_DEPTH * (1 - s * s);
}

// A pill of constant thickness bent along the same parabola: top and bottom
// edges are the centerline curve shifted by ±CAP_RADIUS, closed with
// semicircular end caps. For a shallow arc this offset is visually
// indistinguishable from a true parallel curve while staying simple to
// compute (and to keep in exact sync with curveOffset above).
function buildArchPath(): string {
  const centerControlY = BAR_HEIGHT / 2 + 2 * ARC_DEPTH;
  const topControlY = centerControlY - CAP_RADIUS;
  const bottomControlY = centerControlY + CAP_RADIUS;
  const left = CAP_RADIUS;
  const right = BAR_WIDTH - CAP_RADIUS;
  const midX = BAR_WIDTH / 2;

  return [
    `M ${left} 0`,
    `Q ${midX} ${topControlY} ${right} 0`,
    `A ${CAP_RADIUS} ${CAP_RADIUS} 0 0 1 ${right} ${BAR_HEIGHT}`,
    `Q ${midX} ${bottomControlY} ${left} ${BAR_HEIGHT}`,
    `A ${CAP_RADIUS} ${CAP_RADIUS} 0 0 1 ${left} 0`,
    "Z",
  ].join(" ");
}

const ARCH_PATH = buildArchPath();

const ICON_POSITIONS = NAV_ITEMS.map((_, index) => {
  const centerX = H_PADDING + index * (ITEM_SIZE + GAP) + ITEM_SIZE / 2;
  const top = BAR_HEIGHT / 2 - ITEM_SIZE / 2 + curveOffset(centerX);
  return { left: centerX - ITEM_SIZE / 2, top };
});

export function Nav() {
  const pathname = usePathname();
  const activeItem = NAV_ITEMS.find((item) => item.href === pathname) ?? NAV_ITEMS[0];

  const barRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [labelX, setLabelX] = useState<number | null>(null);
  const [labelVisible, setLabelVisible] = useState(false);

  useLayoutEffect(() => {
    const bar = barRef.current;
    const activeEl = itemRefs.current[activeItem.href];
    if (!bar || !activeEl) return;

    const barRect = bar.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    setLabelX(itemRect.left + itemRect.width / 2 - barRect.left);

    setLabelVisible(false);
    const raf = requestAnimationFrame(() => setLabelVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [activeItem.href]);

  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
      <nav ref={barRef} className="relative" style={{ width: BAR_WIDTH, height: BAR_HEIGHT }}>
        <div
          className="nav-glass absolute inset-0 bg-white/8 backdrop-blur-md"
          style={{ clipPath: `path('${ARCH_PATH}')` }}
        />
        <svg
          className="pointer-events-none absolute inset-0"
          width={BAR_WIDTH}
          height={BAR_HEIGHT}
          aria-hidden
        >
          <path d={ARCH_PATH} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        </svg>
        {NAV_ITEMS.map(({ href, label, Icon }, index) => {
          const isActive = href === activeItem.href;
          const { left, top } = ICON_POSITIONS[index];

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              ref={(el) => {
                itemRefs.current[href] = el;
              }}
              className="absolute flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ left, top }}
            >
              <Icon className={`h-5 w-5 ${isActive ? "nav-icon-glow" : ""}`} stroke={2} />
            </Link>
          );
        })}
      </nav>
      <div className="relative mt-3 h-5" style={{ width: BAR_WIDTH }}>
        <span
          className="absolute top-0 text-sm font-medium whitespace-nowrap text-white transition-opacity ease-out"
          style={{
            left: labelX ?? 0,
            transform: "translateX(-50%)",
            opacity: labelVisible ? 1 : 0,
            transitionDuration: `${LABEL_FADE_MS}ms`,
          }}
        >
          {activeItem.label}
        </span>
      </div>
    </div>
  );
}
