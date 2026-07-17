import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  GitBranch,
  Sparkles,
  Rocket,
  BarChart3,
  Users,
  KanbanSquare,
  Bell,
  FileText,
  Settings,
  LifeBuoy,
  MessageSquare,
  Terminal,
} from "lucide-react";
import { aiCommandExamples } from "@/lib/ai-mock";
import { openAiChat } from "@/lib/ai-chat-store";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/repositories", label: "Repositories", icon: GitBranch },
  { to: "/ai-insights", label: "AI Insights", icon: Sparkles },
  { to: "/deployments", label: "Deployments", icon: Rocket },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/team", label: "Team", icon: Users },
  { to: "/tasks", label: "Tasks", icon: KanbanSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help", icon: LifeBuoy },
] as const;

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const runAi = (prompt: string) => {
    onOpenChange(false);
    openAiChat(prompt);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search or ask InsightFlow AI in natural language…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Ask AI">
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              openAiChat();
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4 text-primary" />
            Open InsightFlow AI chat
          </CommandItem>
          {aiCommandExamples.slice(0, 5).map((c) => (
            <CommandItem key={c} onSelect={() => runAi(c)}>
              <Terminal className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="truncate">{c}</span>
              <span className="ml-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                AI
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.to}
                onSelect={() => {
                  onOpenChange(false);
                  navigate({ to: item.to });
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
