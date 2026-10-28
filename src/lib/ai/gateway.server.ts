import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const DEFAULT_MODEL = "openai/gpt-6-astra";

export function streamWithGateway(
  request: Request,
  messages: ModelMessage[],
  instructions: string,
) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("AI is not configured (missing LOVABLE_API_KEY).");

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(DEFAULT_MODEL),
    instructions,
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return {
    result,
    wrap: (response: Response) => withLovableAiGatewayRunIdHeader(response, runIdFetch),
  };
}

export function friendlyAiError(error: unknown): string {
  const anyErr = error as { statusCode?: number; message?: string } | undefined;
  const status = anyErr?.statusCode;
  if (status === 429) return "Too many requests right now. Please wait a moment and try again.";
  if (status === 402) return "AI credits have run out for this workspace. Please add credits to continue.";
  if (status === 403) return "AI access is currently blocked for this workspace.";
  return anyErr?.message || "Something went wrong while generating a response.";
}
