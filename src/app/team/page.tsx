import Link from "next/link";

import { TeamRoster } from "@/components/team/team-roster";
import { Container } from "@/components/ui/container";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Team",
  description:
    "Meet the CodeUtsava X organizing team as official member profiles are announced.",
  path: "/team",
});

export default function TeamPage() {
  return (
    <main id="main-content" className="flex-1">
      <section
        aria-labelledby="team-page-title"
        className="site-grid relative isolate overflow-hidden border-b border-white/10 py-20 sm:py-28"
      >
        <Container>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-pink-200">
            Organizing collective / CodeUtsava X
          </p>
          <h1
            aria-label="Meet the minds behind the build."
            id="team-page-title"
            className="glitch-title mt-6 max-w-4xl text-balance text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-7xl"
          >
            Meet the minds behind the build.
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
            This page is ready to introduce the people coordinating the tenth
            edition. Profiles will appear only after the roster is confirmed.
          </p>
          <Link
            href="/contact-us"
            className="mt-8 inline-flex text-sm font-semibold text-zinc-200 underline decoration-white/20 underline-offset-4 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            View official contact channels
          </Link>
        </Container>
      </section>

      <TeamRoster />
    </main>
  );
}
