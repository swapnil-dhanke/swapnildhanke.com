"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { IconComet, IconRocket, IconTelescope, IconUfo, IconWorld } from "@tabler/icons-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: IconWorld },
  { href: "/about", label: "About", Icon: IconTelescope },
  { href: "/projects", label: "Projects", Icon: IconRocket },
  { href: "/contact", label: "Contact", Icon: IconUfo },
  { href: "/blogs", label: "Blogs", Icon: IconComet },
] as const;

// Shared across renders instead of a fresh object literal each time — this
// only animates `transform`/`opacity` (layout/layoutId compile to those, not
// width/padding), so it's GPU-accelerated rather than triggering reflow.
const PILL_SPRING = { type: "spring", stiffness: 400, damping: 32 } as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
      <ul className="nav-glass flex items-center gap-1 rounded-full border border-white/10 bg-white/8 p-1.5 backdrop-blur-md">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href;

          return (
            <li key={href}>
              <Link href={href}>
                <motion.span
                  layout
                  className="relative flex items-center gap-2 rounded-full px-3 py-2 text-white"
                  transition={PILL_SPRING}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-white/15"
                      transition={PILL_SPRING}
                    />
                  )}
                  <Icon className="relative z-10 h-5 w-5 shrink-0" stroke={2} />
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="relative z-10 whitespace-nowrap text-sm font-medium"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
