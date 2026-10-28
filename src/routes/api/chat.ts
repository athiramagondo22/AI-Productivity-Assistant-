import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { CHAT_INSTRUCTIONS } = await import("@/lib/ai/prompts.server");
        const { streamWithGateway, friendlyAiError } = await import("@/lib/ai/gateway.server");

        const body = (await request.json().catch(() => null)) as {
          messages?: UIMessage[];
          threadId?: string;
        } | null;
        if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
          return Response.json({ error: "No messages provided." }, { status: 400 });
        }
        try {
          const messages = await convertToModelMessages(body.messages);
          const { result, wrap } = streamWithGateway(request, messages, CHAT_INSTRUCTIONS);
          return wrap(
            result.toUIMessageStreamResponse({
              originalMessages: body.messages,
              sendReasoning: true,
              onError: (e) => friendlyAiError(e),
            }),
          );
        } catch (e) {
          return Response.json({ error: friendlyAiError(e) }, { status: 500 });
        }
      },
    },
  },
});
