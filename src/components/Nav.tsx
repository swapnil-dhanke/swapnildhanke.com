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
      <nav
        ref={barRef}
        className="nav-glass flex items-center gap-1 rounded-full border border-white/10 bg-white/8 p-2 backdrop-blur-md"
      >
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === activeItem.href;

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              ref={(el) => {
                itemRefs.current[href] = el;
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-white"
            >
              {isActive && <span className="nav-star-glow absolute inset-0 rounded-full" aria-hidden />}
              <Icon className="relative z-10 h-5 w-5" stroke={2} />
            </Link>
          );
        })}
      </nav>
      <div className="relative mt-3 h-5 w-full">
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
