import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useState } from "react";

import { Field, ToolWorkspace, useToolGeneration } from "@/components/tool-workspace";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Workplace AI" },
      { name: "description", content: "Summarise meeting notes and extract action items, decisions and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer — Workplace AI" },
      { property: "og:description", content: "Summarise meeting notes and extract action items, decisions and deadlines." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const gen = useToolGeneration("meeting");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <ToolWorkspace
      icon={FileText}
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript. Get a summary, decisions, action items and deadlines."
      gen={gen}
      submitLabel="Summarise notes"
      emptyHint="Your structured summary will appear here."
      filename="meeting-summary"
      canSubmit={notes.trim().length > 0}
      onSubmit={() => gen.generate({ title, notes })}
      form={
        <>
          <Field label="Meeting title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q4 Planning Sync" />
          </Field>
          <Field label="Meeting notes *" hint={`${notes.length.toLocaleString()} / 30,000 characters`}>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 30000))} rows={14} placeholder="Paste your notes or transcript here…" />
          </Field>
        </>
      }
    />
  );
}
