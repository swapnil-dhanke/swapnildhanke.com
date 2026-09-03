"use client";

import { useState, type FormEvent } from "react";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";
import { site } from "@/content/site";

const SOCIAL_LINKS = [
  { href: site.social.github, label: "GitHub", Icon: IconBrandGithub },
  { href: site.social.linkedin, label: "LinkedIn", Icon: IconBrandLinkedin },
  { href: site.social.twitter, label: "X", Icon: IconBrandX },
] as const;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = `Message from ${name || "your site"}`;
    const body = `${message}\n\n— ${name}${email ? ` (${email})` : ""}`;
    const mailto = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#05050f] px-6 py-32 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Get in touch</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Send a message or find me on the links below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="nav-glass flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/8 p-6"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-medium text-zinc-400">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/25"
              placeholder="Ada Lovelace"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-zinc-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/25"
              placeholder="ada@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-xs font-medium text-zinc-400">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/25"
              placeholder="Say hello..."
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-full border border-white/10 bg-white/10 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Send message
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-3">
          <a
            href={`mailto:${site.email}`}
            aria-label="Email"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white transition-colors hover:bg-white/15"
          >
            <IconMail className="h-5 w-5" stroke={2} />
          </a>
          {SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white transition-colors hover:bg-white/15"
            >
              <Icon className="h-5 w-5" stroke={2} />
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
