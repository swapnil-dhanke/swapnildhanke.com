"use client";

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

  return (
    <div className="fixed top-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {/* key={activeItem.href} remounts the span on every route change, so
          the CSS fade-in (.nav-label, defined in globals.css) replays as a
          fast-snap crossfade — always ends visible, no React state needed. */}
      <span key={activeItem.href} className="nav-label text-sm font-medium text-white">
        {activeItem.label}
      </span>
      <nav className="relative" style={{ width: BAR_WIDTH, height: BAR_HEIGHT }}>
        <div
          className="nav-glass absolute inset-0 bg-white/12 backdrop-blur-[4px]"
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
              className="absolute flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ left, top }}
            >
              <Icon className={`h-5 w-5 ${isActive ? "nav-icon-glow" : ""}`} stroke={2} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
