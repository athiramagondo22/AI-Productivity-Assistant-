import { z } from "zod";

const RESPONSIBLE =
  "Be accurate and professional. Never invent facts, names, figures or dates that were not provided; if information is missing, use a clearly marked placeholder like [Name]. Format the answer in clean Markdown.";

export const toolInputSchema = z.discriminatedUnion("tool", [
  z.object({
    tool: z.literal("email"),
    fields: z.object({
      recipient: z.string().max(200),
      purpose: z.string().min(1).max(4000),
      keyPoints: z.string().max(4000),
      tone: z.enum(["Formal", "Friendly", "Persuasive"]),
      length: z.enum(["Short", "Medium", "Detailed"]),
    }),
  }),
  z.object({
    tool: z.literal("meeting"),
    fields: z.object({
      title: z.string().max(200),
      notes: z.string().min(1).max(30000),
    }),
  }),
  z.object({
    tool: z.literal("planner"),
    fields: z.object({
      period: z.enum(["Daily", "Weekly"]),
      hours: z.string().max(100),
      tasks: z.string().min(1).max(8000),
      constraints: z.string().max(2000),
    }),
  }),
  z.object({
    tool: z.literal("research"),
    fields: z.object({
      topic: z.string().min(1).max(30000),
      depth: z.enum(["Quick overview", "In-depth analysis"]),
      audience: z.string().max(200),
    }),
  }),
]);

export type ToolInput = z.infer<typeof toolInputSchema>;

export function buildToolPrompt(input: ToolInput): { instructions: string; prompt: string } {
  switch (input.tool) {
    case "email": {
      const f = input.fields;
      return {
        instructions: `You are an expert business communication writer. Write a complete, ready-to-send professional email. ${RESPONSIBLE}`,
        prompt: [
          "## Task: Write an email",
          `- Recipient: ${f.recipient || "[Recipient]"}`,
          `- Tone: ${f.tone}`,
          `- Length: ${f.length}`,
          `- Purpose: ${f.purpose}`,
          `- Key points to include:\n${f.keyPoints || "(none specified)"}`,
          "",
          "## Output format",
          "**Subject:** <subject line>",
          "",
          "<email body with greeting and sign-off>",
        ].join("\n"),
      };
    }
    case "meeting": {
      const f = input.fields;
      return {
        instructions: `You are a meticulous executive assistant who summarises meetings. Only extract what is stated in the notes. ${RESPONSIBLE}`,
        prompt: [
          `## Task: Summarise the meeting "${f.title || "Untitled meeting"}"`,
          "",
          "## Output format (use these exact headings)",
          "### Summary\n3-5 sentence overview.",
          "### Key Decisions\nBulleted list.",
          "### Action Items\nMarkdown table with columns: Task | Owner | Deadline. Use 'Unassigned' / 'Not specified' when missing.",
          "### Deadlines & Dates\nBulleted list.",
          "### Open Questions\nBulleted list (or 'None').",
          "",
          "## Meeting notes",
          f.notes,
        ].join("\n"),
      };
    }
    case "planner": {
      const f = input.fields;
      return {
        instructions: `You are a productivity coach skilled in time-blocking and prioritisation (Eisenhower matrix). ${RESPONSIBLE}`,
        prompt: [
          `## Task: Build a ${f.period.toLowerCase()} schedule`,
          `- Working hours: ${f.hours || "09:00-17:00"}`,
          `- Constraints / fixed commitments: ${f.constraints || "None"}`,
          "- Tasks (may include deadlines or estimates):",
          f.tasks,
          "",
          "## Output format",
          "### Priorities\nTable: Task | Priority (High/Medium/Low) | Reason.",
          `### ${f.period} Schedule\nTime-blocked table${f.period === "Weekly" ? " grouped by day" : ""}: Time | Task | Notes. Include short breaks.`,
          "### Tips\n2-3 short, practical tips.",
        ].join("\n"),
      };
    }
    case "research": {
      const f = input.fields;
      return {
        instructions: `You are a senior research analyst. Summarise clearly and give practical insights. State uncertainty openly and remind the user to verify facts against primary sources. Do not fabricate citations. ${RESPONSIBLE}`,
        prompt: [
          `## Task: ${f.depth} of the topic or article below`,
          `- Audience: ${f.audience || "Business professionals"}`,
          "",
          "## Output format",
          "### Summary",
          "### Key Points (bulleted)",
          "### Insights",
          "### Recommendations (numbered, actionable)",
          "### Things to Verify",
          "",
          "## Topic / article",
          f.topic,
        ].join("\n"),
      };
    }
  }
}

export const CHAT_INSTRUCTIONS = `You are "Workplace Assistant", a friendly, sharp AI assistant for professionals. Help with emails, meetings, planning, research, writing, and workplace questions. Be concise, structured, and practical. Use Markdown. ${RESPONSIBLE} If a request involves legal, medical, financial or HR decisions, recommend consulting a qualified professional.`;
