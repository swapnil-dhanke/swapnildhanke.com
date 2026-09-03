import { ConstellationField } from "@/components/ConstellationField";
import { site } from "@/content/site";

export default function Home() {
  return (
    <>
      <ConstellationField />
      <main className="relative z-10 flex min-h-screen w-full flex-col items-start justify-center">
        <div className="pointer-events-none mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 text-white">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{site.name}</h1>
          <p className="text-lg text-zinc-300 sm:text-xl">{site.tagline}</p>
        </div>
      </main>
    </>
  );
}
