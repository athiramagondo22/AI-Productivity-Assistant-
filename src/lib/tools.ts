import { CalendarClock, FileText, Mail, MessagesSquare, Search, type LucideIcon } from "lucide-react";

export type ToolNav = {
  title: string;
  description: string;
  url: "/email" | "/meetings" | "/planner" | "/research" | "/chat";
  icon: LucideIcon;
};

export const TOOLS: ToolNav[] = [
  { title: "Email Generator", description: "Draft polished emails in a formal, friendly or persuasive tone.", url: "/email", icon: Mail },
  { title: "Meeting Summarizer", description: "Turn long notes into decisions, action items and deadlines.", url: "/meetings", icon: FileText },
  { title: "Task Planner", description: "Prioritise tasks and build a daily or weekly schedule.", url: "/planner", icon: CalendarClock },
  { title: "Research Assistant", description: "Summarise topics or articles with insights and recommendations.", url: "/research", icon: Search },
  { title: "AI Chat", description: "Ask your workplace assistant anything.", url: "/chat", icon: MessagesSquare },
];
