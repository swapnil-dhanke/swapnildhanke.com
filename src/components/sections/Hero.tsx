import { site } from "@/content/site";

export function Hero() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-4xl font-semibold tracking-tight">{site.name}</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">{site.tagline}</p>
    </section>
  );
}
