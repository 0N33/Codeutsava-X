"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { primaryNavigation } from "@/data/site";

export function MobileNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="group relative lg:hidden"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-pink-400/60 bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-pink-100 transition-colors marker:content-none hover:bg-pink-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300">
        Menu
        <span
          aria-hidden="true"
          className="text-pink-300 transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <nav
        aria-label="Mobile navigation"
        className="absolute right-0 top-[calc(100%+0.75rem)] w-64 border border-white/15 bg-[#090611]/95 p-2 shadow-2xl backdrop-blur-xl"
      >
        <ul className="space-y-1">
          {primaryNavigation.map((item, index) => (
            <li key={item.href}>
              <Link
                aria-current={item.href === pathname ? "page" : undefined}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-sm px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className="font-mono text-[0.65rem] text-zinc-400"
                >
                  0{index + 1}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
