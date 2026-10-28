import { useChat } from "@ai-sdk/react";
import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import logo from "@/assets/logo.png";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { ensureThread, getThread, saveMessages } from "@/lib/threads";

export const Route = createFileRoute("/chat/$threadId")({
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="flex-1" />;
  return <ChatWindow key={threadId} threadId={threadId} />;
}

const SUGGESTIONS = [
  "How do I politely decline a meeting?",
  "Give me 5 tips to run a productive standup",
  "Help me prepare for a performance review",
  "Explain OKRs in simple terms",
];

function ChatWindow({ threadId }: { threadId: string }) {
  const initial = useMemo(() => {
    ensureThread(threadId);
    return getThread(threadId)?.messages ?? [];
  }, [threadId]);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: { threadId } }), [threadId]);
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initial,
    transport,
    onError: (e) => toast.error(e.message || "The assistant couldn't respond."),
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status !== "streaming" && messages.length > 0) saveMessages(threadId, messages);
  }, [messages, status, threadId]);

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    void sendMessage({ text });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <ConversationEmptyState
            >
              <img src={logo} alt="" width={56} height={56} className="size-14" />
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Your workplace assistant</h2>
                <p className="text-sm text-muted-foreground">Ask anything about emails, meetings, planning or research.</p>
              </div>
              <div className="mt-4 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <Button key={s} variant="outline" className="h-auto whitespace-normal py-2.5 text-left text-sm font-normal" onClick={() => send(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent>
                  {m.parts.map((p, i) =>
                    p.type === "text" ? (
                      m.role === "assistant" ? (
                        <MessageResponse key={i}>{p.text}</MessageResponse>
                      ) : (
                        <p key={i} className="whitespace-pre-wrap">{p.text}</p>
                      )
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer>Thinking...</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        <PromptInput onSubmit={(msg) => send(msg.text ?? "")}>
          <PromptInputTextarea ref={textareaRef} autoFocus placeholder="Message your workplace assistant…" />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          AI responses may be inaccurate. Verify important information and avoid sharing confidential data.
        </p>
      </div>
    </div>
  );
}
