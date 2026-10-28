import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { MessageSquare, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createThread, deleteThread, getThreads, useThreads } from "@/lib/threads";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Workplace Chat — Workplace AI" },
      { name: "description", content: "Chat with your AI workplace assistant for quick help on any task." },
      { property: "og:title", content: "AI Workplace Chat — Workplace AI" },
      { property: "og:description", content: "Chat with your AI workplace assistant for quick help on any task." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const threads = useThreads();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };

  const newThread = () => {
    const t = createThread();
    void navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };
  const remove = (id: string) => {
    deleteThread(id);
    if (params.threadId === id) {
      const next = getThreads()[0] ?? createThread();
      void navigate({ to: "/chat/$threadId", params: { threadId: next.id } });
    }
  };

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
        <div className="p-3">
          <Button className="w-full" onClick={newThread}>
            <Plus /> New conversation
          </Button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center rounded-lg text-sm hover:bg-muted",
                params.threadId === t.id && "bg-accent text-accent-foreground",
              )}
            >
              <Link to="/chat/$threadId" params={{ threadId: t.id }} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2">
                <MessageSquare className="size-4 shrink-0 opacity-60" />
                <span className="truncate">{t.title}</span>
              </Link>
              <button
                type="button"
                aria-label="Delete conversation"
                onClick={() => remove(t.id)}
                className="mr-1 rounded p-1.5 opacity-0 hover:bg-background group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b p-2 md:hidden">
          <select
            className="h-9 min-w-0 flex-1 rounded-md border bg-card px-2 text-sm"
            value={params.threadId ?? ""}
            onChange={(e) => void navigate({ to: "/chat/$threadId", params: { threadId: e.target.value } })}
            aria-label="Select conversation"
          >
            {threads.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <Button size="icon" variant="outline" aria-label="New conversation" onClick={newThread}>
            <Plus />
          </Button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
