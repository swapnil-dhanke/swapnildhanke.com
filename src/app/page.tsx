import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-16 px-6 py-24">
      <Hero />
      <Projects />
      <Contact />
    </main>
  );
}
