import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";

import { ChoiceGroup, Field, ToolWorkspace, useToolGeneration } from "@/components/tool-workspace";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI" },
      { name: "description", content: "Generate professional emails in formal, friendly or persuasive tones." },
      { property: "og:title", content: "Smart Email Generator — Workplace AI" },
      { property: "og:description", content: "Generate professional emails in formal, friendly or persuasive tones." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;
const LENGTHS = ["Short", "Medium", "Detailed"] as const;

function EmailPage() {
  const gen = useToolGeneration("email");
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("Medium");

  return (
    <ToolWorkspace
      icon={Mail}
      title="Smart Email Generator"
      description="Describe what you need and get a ready-to-send email."
      gen={gen}
      submitLabel="Generate email"
      emptyHint="Your email draft will appear here."
      filename="email"
      canSubmit={purpose.trim().length > 0}
      onSubmit={() => gen.generate({ recipient, purpose, keyPoints, tone, length })}
      form={
        <>
          <Field label="Recipient">
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Sarah, Head of Marketing" />
          </Field>
          <Field label="Purpose *">
            <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={3} placeholder="e.g. Request a project deadline extension" />
          </Field>
          <Field label="Key points" hint="One per line">
            <Textarea value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} rows={4} placeholder={"Vendor delay\nNew date: 15 Nov"} />
          </Field>
          <Field label="Tone">
            <ChoiceGroup options={TONES} value={tone} onChange={setTone} />
          </Field>
          <Field label="Length">
            <ChoiceGroup options={LENGTHS} value={length} onChange={setLength} />
          </Field>
        </>
      }
    />
  );
}
