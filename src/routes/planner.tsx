import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { useState } from "react";

import { ChoiceGroup, Field, ToolWorkspace, useToolGeneration } from "@/components/tool-workspace";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workplace AI" },
      { name: "description", content: "Prioritise your tasks and generate daily or weekly schedules with AI." },
      { property: "og:title", content: "AI Task Planner — Workplace AI" },
      { property: "og:description", content: "Prioritise your tasks and generate daily or weekly schedules with AI." },
    ],
  }),
  component: PlannerPage,
});

const PERIODS = ["Daily", "Weekly"] as const;

function PlannerPage() {
  const gen = useToolGeneration("planner");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Daily");
  const [hours, setHours] = useState("09:00 - 17:00");
  const [tasks, setTasks] = useState("");
  const [constraints, setConstraints] = useState("");

  return (
    <ToolWorkspace
      icon={CalendarClock}
      title="AI Task Planner"
      description="List your tasks and get a prioritised, time-blocked schedule."
      gen={gen}
      submitLabel="Build schedule"
      emptyHint="Your prioritised schedule will appear here."
      filename="schedule"
      canSubmit={tasks.trim().length > 0}
      onSubmit={() => gen.generate({ period, hours, tasks, constraints })}
      form={
        <>
          <Field label="Schedule type">
            <ChoiceGroup options={PERIODS} value={period} onChange={setPeriod} />
          </Field>
          <Field label="Working hours">
            <Input value={hours} onChange={(e) => setHours(e.target.value)} />
          </Field>
          <Field label="Tasks *" hint="One per line. Add deadlines or time estimates if you have them.">
            <Textarea value={tasks} onChange={(e) => setTasks(e.target.value)} rows={8} placeholder={"Finish client proposal (due Fri, ~3h)\nReview team PRs\nPrepare board slides"} />
          </Field>
          <Field label="Fixed commitments / constraints">
            <Textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={3} placeholder="e.g. Standup 09:30, lunch 12:30-13:15" />
          </Field>
        </>
      }
    />
  );
}
