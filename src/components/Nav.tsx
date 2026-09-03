"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Rocket } from "lucide-react";
import { CometIcon, UfoIcon } from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: Globe },
  { href: "/projects", label: "Projects", Icon: Rocket },
  { href: "/contact", label: "Contact", Icon: UfoIcon },
  { href: "/blogs", label: "Blogs", Icon: CometIcon },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
      <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-md">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href;

          return (
            <li key={href}>
              <Link href={href}>
                <motion.span
                  layout
                  className="relative flex items-center gap-2 rounded-full px-3 py-2 text-white"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-white/15"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className="relative z-10 h-5 w-5 shrink-0" />
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
