import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import logo from "@/assets/logo.png";
import { Disclaimer } from "@/components/disclaimer";
import { TOOLS } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      { name: "description", content: "Automate emails, meeting summaries, schedules and research with an AI workplace assistant." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Automate emails, meeting summaries, schedules and research with an AI workplace assistant." },
    ],
  }),
  component: Dashboard,
});

const STEPS = [
  { n: "01", t: "Pick a tool", d: "Choose the task you want to automate." },
  { n: "02", t: "Add your details", d: "Fill in a short, structured form." },
  { n: "03", t: "Review & edit", d: "Refine the AI output, then copy or download." },
];

function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8">
      <section className="relative overflow-hidden rounded-2xl bg-sidebar p-6 text-sidebar-foreground md:p-10">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium text-sidebar-primary">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold text-sidebar-accent-foreground md:text-4xl">
            Get through your workday faster with AI.
          </h1>
          <p className="mt-3 text-sidebar-foreground/75">
            Draft emails, summarise meetings, plan your week and research topics — all in one workspace.
          </p>
          <Link
            to="/chat"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sidebar-primary px-4 py-2.5 text-sm font-semibold text-sidebar-primary-foreground transition-opacity hover:opacity-90"
          >
            Ask the assistant <ArrowRight className="size-4" />
          </Link>
        </div>
        <img src={logo} alt="" width={240} height={240} className="pointer-events-none absolute -right-6 -bottom-10 hidden size-60 opacity-90 md:block" />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">AI tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((t) => (
            <Link key={t.url} to={t.url} className="surface group flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <div className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                <t.icon className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface grid gap-6 p-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n}>
            <div className="font-display text-2xl font-semibold text-highlight">{s.n}</div>
            <h3 className="mt-1 font-semibold">{s.t}</h3>
            <p className="text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </section>

      <Disclaimer />
    </div>
  );
}
