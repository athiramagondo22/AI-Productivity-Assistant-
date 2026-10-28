import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { ChoiceGroup, Field, ToolWorkspace, useToolGeneration } from "@/components/tool-workspace";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      { name: "description", content: "Summarise topics or articles and get insights and recommendations." },
      { property: "og:title", content: "AI Research Assistant — Workplace AI" },
      { property: "og:description", content: "Summarise topics or articles and get insights and recommendations." },
    ],
  }),
  component: ResearchPage,
});

const DEPTHS = ["Quick overview", "In-depth analysis"] as const;

function ResearchPage() {
  const gen = useToolGeneration("research");
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<(typeof DEPTHS)[number]>("Quick overview");
  const [audience, setAudience] = useState("");

  return (
    <ToolWorkspace
      icon={Search}
      title="AI Research Assistant"
      description="Enter a topic or paste an article to get a summary, insights and recommendations."
      gen={gen}
      submitLabel="Research"
      emptyHint="Your research brief will appear here."
      filename="research-brief"
      canSubmit={topic.trim().length > 0}
      onSubmit={() => gen.generate({ topic, depth, audience })}
      form={
        <>
          <Field label="Topic or article text *">
            <Textarea value={topic} onChange={(e) => setTopic(e.target.value.slice(0, 30000))} rows={10} placeholder="e.g. Benefits of a four-day work week for software teams — or paste an article" />
          </Field>
          <Field label="Depth">
            <ChoiceGroup options={DEPTHS} value={depth} onChange={setDepth} />
          </Field>
          <Field label="Audience">
            <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Executive team" />
          </Field>
        </>
      }
    />
  );
}
