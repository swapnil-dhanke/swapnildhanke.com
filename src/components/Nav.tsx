"use client";

import { useState } from "react";
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

type NavItem = (typeof NAV_ITEMS)[number];

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
// The bottom edge bulges ARC_DEPTH px past BAR_HEIGHT at the midpoint (see
// buildArchPath) — the drawing surface (SVG viewport + clip-path reference
// box) must be at least this tall, or that bulge gets clipped flat by the
// box's own bottom edge instead of rendering.
const PATH_HEIGHT = BAR_HEIGHT + ARC_DEPTH;

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

  // Crossfade the label on route change: keep the previous item mounted
  // (fading out) alongside the new one (fading in) until its own fade-out
  // finishes. Adjusting state directly during render — React's documented
  // pattern for reacting to a prop change using info from prior renders —
  // rather than in an effect, so there's no extra render pass or lint issue.
  const [current, setCurrent] = useState<NavItem>(activeItem);
  const [previous, setPrevious] = useState<NavItem | null>(null);

  if (activeItem.href !== current.href) {
    setPrevious(current);
    setCurrent(activeItem);
  }

  return (
    <div className="fixed top-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      <div className="relative h-5" style={{ width: BAR_WIDTH }}>
        {previous && (
          <span
            key={previous.href}
            onAnimationEnd={() => setPrevious(null)}
            className="nav-label-exit absolute inset-x-0 text-center text-sm font-medium text-white"
          >
            {previous.label}
          </span>
        )}
        <span
          key={current.href}
          className="nav-label-enter absolute inset-x-0 text-center text-sm font-medium text-white"
        >
          {current.label}
        </span>
      </div>
      <nav className="relative" style={{ width: BAR_WIDTH, height: PATH_HEIGHT }}>
        <div
          className="nav-glass absolute inset-0 bg-white/12 backdrop-blur-[4px]"
          style={{ clipPath: `path('${ARCH_PATH}')` }}
        />
        <svg
          className="pointer-events-none absolute inset-0"
          width={BAR_WIDTH}
          height={PATH_HEIGHT}
          aria-hidden
        >
          <path d={ARCH_PATH} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        </svg>
        {NAV_ITEMS.map(({ href, label, Icon }, index) => {
          const isActive = href === current.href;
          const { left, top } = ICON_POSITIONS[index];

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="absolute flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ left, top }}
            >
              <Icon className="h-5 w-5" stroke={2} />
              {/* Always-present glow twin, so opacity can transition smoothly
                  on route change — a CSS animation (the pulse) and a CSS
                  transition can't both drive `filter` at once, so the
                  continuous pulse lives here while a plain opacity
                  transition (not an animation) handles the on/off crossfade. */}
              <Icon
                aria-hidden
                stroke={2}
                className="nav-icon-glow-layer pointer-events-none absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2"
                style={{ opacity: isActive ? 1 : 0 }}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
