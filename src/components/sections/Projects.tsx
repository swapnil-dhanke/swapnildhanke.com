import { projects } from "@/content/site";

export function Projects() {
  if (projects.length === 0) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
        <p className="text-zinc-500">Coming soon.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
      <ul className="flex flex-col gap-6">
        {projects.map((project) => (
          <li key={project.title} className="flex flex-col gap-1">
            <a
              href={project.href}
              className="font-medium underline-offset-4 hover:underline"
            >
              {project.title}
            </a>
            <p className="text-zinc-600 dark:text-zinc-400">{project.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
