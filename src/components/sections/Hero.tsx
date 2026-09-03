import { site } from "@/content/site";
import { FluidBackground } from "@/components/ui/FluidBackground";

export function Hero() {
  return (
    <section className="relative flex h-screen w-full flex-col items-start justify-center overflow-hidden text-white">
      <FluidBackground />
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4 px-6">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          {site.name}
        </h1>
        <p className="text-lg text-zinc-300 sm:text-xl">{site.tagline}</p>
      </div>
    </section>
  );
}
