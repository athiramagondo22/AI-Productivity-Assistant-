import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { Shimmer } from "@/components/ai-elements/shimmer";
import { getOrCreateLatestThread } from "@/lib/threads";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = getOrCreateLatestThread();
    void navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
  }, [navigate]);
  return (
    <div className="grid flex-1 place-items-center">
      <Shimmer>Opening conversation...</Shimmer>
    </div>
  );
}
