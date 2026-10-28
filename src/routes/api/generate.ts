import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { toolInputSchema, buildToolPrompt } = await import("@/lib/ai/prompts.server");
        const { streamWithGateway, friendlyAiError } = await import("@/lib/ai/gateway.server");

        const parsed = toolInputSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ error: "Please fill in the required fields." }, { status: 400 });
        }
        const { instructions, prompt } = buildToolPrompt(parsed.data);
        try {
          const { result, wrap } = streamWithGateway(
            request,
            [{ role: "user", content: prompt }],
            instructions,
          );
          return wrap(
            result.toUIMessageStreamResponse({ onError: (e) => friendlyAiError(e) }),
          );
        } catch (e) {
          return Response.json({ error: friendlyAiError(e) }, { status: 500 });
        }
      },
    },
  },
});
