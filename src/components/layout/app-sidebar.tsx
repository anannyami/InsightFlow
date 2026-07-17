import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
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
  ChevronsUpDown,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/repositories", label: "Repositories", icon: GitBranch },
  { to: "/ai-insights", label: "AI Insights", icon: Sparkles, badge: "New" },
  { to: "/deployments", label: "Deployments", icon: Rocket },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/team", label: "Team", icon: Users },
  { to: "/tasks", label: "Tasks", icon: KanbanSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/reports", label: "Reports", icon: FileText },
] as const;

const bottomNav = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help", icon: LifeBuoy },
] as const;

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight">InsightFlow</div>
          <div className="truncate text-xs text-muted-foreground">Analytics · AI</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        <div className="px-2 pb-1 pt-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
          Workspace
        </div>
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className="group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              data-active={active}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-sidebar-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={`relative h-4 w-4 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
              />
              <span
                className={`relative flex-1 truncate font-medium ${active ? "text-sidebar-accent-foreground" : ""}`}
              >
                {item.label}
              </span>
              {"badge" in item && item.badge && (
                <span className="relative rounded-full bg-gradient-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="px-2 pb-1 pt-6 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
          Account
        </div>
        {bottomNav.map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className="group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-sidebar-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={`relative h-4 w-4 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
              />
              <span className="relative flex-1 truncate font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-sidebar-border bg-card/50 p-3">
        <button className="flex w-full items-center gap-3 text-left">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white shadow-soft">
            AM
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Anannya Mitra</div>
            <div className="truncate text-xs text-muted-foreground">Owner · Insightflow</div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
}