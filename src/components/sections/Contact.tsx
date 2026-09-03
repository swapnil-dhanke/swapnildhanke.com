import { site } from "@/content/site";

export function Contact() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
      <a
        href={`mailto:${site.email}`}
        className="font-medium underline-offset-4 hover:underline"
      >
        {site.email}
      </a>
    </section>
  );
}
