import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Check, Copy, Download, Eye, Pencil, RotateCcw, Square, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Disclaimer } from "@/components/disclaimer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { LucideIcon } from "lucide-react";

type ToolId = "email" | "meeting" | "planner" | "research";

export function useToolGeneration(tool: ToolId) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/generate",
        prepareSendMessagesRequest: ({ body }) => ({ body: { tool, ...(body ?? {}) } }),
      }),
    [tool],
  );
  const { messages, sendMessage, setMessages, status, stop, error } = useChat({
    id: `tool-${tool}`,
    transport,
    onError: (e) => toast.error(e.message || "Generation failed"),
  });
  const last = [...messages].reverse().find((m) => m.role === "assistant");
  const text = last?.parts.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "";
  const busy = status === "submitted" || status === "streaming";

  const generate = (fields: Record<string, string>) => {
    setMessages([]);
    void sendMessage({ text: "generate" }, { body: { fields } });
  };
  return { text, busy, status, stop, error, generate };
}

export function ToolWorkspace({
  icon: Icon,
  title,
  description,
  form,
  onSubmit,
  canSubmit,
  gen,
  submitLabel,
  emptyHint,
  filename,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  form: ReactNode;
  onSubmit: () => void;
  canSubmit: boolean;
  gen: ReturnType<typeof useToolGeneration>;
  submitLabel: string;
  emptyHint: string;
  filename: string;
}) {
  const handle = (e: FormEvent) => {
    e.preventDefault();
    if (canSubmit && !gen.busy) onSubmit();
  };
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <header className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Icon className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <form onSubmit={handle} className="surface flex flex-col gap-5 p-5 md:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          {form}
          <div className="flex gap-2 pt-1">
            {gen.busy ? (
              <Button type="button" variant="outline" className="flex-1" onClick={() => gen.stop()}>
                <Square /> Stop
              </Button>
            ) : (
              <Button type="submit" className="flex-1" size="lg" disabled={!canSubmit}>
                <Wand2 /> {submitLabel}
              </Button>
            )}
          </div>
        </form>

        <OutputPanel gen={gen} emptyHint={emptyHint} filename={filename} onRegenerate={onSubmit} canRegenerate={canSubmit} />
      </div>

      <Disclaimer />
    </div>
  );
}

function OutputPanel({
  gen,
  emptyHint,
  filename,
  onRegenerate,
  canRegenerate,
}: {
  gen: ReturnType<typeof useToolGeneration>;
  emptyHint: string;
  filename: string;
  onRegenerate: () => void;
  canRegenerate: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraft(gen.text);
  }, [gen.text]);
  useEffect(() => {
    if (gen.busy) setMode("preview");
  }, [gen.busy]);

  const copy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([draft], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="surface flex min-h-[28rem] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
        <div className="flex items-center gap-1">
          <div className="mr-1 flex rounded-lg bg-muted p-0.5">
            <Button size="sm" variant={mode === "preview" ? "secondary" : "ghost"} className="h-7" onClick={() => setMode("preview")}>
              <Eye /> Preview
            </Button>
            <Button size="sm" variant={mode === "edit" ? "secondary" : "ghost"} className="h-7" disabled={!draft || gen.busy} onClick={() => setMode("edit")}>
              <Pencil /> Edit
            </Button>
          </div>
          <Button size="icon" variant="ghost" className="size-8" aria-label="Copy" disabled={!draft} onClick={copy}>
            {copied ? <Check /> : <Copy />}
          </Button>
          <Button size="icon" variant="ghost" className="size-8" aria-label="Download" disabled={!draft || gen.busy} onClick={download}>
            <Download />
          </Button>
          <Button size="icon" variant="ghost" className="size-8" aria-label="Regenerate" disabled={!draft || gen.busy || !canRegenerate} onClick={onRegenerate}>
            <RotateCcw />
          </Button>
        </div>
      </div>
      <div className="flex-1 p-5">
        {mode === "edit" ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-full min-h-[24rem] resize-y font-mono text-sm"
            aria-label="Edit output"
          />
        ) : draft ? (
          <MessageResponse className="text-sm">{draft}</MessageResponse>
        ) : gen.status === "submitted" ? (
          <Shimmer>Thinking...</Shimmer>
        ) : gen.error ? (
          <p className="text-sm text-destructive">{gen.error.message}</p>
        ) : (
          <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">{emptyHint}</div>
        )}
      </div>
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function ChoiceGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Button key={o} type="button" size="sm" variant={o === value ? "default" : "outline"} onClick={() => onChange(o)}>
          {o}
        </Button>
      ))}
    </div>
  );
}
