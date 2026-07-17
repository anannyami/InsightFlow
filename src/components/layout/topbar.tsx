import { useRouterState, Link } from "@tanstack/react-router";
import { Bell, Menu, MessageSquare, Moon, Search, Sun, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/repositories": "Repositories",
  "/ai-insights": "AI Insights",
  "/deployments": "Deployments",
  "/analytics": "Analytics",
  "/team": "Team",
  "/tasks": "Tasks",
  "/notifications": "Notifications",
  "/reports": "Reports",
  "/settings": "Settings",
  "/help": "Help",
};

export function TopBar({
  onOpenSearch,
  onOpenNotifications,
  onOpenMobileNav,
}: {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenMobileNav: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = routeTitles[pathname] ?? "InsightFlow";
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="hidden min-w-0 md:block">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Insightflow
          </Link>
          <span>/</span>
          <span className="text-foreground">{title}</span>
        </div>
      </div>

      <button
        onClick={onOpenSearch}
        className="group ml-auto flex h-9 max-w-md flex-1 items-center gap-2 rounded-xl border border-border/70 bg-card/40 px-3 text-left text-sm text-muted-foreground shadow-soft transition-colors hover:border-border hover:bg-card md:w-72 md:flex-none"
      >
        <Search className="h-4 w-4" />
        <span className="hidden truncate sm:inline">Search dashboards, repos, docs…</span>
        <span className="ml-auto hidden items-center gap-1 rounded-md border border-border/60 bg-background/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
          ⌘K
        </span>
      </button>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Messages">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl"
          onClick={onOpenNotifications}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-2 top-2 grid h-2 w-2 place-items-center rounded-full bg-primary shadow-glow"
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <button className="ml-1 flex items-center gap-2 rounded-xl border border-border/70 bg-card/40 px-2 py-1.5 text-sm shadow-soft transition-colors hover:border-border hover:bg-card">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-primary text-[10px] font-bold text-primary-foreground">
            IF
          </div>
          <span className="hidden text-xs font-medium sm:inline">Insightflow</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}