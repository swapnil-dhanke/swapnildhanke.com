import { site } from "@/content/site";
import { FluidBackground } from "@/components/ui/FluidBackground";

export function Hero() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-start justify-center gap-4 overflow-hidden rounded-2xl px-6 py-24 text-white sm:px-12">
      <FluidBackground />
      <div className="pointer-events-none relative z-10 flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          {site.name}
        </h1>
        <p className="text-lg text-zinc-300 sm:text-xl">{site.tagline}</p>
      </div>
    </section>
  );
}
